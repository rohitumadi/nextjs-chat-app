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
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { useUser } from "@clerk/nextjs";

import { Separator } from "@/components/ui/separator";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CircleX, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SearchedUser from "./SearchedUser";
type User = {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  username: string;
  imageUrl: string;
  clerkId: string;
};
type Props = {};

const AddFriendDialog = (props: Props) => {
  const { mutate: sendRequest, pending } = useMutationState(
    api.request.sendRequest,
  );
  const friends = useQuery(api.friends.getFriends);
  const friendsEmailList = friends?.map((friend) => friend.email);

  const friendsEmailSet = new Set(friendsEmailList);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User[]>([]);
  const [selectedUserSet, setSelectedUserSet] = useState<Set<String>>(
    new Set(),
  );
  const currentUser = useUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useQuery(
    api.user.searchUsersByUsername,
    debouncedSearchTerm.length >= 3
      ? { username: debouncedSearchTerm }
      : "skip",
  );
  function handleSelectUser(user: User) {
    setSelectedUser((prev: User[]) => [...prev, user]);
    setSelectedUserSet((prev) => prev.add(user.email));
    setSearchTerm("");
    setDebouncedSearchTerm("");
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
    try {
      await sendRequest({
        emails: selectedUser.map((user) => user.email),
      });
      toast.success("Friend request sent");
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
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <UserPlusIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Friends</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friends</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <span className="mb-4">
            Send a friend request to your friends by entering their username
          </span>
        </DialogDescription>
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
            {searchResults &&
              searchResults.length > 0 &&
              searchResults.some(
                (user) =>
                  !selectedUserSet.has(user.email) &&
                  currentUser.user?.emailAddresses[0].emailAddress !==
                    user.email,
              ) && (
                <div>
                  <ScrollArea className="h-full px-3 py-2 w-full rounded-md border">
                    {searchResults.map((user, index) => {
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
                            friend={friendsEmailSet.has(user.email)}
                            handleSelectUser={handleSelectUser}
                          />
                          {searchResults.length - 1 !== index && (
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
              Send Friend Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AddFriendDialog;
