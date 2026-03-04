export type Platform = "facebook" | "instagram";

export type ConnectedPage = {
  id: string;
  page_id: string;
  page_name: string | null;
  platform: Platform;
  created_at?: string;
  updated_at?: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  page_id: string;
  sender_id: string;
  sender_name: string | null;
  avg_response_time_seconds: number | null;
  platform: Platform;
  last_message_at: string | null;
  created_at: string;
  connected_pages?: {
    page_name: string | null;
    platform: Platform;
  } | null;
};

export type Message = {
  id: string;
  message_id: string;
  sender_id: string;
  replied_by: string | null;
  text: string | null;
  platform: Platform;
  is_from_customer: boolean;
  timestamp: string | null;
  created_at: string;
};

export type PageMemberRole = "admin" | "member";

export type PageMember = {
  id: string;
  page_id: string;
  user_id: string;
  role: PageMemberRole;
  invited_by: string | null;
  created_at: string;
  email?: string;
  display_name?: string;
};

export type PageMembersResponse = { members: PageMember[] };
export type InviteMemberResponse = { member: PageMember };

export type EmployeeStat = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  reply_count: number;
  conversation_count: number;
  avg_response_time_seconds: number | null;
};

export type ResponseTimeStatsResponse = {
  page_id: string;
  stats: EmployeeStat[];
};

export type ApiError = { error: string };

export type PagesResponse = { pages: ConnectedPage[] };
export type ConversationsResponse = { conversations: Conversation[] };
export type ConversationMessagesResponse = {
  conversation: Pick<Conversation, "id" | "page_id" | "sender_id" | "sender_name" | "platform">;
  messages: Message[];
};
export type SendMessageResponse = { ok: true; messageId: string };
export type OAuthConnectResponse = { url: string };
