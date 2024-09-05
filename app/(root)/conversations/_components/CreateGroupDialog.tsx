"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useMutationState } from "@/hooks/useMutationState";
import { useUser } from "@clerk/nextjs";

import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CircleX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SearchedUser from "../../friends/_components/SearchedUser";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type User = {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  username: string;
  imageUrl: string;
  clerkId: string;
};
const CreateGroupDialog = () => {
  const { mutate: createGroup, pending } = useMutationState(
    api.conversation.createGroupConversation
  );
  const [groupName, setGroupName] = useState("");
  const fetchedFriends = useQuery(api.friends.getFriends);

  const [friendsList, setFriendsList] = useState(fetchedFriends);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState<User[]>([]);
  const [selectedUserSet, setSelectedUserSet] = useState<Set<String>>(
    new Set()
  );
  const currentUser = useUser();

  useEffect(() => {
    setFriendsList(fetchedFriends);
  }, [fetchedFriends]);

  useEffect(() => {
    const filteredFriendsList = friendsList?.filter((friend) =>
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFriendsList(filteredFriendsList);
  }, [searchTerm]);

  function handleSelectUser(user: User) {
    setSelectedUser((prev: User[]) => [...prev, user]);
    setSelectedUserSet((prev) => prev.add(user.email));
    setSearchTerm("");
  }
  function handleRemoveUser(user: User) {
    setSelectedUser((prev: User[]) => prev.filter((u) => u._id !== user._id));
    setSelectedUserSet((prev) => {
      const newSet = new Set(prev);
      newSet.delete(user.email);
      return newSet;
    });
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedUser.length < 2) {
      toast.error("Please select at least two friend");
      return;
    }
    if (groupName.length === 0) {
      toast.error("Please enter a group name");
      return;
    }
    try {
      await createGroup({
        name: groupName,
        memberId: selectedUser.map((user) => user._id),
      });
      toast.success("Group created");
      setSelectedUser([]);
      setSelectedUserSet(new Set());
      setGroupName("");
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data);
      }
      console.error(error);
    }
  };
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="outline" size="icon">
            <DialogTrigger>
              <Users className="w-4 h-4" />
            </DialogTrigger>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Create Group</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group Members</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="mb-4">Add a friend by entering their email address</p>
          <form onSubmit={onSubmit} className="space-y-6">
            <>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Input placeholder="Enter username" />

              {selectedUser.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUser.map((user) => {
                    return (
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
                    );
                  })}
                </div>
              )}

              {friendsList &&
                friendsList.length > 0 &&
                friendsList.some(
                  (user) =>
                    !selectedUserSet.has(user.email) &&
                    currentUser.user?.emailAddresses[0].emailAddress !==
                      user.email
                ) && (
                  <div>
                    <ScrollArea className="h-full px-3 py-2 w-full rounded-md border">
                      {friendsList.map((user, index) => {
                        if (
                          selectedUserSet.has(user.email) ||
                          currentUser.user?.emailAddresses[0].emailAddress ===
                            user.email
                        ) {
                          return null;
                        }
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
                      })}
                    </ScrollArea>
                  </div>
                )}
            </>

            <DialogFooter>
              <Button disabled={pending} type="submit">
                Create Group
              </Button>
            </DialogFooter>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default CreateGroupDialog;
