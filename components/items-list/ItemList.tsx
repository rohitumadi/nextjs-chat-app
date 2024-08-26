"use client";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { useConversation } from "@/hooks/useConversation";

type Props = {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
};
const ItemList = ({ children, title, action }: Props) => {
  const { isActive } = useConversation();
  return (
    <Card
      className={cn("hidden w-full h-full lg:w-80 p-2", {
        block: !isActive,
        "lg:block": isActive,
      })}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {action && action}
      </div>
      <div className="flex flex-col gap-2   h-full">{children}</div>
    </Card>
  );
};
export default ItemList;
