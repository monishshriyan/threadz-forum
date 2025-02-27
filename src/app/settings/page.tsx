import { redirect } from "next/navigation";

import { UserNameForm } from "@/components/UserNameForm";
import { authOptions, getAuthSession } from "@/lib/auth";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function SettingsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions?.pages?.signIn || "/login");
  }

  return (
    // <div className="flex items-center justify-center w-screen">
    //   <div className="w-full py-12">
    //     <div className="grid items-start gap-8">
    //       <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>

    //       <div className="grid gap-10">
    //         <UserNameForm
    //           user={{
    //             id: session.user.id,
    //             username: session.user.username || "",
    //           }}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <UserNameForm
      className="pt-12"
      user={{
        id: session.user.id,
        username: session.user.username || "",
      }}
    />
  );
}
