import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Icons } from "./Icons";
import { Button, buttonVariants } from "./ui/Button";
import { UserAccountNav } from "./UserAccountNav";
import SearchBar from "./SearchBar";
import Image from "next/image";
import ThreadzText from "@/assets/threadz-wordmark-logo.svg";
import ThreadzMobile from "@/assets/threadz-letter.svg";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import UserAuthForm from "@/components/UserAuthForm";
import { UserNameForm } from "@/components/UserNameForm";
import { UserRoundCog } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

//command dialog

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="fixed top-0 inset-x-0 py-2 container flex items-center justify-center z-50 ">
      <div className="border bg-muted/70 backdrop-blur-md h-16 flex items-center justify-between gap-3 md:rounded-xl rounded-full md:px-5 px-3 mt-2 sm:mt-4 w-full">
        {/* logo */}
        <div className="flex gap-2 items-center">
          <Link
            href={"/"}
            className="flex flex-row gap-3 justify-center items-center"
          >
            <Image
              src={ThreadzMobile}
              alt="threadz-logo"
              className="h-10 w-10 lg:hidden dark:invert"
            />
            <Image
              src={ThreadzText}
              alt="threadz-wordmark"
              className="h-9 w-full hidden lg:block dark:invert"
            />
          </Link>
        </div>

        <div className="flex flex-row gap-4 justify-end items-center w-full">
          {/* search bar */}
          <SearchBar />
          <div className="hidden lg:flex">
          <ThemeToggle />
          </div>
          {session?.user ? (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <UserRoundCog className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80%] max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Change username
                </DialogDescription>
              </DialogHeader>
              <UserNameForm
                user={{
                  id: session.user.id,
                  username: session.user.username || "",
                }}
              />
            </DialogContent>
          </Dialog>
          <UserAccountNav user={session.user} />
        </>
      ) : (
              <Dialog>
                <DialogTrigger className="" asChild>
                  <Button
                    variant="default"
                    className="rounded-full md:rounded-lg"
                  >
                    Join
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs md:max-w-lg w-[80%] rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Join</DialogTitle>
                    <DialogDescription>
                      By continuing, you are setting up a Threadz account and
                      agree to our User Agreement and Privacy Policy.
                    </DialogDescription>
                  </DialogHeader>
                  <UserAuthForm />
                  {/* <DialogFooter>
            
                  <p className="px-8 text-center text-sm text-muted-foreground">
                    Already a?{" "}
                    <Link
                      href="/sign-in"
                      className="hover:text-brand text-sm underline underline-offset-4"
                    >
                      Sign in
                    </Link>
                  </p>
                </DialogFooter> */}
                </DialogContent>
              </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
