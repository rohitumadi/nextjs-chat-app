import { Card } from "../ui/card";

type Props = {
  children: React.ReactNode;
};
const ConversationContainer = ({ children }: Props) => {
  return (
    <Card className="w-full h-[calc(100svh-32px)] lg:h-full  flex flex-col gap-2">
      {children}
    </Card>
  );
};
export default ConversationContainer;
