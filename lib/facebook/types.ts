export type FacebookWebhookPayload = {
  object?: "page" | "instagram" | string;
  entry?: Array<{
    id?: string; // Page ID (Messenger) or IG business account ID (Instagram)
    time?: number;
    messaging?: Array<{
      sender?: { id?: string };
      recipient?: { id?: string };
      timestamp?: number;
      message?: {
        mid?: string;
        text?: string;
        attachments?: Array<{
          type?: string;
          payload?: { url?: string };
        }>;
        is_echo?: boolean;
      };
    }>;
  }>;
};

export type GraphOAuthTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

export type GraphMeAccountsResponse = {
  data: Array<{
    id: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: {
      id: string;
      username?: string;
    };
  }>;
  paging?: unknown;
};

export type GraphSendMessageResponse = {
  recipient_id?: string;
  message_id?: string;
};

