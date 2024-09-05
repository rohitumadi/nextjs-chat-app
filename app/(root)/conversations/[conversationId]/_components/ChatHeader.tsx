import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CircleArrowLeft, GroupIcon, Settings, User } from "lucide-react";
import Link from "next/link";

type Props = {
  imageUrl: string;
  name: string;
  isGroup: boolean;
  options?: {
    label: string;
    onClick: () => void;
    destructive: boolean;
  }[];
};
const ChatHeader = ({ imageUrl, name, isGroup, options }: Props) => {
  return (
    <Card className="flex items-center justify-between gap-2 w-full p-2 ">
      <Link className="lg:hidden" href={`/conversations`}>
        <CircleArrowLeft className="w-6 h-6" />
      </Link>
      <div className="flex items-center gap-2">
        <Avatar>
          {isGroup ? <GroupIcon /> : <AvatarImage src={imageUrl} alt={name} />}
          <AvatarFallback>{isGroup ? <GroupIcon /> : <User />}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{name}</p>
        </div>
      </div>
      <div>
        {options && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {options.map((option, id) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={option.onClick}
                    className={cn(
                      "cursor-pointer font-semibold",
                      option.destructive ? "text-destructive" : ""
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
};
export default ChatHeader;
