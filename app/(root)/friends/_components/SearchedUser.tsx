import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  username: string;
  imageUrl: string;
  clerkId: string;
  friend: boolean;
  handleSelectUser: (user: any) => void;
};

const SearchedUser = ({
  _id,
  email,
  imageUrl,
  handleSelectUser,
  username,
  clerkId,
  friend,
}: Props) => {
  return (
    <div
      key={_id}
      className={`flex items-center px-3 py-2 gap-2 ${
        friend
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-secondary"
      }`}
      onClick={() => {
        if (!friend) {
          handleSelectUser({ _id, email, imageUrl, username, clerkId });
        }
      }}
    >
      <img
        className="rounded-full"
        src={imageUrl}
        alt={"user image"}
        width={32}
        height={32}
      />
      <p>{email}</p>
      {friend && <Badge>Friend</Badge>}
    </div>
  );
};
export default SearchedUser;
