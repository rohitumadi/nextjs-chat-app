"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConversation } from "@/hooks/useConversation";
import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import Message from "./Message";

type Props = {};
const ChatBody = (props: Props) => {
  const { conversationId } = useConversation();
  const messagesWithUser = useQuery(api.messages.getMessages, {
    conversationId: conversationId as Id<"conversations">,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesWithUser]);

  return (
    <div className="flex-1 overflow-y-scroll p-2">
      {messagesWithUser?.map((message, index) => (
        <Message
          fromCurrentUser={message.isCurrentUser}
          content={message.message.content}
          senderImageUrl={message.senderImageUrl}
          senderName={message.senderName}
          //check last by user image for more understanding
          lastByUser={
            messagesWithUser[index - 1]?.message.senderId ===
            messagesWithUser[index]?.message.senderId
          }
          createdAt={message.message.createdAt}
          type={message.message.type}
          key={message.message._id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
export default ChatBody;
