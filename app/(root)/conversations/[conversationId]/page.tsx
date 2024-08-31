"use client";
import ConversationContainer from "@/components/conversations/ConversationContainer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import ChatBody from "./_components/chatBody/ChatBody";
import Header from "./_components/Header";
import ChatInput from "./_components/input/ChatInput";

type Props = {};
const ConversationPage = (props: Props) => {
  const { conversationId } = useParams();
  const conversation = useQuery(api.conversation.getConversationById, {
    conversationId: conversationId as Id<"conversations">,
  });
  const otherUser = conversation?.otherUser;
  const isGroup = conversation?.conversation.isGroup;
  const name = isGroup ? conversation?.conversation.name : otherUser?.username;
  const imageUrl = isGroup
    ? conversation?.conversation?.imageUrl
    : otherUser?.imageUrl;

  return (
    <ConversationContainer>
      {conversation ? (
        <>
          <Header imageUrl={imageUrl || ""} name={name || ""} />
          <ChatBody />
          <ChatInput />
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          Conversation not found
        </div>
      )}
    </ConversationContainer>
  );
};
export default ConversationPage;
