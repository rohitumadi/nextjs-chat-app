import Image from "next/image";

type Props = {
  size?: number;
};
const Loader = ({ size = 100 }: Props) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={size}
        height={size}
        className="animate-pulse duration-500"
      />
    </div>
  );
};
export default Loader;
