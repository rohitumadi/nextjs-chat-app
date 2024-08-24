import { useParams } from "next/navigation";

export const useConversation = () => {
  const params = useParams();
  const conversationId = params?.conversationId;
  const isActive = !!conversationId;
  return {
    isActive,
    conversationId,
  };
};
