import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export const useNavigation = () => {
  const pathname = usePathname();
  const requestsCount = useQuery(api.requests.getRequests)?.length || 0;
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
      count: requestsCount,
    },
  ];
  return paths;
};
