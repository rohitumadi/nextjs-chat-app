import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export const useNavigation = () => {
  const pathname = usePathname();
  const paths = [
    {
      name: "Conversations",
      href: "/conversations",
      icon: <MessageSquare />,
      active: pathname.startsWith("/conversations"),
    },
    {
      name: "Friends",
      href: "/friends",
      icon: <Users />,
      active: pathname === "/friends",
    },
  ];
  return paths;
};
