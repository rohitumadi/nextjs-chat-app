"use client";
import ItemList from "@/components/items-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import PrivateChat from "./_components/PrivateChat";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupChat from "./_components/GroupChat";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};
const ConversationLayout = ({ children }: Props) => {
  const conversations = useQuery(api.conversations.getConversations);
  conversations?.sort(
    (a, b) => b.conversation.lastModifiedAt - a.conversation.lastModifiedAt
  );
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  return (
    <>
      <ItemList
        title="Conversations"
        action={
          <CreateGroupDialog
            open={createGroupDialogOpen}
            setOpen={setCreateGroupDialogOpen}
          />
        }
      >
        {conversations ? (
          conversations.length === 0 ? (
            <p className="flex items-center justify-center">
              No conversations found
            </p>
          ) : (
            conversations.map((conversation) =>
              conversation.conversation.isGroup ? (
                <GroupChat
                  key={conversation.conversation._id}
                  id={conversation.conversation._id}
                  name={conversation.conversation.name || ""}
                  lastMessage={conversation.lastMessage?.message.content[0]}
                  lastMessageBy={
                    conversation.lastMessage?.messageSender.username
                  }
                />
              ) : (
                <PrivateChat
                  lastMessage={conversation.lastMessage?.message.content[0]}
                  key={conversation.conversation._id}
                  id={conversation.conversation._id}
                  imageUrl={conversation!.otherUser!.imageUrl}
                  username={conversation!.otherUser!.username}
                />
              )
            )
          )
        ) : (
          <Loader2 />
        )}
      </ItemList>
      {children}
    </>
  );
};
export default ConversationLayout;
