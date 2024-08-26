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
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "convex/react";
import { CircleX, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import SearchedUser from "./SearchedUser";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
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
    api.request.sendRequest
  );
  const friendsEmailList = useQuery(api.friends.getFriends);
  const friendsEmailSet = new Set(friendsEmailList);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User[]>([]);
  const [selectedUserSet, setSelectedUserSet] = useState<Set<String>>(
    new Set()
  );
  const currentUser = useUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useQuery(
    api.user.searchUsersByEmail,
    debouncedSearchTerm.length >= 3 ? { email: debouncedSearchTerm } : "skip"
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
        <TooltipTrigger>
          <Button variant="outline" size="icon">
            <DialogTrigger>
              <UserPlusIcon className="w-4 h-4" />
            </DialogTrigger>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Friends</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friends</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="mb-4">
            Send a friend request to your friends by entering their email
            address
          </p>
          <form onSubmit={onSubmit} className="space-y-6">
            <>
              <Input
                placeholder="Enter email"
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
                      {user.email}

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
                      user.email
                ) && (
                  <div>
                    <ScrollArea className="h-full px-3 py-2 w-full rounded-md border">
                      {searchResults.map((user) => {
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
                            <Separator className="my-2" />
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
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default AddFriendDialog;
