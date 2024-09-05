import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { Users } from "lucide-react";
import Link from "next/link";

type Props = {
  id: Id<"conversations">;
  name: string;
  lastMessage?: string;
  lastMessageBy?: string;
};
const GroupChat = ({ id, name, lastMessage, lastMessageBy }: Props) => {
  return (
    <Link href={`/conversations/${id}`} className=" flex items-center gap-2 ">
      <Card className="flex items-center  gap-2 w-full p-2 hover:bg-accent">
        <Avatar>
          <AvatarFallback>
            <Users />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col truncate ">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage && `${lastMessageBy}:${lastMessage}`}
          </p>
        </div>
      </Card>
    </Link>
  );
};
export default GroupChat;
