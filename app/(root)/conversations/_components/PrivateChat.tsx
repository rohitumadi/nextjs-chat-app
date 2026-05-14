"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { useConversation } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";

type Props = {
  id: Id<"conversations">;
  imageUrl: string;
  username: string;
  lastMessage?: string;
};
const PrivateChat = ({ id, imageUrl, username, lastMessage }: Props) => {
  const { conversationId } = useConversation();
  const isSelected = conversationId === id;

  return (
    <Link
      href={`/conversations/${id}`}
      aria-current={isSelected ? "page" : undefined}
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        size="sm"
        className={cn(
          "w-full flex-row items-center gap-3 rounded-lg border-0 bg-transparent p-3 ring-1 ring-transparent transition-colors hover:bg-accent/70 hover:ring-border/70",
          isSelected && "bg-accent text-accent-foreground ring-border"
        )}
      >
        <Avatar size="lg">
          <AvatarImage src={imageUrl} alt={username} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold capitalize leading-5">
            {username}
          </p>
          <p
            className={cn(
              "truncate text-sm leading-5 text-muted-foreground",
              !lastMessage && "italic"
            )}
          >
            {lastMessage || "No messages yet"}
          </p>
        </div>
      </Card>
    </Link>
  );
};
export default PrivateChat;
