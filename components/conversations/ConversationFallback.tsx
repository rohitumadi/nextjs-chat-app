import { Card } from "../ui/card";

type Props = {};
const ConversationFallback = (props: Props) => {
  return (
    <Card className="hidden lg:flex items-center justify-center h-full w-full bg-secondary text-secondary-foreground p-2">
      Select a conversation or start a new one
    </Card>
  );
};
export default ConversationFallback;
