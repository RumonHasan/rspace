import { Query } from 'node-appwrite';
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from '@/config';
import { Workspace } from './types';
import { createSessionClient } from '@/lib/appwrite';

// server side call for fetching the workspaces according to user id
export const getWorkspaces = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const currentUser = await account.get();

    // fetching the respective workspaces based on members
    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal('userId', currentUser.$id),
    ]);
    if (members.total === 0) {
      return { documents: [], total: 0 };
    }
    const workspaceIds = members.documents.map((member) => member.workspaceId);
    // getting teh specific workspaces where the user is part of
    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)]
    );
    return workspaces;
  } catch {
    return { documents: [], total: 0 };
  }
};

// will only fetch specified details of the particular workspace when passed through the invite link
interface GetWorkspaceJoinDetailsProps {
  workspaceId: string;
}
// only shows the name of the particular workspace
export const getWorkspaceJoinDetails = async ({
  workspaceId,
}: GetWorkspaceJoinDetailsProps) => {
  try {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );
    return { name: workspace.name };
  } catch {
    return null;
  }
};
