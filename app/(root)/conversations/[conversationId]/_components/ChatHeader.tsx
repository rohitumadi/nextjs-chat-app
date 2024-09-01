import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CircleArrowLeft, GroupIcon, User } from "lucide-react";
import Link from "next/link";

type Props = {
  imageUrl: string;
  name: string;
  isGroup: boolean;
};
const ChatHeader = ({ imageUrl, name, isGroup }: Props) => {
  return (
    <Card className="flex items-center justify-between gap-2 w-full p-2 ">
      <div className="flex items-center gap-2">
        <Avatar>
          {isGroup ? <GroupIcon /> : <AvatarImage src={imageUrl} alt={name} />}
          <AvatarFallback>{isGroup ? <GroupIcon /> : <User />}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{name}</p>
        </div>
      </div>
      <Link className="lg:hidden" href={`/conversations`}>
        <CircleArrowLeft className="w-6 h-6" />
      </Link>
    </Card>
  );
};
export default ChatHeader;
