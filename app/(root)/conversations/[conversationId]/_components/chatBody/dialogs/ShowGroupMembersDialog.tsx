"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useMutationState } from "@/hooks/useMutationState";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { User, X } from "lucide-react";

import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Props = {
  conversationId: Id<"conversations">;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
const ShowGroupMembersDialog = ({ conversationId, open, setOpen }: Props) => {
  const currentUser = useUser();
  const currentUserDetails = useQuery(api.user.getUserByClerkId, {
    clerkId: currentUser!.user!.id,
  });
  const currentUserId = currentUserDetails?._id;
  const conversation = useQuery(api.conversation.getConversationById, {
    conversationId: conversationId as Id<"conversations">,
  });
  const { mutate: removeFriendsFromGroup, pending } = useMutationState(
    api.conversation.removeFriendsFromGroup
  );
  const groupMembers = conversation?.otherMembers;
  async function handleRemoveFriend(friendId: Id<"users">) {
    try {
      await removeFriendsFromGroup({
        conversationId: conversationId as Id<"conversations">,
        friendId: friendId,
      });
      toast.success("Friend removed from group");
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data);
      }
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription className="p-2">
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
                    {member._id !== conversation?.conversation.adminId &&
                      currentUserId === conversation?.conversation.adminId && (
                        <div className="ml-auto">
                          <Button
                            disabled={pending}
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveFriend(member._id)}
                          >
                            <X />
                          </Button>
                        </div>
                      )}
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
