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
  // seen: boolean;
  createdAt: number;
  type: string;
};
const Message = ({
  fromCurrentUser,
  content,
  senderImageUrl,
  senderName,
  // seen,
  createdAt,
  type,
}: Props) => {
  const formatTime = (timeStamp: number) => {
    return format(timeStamp, "hh:mm a");
  };
  return (
    <div
      className={cn("flex flex-items-end", fromCurrentUser && "justify-end")}
    >
      <ChatMessageList>
        <ChatBubble variant={fromCurrentUser ? "sent" : "received"}>
          <ChatBubbleAvatar src={senderImageUrl} />
          <ChatBubbleMessage variant={fromCurrentUser ? "sent" : "received"}>
            {!fromCurrentUser && (
              <p className="text-xs capitalize font-semibold text-primary ">
                {senderName}
              </p>
            )}
            <p className="">{content}</p>
            <ChatBubbleTimestamp
              className="text-[0.625rem] "
              timestamp={formatTime(createdAt)}
            />
            {/* {fromCurrentUser && (
              <CheckCheck color={seen ? "#4FB6EC" : undefined} />
            )} */}
          </ChatBubbleMessage>
        </ChatBubble>
      </ChatMessageList>
    </div>
  );
};
export default Message;
