"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConversation } from "@/hooks/useConversation";
import { useNavigation } from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const MobileNav = () => {
  const paths = useNavigation();
  const { isActive } = useConversation();
  if (isActive) return null;
  return (
    <Card className=" p-2  lg:hidden">
      <nav>
        <ul className="flex items-center justify-between gap-4">
          {paths.map((path, id) => (
            <li key={id}>
              <Link href={path.href}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant={path.active ? "default" : "outline"}
                      size="icon"
                      className="relative"
                    >
                      {path.icon}
                      {path.count !== undefined && path.count > 0 && (
                        <Badge className="absolute px-2  left-8 bottom-7">
                          {path.count}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{path.name}</TooltipContent>
                </Tooltip>
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
          <li>
            <UserButton />
          </li>
        </ul>
      </nav>
    </Card>
  );
};
export default MobileNav;
