"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConversation } from "@/hooks/useConversation";
import { useQuery } from "convex/react";
import Message from "./Message";

import { useMutationState } from "@/hooks/useMutationState";
import { useEffect, useRef } from "react";

type Props = {
  otherUsers: {
    lastSeenMessageId?: Id<"messages">;
    username?: string;
    [key: string]: any;
  }[];
};
const ChatBody = ({ otherUsers }: Props) => {
  const { conversationId } = useConversation();
  const messagesWithUser = useQuery(api.messages.getMessages, {
    conversationId: conversationId as Id<"conversations">,
  });
  // const { mutate: markAsRead, pending } = useMutationState(
  //   api.conversation.markRead
  // );

  // useEffect(() => {
  //   if (messagesWithUser?.length) {
  //     markAsRead({
  //       conversationId: conversationId as Id<"conversations">,
  //       lastMessageId:
  //         messagesWithUser?.[messagesWithUser.length - 1]?.message._id,
  //     });
  //   }
  // }, [messagesWithUser?.length, conversationId]);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messagesWithUser]);

  function getSeenStatus(messageId: Id<"messages">) {
    console.log(otherUsers);
    const isSeen = otherUsers.every(
      (user) => user.lastSeenMessageId === messageId
    );
    return isSeen;
  }

  return (
    <div ref={chatBodyRef} className="flex-1 overflow-y-scroll p-2">
      {messagesWithUser?.map((message, index) => (
        <Message
          fromCurrentUser={message.isCurrentUser}
          content={message.message.content}
          senderImageUrl={message.senderImageUrl}
          senderName={message.senderName}
          createdAt={message.message.createdAt}
          type={message.message.type}
          key={message.message._id}
          // seen={getSeenStatus(message.message._id)}
        />
      ))}
    </div>
  );
};
export default ChatBody;
