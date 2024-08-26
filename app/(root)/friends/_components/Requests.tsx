import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { Check, User, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  id: Id<"requests">;
  imageUrl: string;
  username: string;
  email: string;
};
const Requests = ({ id, imageUrl, username, email }: Props) => {
  const { mutate: rejectRequest, pending: rejectPending } = useMutationState(
    api.request.rejectRequest
  );
  const { mutate: acceptRequest, pending: acceptPending } = useMutationState(
    api.request.acceptRequest
  );
  function handleRejectRequest() {
    rejectRequest({ id });
    toast.success("Request rejected");
  }
  function handleAcceptRequest() {
    acceptRequest({ id });
    toast.success("Request accepted");
  }
  return (
    <Card className="flex  items-center justify-between gap-2 p-2">
      <Avatar>
        <AvatarImage src={imageUrl} />
        <AvatarFallback>
          <User />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col truncate">
        <h3>{username}</h3>
        <p className="text-muted-foreground">{email}</p>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={acceptPending}
          size="icon"
          onClick={handleAcceptRequest}
        >
          <Check />
        </Button>
        <Button
          disabled={rejectPending}
          size="icon"
          variant="destructive"
          onClick={handleRejectRequest}
        >
          <X />
        </Button>
      </div>
    </Card>
  );
};
export default Requests;
