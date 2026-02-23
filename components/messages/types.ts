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
  text: string | null;
  platform: Platform;
  is_from_customer: boolean;
  timestamp: string | null;
  created_at: string;
};

export type ApiError = { error: string };

export type PagesResponse = { pages: ConnectedPage[] };
export type ConversationsResponse = { conversations: Conversation[] };
export type ConversationMessagesResponse = {
  conversation: Pick<Conversation, "id" | "page_id" | "sender_id" | "platform">;
  messages: Message[];
};
export type SendMessageResponse = { ok: true; messageId: string };
export type OAuthConnectResponse = { url: string };
