"use client";
import ItemList from "@/components/items-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import PrivateChat from "./_components/PrivateChat";

type Props = {
  children: React.ReactNode;
};
const ConversationLayout = ({ children }: Props) => {
  const conversations = useQuery(api.conversations.getConversations);
  return (
    <>
      <ItemList title="Conversations">
        {conversations ? (
          conversations.length === 0 ? (
            <p className="flex items-center justify-center">
              No conversations found
            </p>
          ) : (
            conversations.map((conversation) =>
              conversation.conversation.isGroup ? null : (
                <PrivateChat
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
