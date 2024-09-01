import { cn } from "@/lib/utils";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/src/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/src/components/ui/chat/chat-message-list";
import { format } from "date-fns";

type Props = {
  fromCurrentUser: boolean;
  content: string[];
  senderImageUrl: string;
  senderName: string;
  lastByUser: boolean;
  createdAt: number;
  type: string;
};
const Message = ({
  fromCurrentUser,
  content,
  senderImageUrl,
  senderName,
  lastByUser,
  createdAt,
  type,
}: Props) => {
  const formatTime = (timeStamp: number) => {
    return format(timeStamp, "hh:mm a");
  };
  return (
    <div
      className={cn(
        "flex flex-items-end",
        fromCurrentUser && "justify-end",
        lastByUser && "mb-2"
      )}
    >
      <ChatMessageList>
        <ChatBubble variant={fromCurrentUser ? "sent" : "received"}>
          <ChatBubbleAvatar src={senderImageUrl} />
          <ChatBubbleMessage variant={fromCurrentUser ? "sent" : "received"}>
           <p>{content}</p>
            <ChatBubbleTimestamp timestamp={formatTime(createdAt)} />
          </ChatBubbleMessage>
        </ChatBubble>
      </ChatMessageList>
    </div>
  );
};
export default Message;
