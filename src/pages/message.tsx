import { type NextPage } from "next";
import { useRouter } from "next/router";
import ChatLayout from "~/components/layouts/ChatLayout";

const Message: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <ChatLayout />
    </>
  );
};

export default Message;
