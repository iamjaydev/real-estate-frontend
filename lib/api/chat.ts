import { apiClient } from "./client";

export async function sendChatMessage(data: {
    conversation_id: number | null;
    message: string;
    polygon: number[][] | null;
}) {
    return apiClient("/chat", {
        method: "POST",
        body: JSON.stringify(data),
    });
}