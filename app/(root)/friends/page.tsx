import ConversationFallback from "@/components/conversations/ConversationFallback";
import ItemList from "@/components/items-list/ItemList";

type Props = {};
const FriendsPage = (props: Props) => {
  return (
    <>
      <ItemList title="Friends">Friends</ItemList>
      <ConversationFallback />
    </>
  );
};
export default FriendsPage;
