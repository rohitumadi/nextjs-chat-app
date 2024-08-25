import ConversationFallback from "@/components/conversations/ConversationFallback";
import ItemList from "@/components/items-list/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";

type Props = {};
const FriendsPage = (props: Props) => {
  return (
    <>
      <ItemList title="Friends" action={<AddFriendDialog />}>
        Friends
      </ItemList>
      <ConversationFallback />
    </>
  );
};
export default FriendsPage;
