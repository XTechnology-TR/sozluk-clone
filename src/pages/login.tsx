import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { LoginForm } from "~/components/forms/index";
import { FormLayout } from "~/components/layouts";

const Login: NextPage = () => {
  return (
    <>
      <FormLayout>
        <LoginForm />
      </FormLayout>
    </>
  );
};

export default Login;
