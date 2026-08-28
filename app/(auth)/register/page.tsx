import { redirect } from "next/navigation";
import { Suspense } from "react";

import SignupForm from "@/components/auth/signup-form";
import { getSession } from "@/lib/session";

async function RegisterPageContent() {
  const session = await getSession();
  if (session) {
    return redirect("/");
  }
  return <SignupForm />;
}

function Register() {
  return (
    <Suspense fallback={<SignupForm />}>
      <RegisterPageContent />
    </Suspense>
  );
}

export default Register;