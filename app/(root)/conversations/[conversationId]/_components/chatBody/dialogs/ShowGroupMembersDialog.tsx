"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { User } from "lucide-react";

import { Dispatch, SetStateAction } from "react";

type Props = {
  conversationId: Id<"conversations">;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
const ShowGroupMembersDialog = ({ conversationId, open, setOpen }: Props) => {
  const conversation = useQuery(api.conversation.getConversationById, {
    conversationId: conversationId as Id<"conversations">,
  });
  const groupMembers = conversation?.otherMembers;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription className="">
            <ScrollArea className="border rounded-lg">
              {groupMembers?.map((member) => (
                <>
                  <div
                    className="flex items-center p-2 gap-x-6"
                    key={member._id}
                  >
                    <Avatar>
                      <AvatarImage
                        src={member.imageUrl}
                        alt={member.username}
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold capitalize">
                      {member.username}
                    </p>
                    {member._id === conversation?.conversation.adminId && (
                      <p className="text-sm font-semibold capitalize text-primary">
                        Admin
                      </p>
                    )}
                  </div>
                  <Separator />
                </>
              ))}
            </ScrollArea>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
export default ShowGroupMembersDialog;
