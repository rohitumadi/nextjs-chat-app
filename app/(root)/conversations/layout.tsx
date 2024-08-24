import ItemList from "@/components/items-list/ItemList";

type Props = {
  children: React.ReactNode;
};
const layout = ({ children }: Props) => {
  return (
    <>
      <ItemList title="Conversations">Conversations</ItemList>
      {children}
    </>
  );
};
export default layout;
