import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "lucide-react";
import Link from "next/link";

type Props = {
  id: Id<"conversations">;
  imageUrl: string;
  username: string;
  lastMessage?: string;
};
const PrivateChat = ({ id, imageUrl, username, lastMessage }: Props) => {
  return (
    <Link href={`/conversations/${id}`} className=" flex items-center  gap-2 ">
      <Card className="flex items-center  gap-2 w-full p-2 hover:bg-accent">
        <Avatar>
          <AvatarImage src={imageUrl} alt={username} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-semibold capitalize">{username}</p>
          <p className="text-sm text-muted-foreground">{lastMessage}</p>
        </div>
      </Card>
    </Link>
  );
};
export default PrivateChat;
