import SidebarWrapper from "@/components/sidebar/SidebarWrapper";

type Props = {
  children: React.ReactNode;
};
const FriendsLayout = ({ children }: Props) => {
  return <SidebarWrapper>{children}</SidebarWrapper>;
};
export default FriendsLayout;
