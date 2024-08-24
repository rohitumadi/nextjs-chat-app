import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";

type Props = {
  children: React.ReactNode;
};
const SidebarWrapper = ({ children }: Props) => {
  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 lg:flex-row">
      <DesktopNav />
      <main className="h-[calc(100%-80px)] lg:h-full w-full flex gap-4">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};
export default SidebarWrapper;
