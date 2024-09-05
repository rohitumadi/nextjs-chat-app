"use client";

import ConversationFallback from "@/components/conversations/ConversationFallback";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {};
function Error({ error }: { error: Error }) {
  const router = useRouter();
  useEffect(() => {
    router.push("/conversations");
  }, [router]);
  return <ConversationFallback />;
}
export default Error;
