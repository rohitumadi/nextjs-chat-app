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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "convex/react";
import { CircleX, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
const addFriendSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .min(1, { message: "Email is required" }),
});

const AddFriendDialog = (props: Props) => {
  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      email: "",
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User[]>([]);
  const [selectedUserSet, setselectedUserSet] = useState<Set<String>>(
    new Set()
  );

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
    setselectedUserSet((prev) => prev.add(user.email));
    setSearchTerm("");
    setDebouncedSearchTerm("");
    form.reset();
  }
  const onSubmit = (values: z.infer<typeof addFriendSchema>) => {
    console.log(values);
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
          Send a friend request to your friends by entering their email address
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <>
                        <Input
                          placeholder="Enter email"
                          {...field}
                          value={searchTerm}
                          onChange={(e) => {
                            field.onChange(e);
                            setSearchTerm(e.target.value);
                          }}
                        />
                        {selectedUser.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.map((user) => (
                              <Badge
                                key={user._id}
                                className="flex items-center gap-2"
                              >
                                <img
                                  src={user.imageUrl}
                                  alt=""
                                  className="w-4 h-4 rounded-full"
                                />
                                {user.email}

                                <CircleX className="w-4 h-4" />
                              </Badge>
                            ))}
                          </div>
                        )}
                        {searchResults &&
                          searchResults.length > 0 &&
                          searchResults.some(
                            (user) => !selectedUserSet.has(user.email)
                          ) && (
                            <div>
                              <ScrollArea className="h-fit px-3 py-2 w-fit rounded-md border">
                                {searchResults.map((user) => {
                                  if (selectedUserSet.has(user.email)) {
                                    return null;
                                  }
                                  return (
                                    <div key={user._id}>
                                      <SearchedUser
                                        {...user}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Send Friend Request</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default AddFriendDialog;
