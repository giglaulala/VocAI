import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdminClient>;

/**
 * Recalculates response times for all agent messages in a conversation and
 * updates both `messages.response_time_seconds` and
 * `conversations.avg_response_time_seconds`.
 *
 * Logic: for each agent reply, find the most recent customer message that
 * came before it and measure the gap. That gap is the employee's response time
 * for that reply. The conversation average is the mean across all such pairs.
 *
 * Called after every new agent message is stored (send API or webhook echo).
 * Safe to call multiple times — fully idempotent.
 */
export async function recalcResponseTime(
  supabaseAdmin: SupabaseAdmin,
  conversationId: string,
): Promise<void> {
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("id,is_from_customer,timestamp,replied_by")
    .eq("conversation_id", conversationId)
    .order("timestamp", { ascending: true });

  if (!messages || messages.length < 2) return;

  // Walk through the message list and match each agent reply to the
  // most recent customer message that preceded it.
  const updates: Array<{ id: string; response_time_seconds: number }> = [];
  let lastCustomerTs: number | null = null;

  for (const msg of messages) {
    if (!msg.timestamp) continue;

    if (msg.is_from_customer) {
      lastCustomerTs = new Date(msg.timestamp).getTime();
    } else if (lastCustomerTs !== null) {
      const agentTs = new Date(msg.timestamp).getTime();
      const diffSecs = Math.max(0, Math.round((agentTs - lastCustomerTs) / 1000));
      updates.push({ id: msg.id, response_time_seconds: diffSecs });
      // Reset so the next agent message isn't attributed to the same customer message.
      lastCustomerTs = null;
    }
  }

  if (updates.length === 0) return;

  // Persist response_time_seconds on each agent message.
  for (const u of updates) {
    await supabaseAdmin
      .from("messages")
      .update({ response_time_seconds: u.response_time_seconds })
      .eq("id", u.id);
  }

  // Persist the conversation-level average.
  const avg = Math.round(
    updates.reduce((sum, u) => sum + u.response_time_seconds, 0) / updates.length,
  );

  await supabaseAdmin
    .from("conversations")
    .update({ avg_response_time_seconds: avg })
    .eq("id", conversationId);
}

/** Formats seconds into a human-readable string e.g. "2m 30s" or "45s". */
export function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
