import { Models } from "node-appwrite";

export type Channel = Models.Document & {
    name?: string;
    membersId: string[];
    workspaceId: string;
    description?: string;
    identifier: string;
}