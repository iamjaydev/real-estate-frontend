import { apiClient } from "./client";


export interface Listing {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  address: string;
  lat: number;
  lng: number;
  image_urls?: string[];
}

export interface ChatMessageRequest {
  conversation_id: string | null;
  message: string;
  polygon: [number, number][] | null;
}

export interface ChatMessageResponse {
  conversation_id: string;
  reply: string;
  listings: Listing[];
}

export interface HistoricalMessage {
  id: string;
  sender: "user" | "assistant";
  message: string;
  created_at: string;
  listings?: Listing[];
}

export interface ConversationHistoryResponse {
  conversation_id: string;
  messages: HistoricalMessage[];
}


export function sendChatMessage(
  data: ChatMessageRequest
): Promise<ChatMessageResponse> {
  return apiClient("/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getConversationHistory(
  conversationId: string
): Promise<ConversationHistoryResponse> {
  return apiClient(`/chat/${conversationId}`, {
    method: "GET",
  });
}