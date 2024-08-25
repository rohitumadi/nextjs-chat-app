import { Id } from "@/convex/_generated/dataModel";

type Props = {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  username: string;
  imageUrl: string;
  clerkId: string;
  handleSelectUser: (user: any) => void;
};

const SearchedUser = ({
  _id,
  email,
  imageUrl,
  handleSelectUser,
  username,
  clerkId,
}: Props) => {
  return (
    <div
      key={_id}
      className="flex items-center cursor-pointer hover:bg-secondary px-3 py-2 gap-2"
      onClick={() =>
        handleSelectUser({ _id, email, imageUrl, username, clerkId })
      }
    >
      <img
        className="rounded-full"
        src={imageUrl}
        alt={"user image"}
        width={32}
        height={32}
      />
      <p>{email}</p>
    </div>
  );
};
export default SearchedUser;
