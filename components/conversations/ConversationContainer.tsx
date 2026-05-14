import { Card } from "../ui/card";

type Props = {
  children: React.ReactNode;
};
const ConversationContainer = ({ children }: Props) => {
  return (
    <Card className="h-[calc(100svh-32px)] min-h-0 w-full gap-0 overflow-hidden rounded-xl bg-card/95 p-0 shadow-sm lg:h-full">
      {children}
    </Card>
  );
};
export default ConversationContainer;
