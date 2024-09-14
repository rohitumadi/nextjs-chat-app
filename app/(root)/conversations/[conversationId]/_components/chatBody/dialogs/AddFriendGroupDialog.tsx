"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { useUser } from "@clerk/nextjs";

import { Separator } from "@/components/ui/separator";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import SearchedUser from "@/app/(root)/friends/_components/SearchedUser";
import { Dispatch, SetStateAction } from "react";

type Props = {
  conversationId: Id<"conversations">;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  otherMembers: Id<"users">[];
};
type User = {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  username: string;
  imageUrl: string;
  clerkId: string;
};
const AddFriendGroupDialog = ({
  conversationId,
  otherMembers,
  open,
  setOpen,
}: Props) => {
  const { mutate: addFriendsToGroup, pending } = useMutationState(
    api.conversation.addFriendsToGroup
  );
  const fetchedFriends = useQuery(api.friends.getFriends);
  const otherMemberSet = new Set(otherMembers);

  const friendsNotInGroup = fetchedFriends?.filter(
    (friend) => !otherMemberSet.has(friend._id)
  );

  const [friendsList, setFriendsList] = useState(friendsNotInGroup);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState<User[]>([]);
  const [selectedUserSet, setSelectedUserSet] = useState<Set<String>>(
    new Set()
  );

  const currentUser = useUser();

  useEffect(() => {
    if (searchTerm === "") {
      setFriendsList(friendsNotInGroup);
      return;
    }
    const filteredFriendsList = friendsList?.filter((friend) =>
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFriendsList(filteredFriendsList);
  }, [searchTerm]);

  function handleSelectUser(user: User) {
    setSelectedUser((prev: User[]) => [...prev, user]);
    setSelectedUserSet((prev) => prev.add(user._id));
    setSearchTerm("");
  }
  function handleRemoveUser(user: User) {
    setSelectedUser((prev: User[]) => prev.filter((u) => u._id !== user._id));
    setSelectedUserSet((prev) => {
      const newSet = new Set(prev);
      newSet.delete(user._id);
      return newSet;
    });
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addFriendsToGroup({
        conversationId,
        friendsIds: Array.from(selectedUserSet),
      });
      toast.success("Friends added to group");
      setSelectedUser([]);
      setSelectedUserSet(new Set());
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data);
      }
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friends to Group</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="mb-4">Add friends by entering their username</p>
          <form onSubmit={onSubmit} className="space-y-6">
            <>
              <Input
                placeholder="Enter username"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
              {selectedUser.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUser.map((user) => (
                    <Badge key={user._id} className="flex items-center gap-2">
                      <img
                        src={user.imageUrl}
                        alt=""
                        className="w-4 h-4 rounded-full"
                      />
                      {user.username}

                      <CircleX
                        onClick={() => handleRemoveUser(user)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </Badge>
                  ))}
                </div>
              )}
              {friendsList &&
                friendsList.length > 0 &&
                friendsList.some(
                  (user) =>
                    !selectedUserSet.has(user._id) &&
                    currentUser.user?.emailAddresses[0].emailAddress !==
                      user.email
                ) && (
                  <ScrollArea className="h-full px-3 py-2 w-full rounded-md border">
                    {friendsList.map((user, index) => {
                      if (
                        selectedUserSet.has(user._id) ||
                        currentUser.user?.emailAddresses[0].emailAddress ===
                          user.email ||
                        otherMemberSet.has(user._id)
                      ) {
                        return null;
                      } else {
                        return (
                          <div key={user._id}>
                            <SearchedUser
                              {...user}
                              addingInGroup={true}
                              handleSelectUser={handleSelectUser}
                            />
                            {friendsList.length - 1 !== index && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        );
                      }
                    })}
                  </ScrollArea>
                )}
            </>

            <DialogFooter>
              <Button disabled={pending} type="submit">
                Add Friend
              </Button>
            </DialogFooter>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default AddFriendGroupDialog;
