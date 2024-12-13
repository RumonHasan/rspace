import { Models } from "node-appwrite";

export type Chat = Models.Document & {
    message: string;
    userId: string;
    channelId: string;
    workspaceId: string;
    replyTo?: string;
}