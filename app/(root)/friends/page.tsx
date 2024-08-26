"use client";
import ConversationFallback from "@/components/conversations/ConversationFallback";
import ItemList from "@/components/items-list/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Requests from "./_components/Requests";

type Props = {};
const FriendsPage = (props: Props) => {
  //if someonse sends another request this variable will be updated
  //automatically by convex as it maintains a real time connection using the websocket
  const requests = useQuery(api.requests.getRequests);
  return (
    <>
      <ItemList title="Friends" action={<AddFriendDialog />}>
        {requests && requests.length === 0 ? (
          <div className="text-center text-gray-500">No friends yet</div>
        ) : (
          requests?.map((request) => (
            <Requests
              key={request.request.senderId}
              id={request.request._id}
              imageUrl={request.sender.imageUrl}
              username={request.sender.username}
              email={request.sender.email}
            />
          ))
        )}
      </ItemList>
      <ConversationFallback />
    </>
  );
};
export default FriendsPage;
