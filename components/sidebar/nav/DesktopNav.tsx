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
import { useNavigation } from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const DesktopNav = () => {
  const paths = useNavigation();

  return (
    <Card className="hidden lg:px-2 lg:w-16 lg:flex-col lg:justify-between lg:py-4 lg:items-center lg:flex">
      <nav>
        <ul className="flex flex-col gap-4">
          {paths.map((path, id) => (
            <li key={id}>
              <Link href={path.href}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant={path.active ? "default" : "outline"}
                      className="relative"
                      size="icon"
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
        </ul>
      </nav>
      <div className="flex flex-col gap-4">
        <ThemeToggle />
        <UserButton />
      </div>
    </Card>
  );
};
export default DesktopNav;
