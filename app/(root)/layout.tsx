import SidebarWrapper from "@/components/sidebar/SidebarWrapper";

type Props = {
  children: React.ReactNode;
};
const layout = ({ children }: Props) => {
  return <SidebarWrapper>{children}</SidebarWrapper>;
};
export default layout;
