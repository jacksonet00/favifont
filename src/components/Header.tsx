import { useUser } from "@/providers/UserProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { getAnalytics, logEvent } from "firebase/analytics";
import Image from "next/image";
import { useRouter } from "next/router";
import GAuthButton from "./GAuthButton";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

function UserProfile() {
  const {
    user,
    signOut
  } = useUser();

  if (!user) {
    return (
      <div>
        <GAuthButton />
      </div>
    );
  }

  let source = user.displayImage;
  if (user.displayImage === "DEFAULT_PFP") {
    source = "/images/default-pfp.jpg";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={source} alt="your pfp" />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Button onClick={signOut}>Log out ➚</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  );
}

function FaviFontLogo() {
  const router = useRouter();

  function handleClickLogo() {
    logEvent(getAnalytics(), "click-navbar-logo");
    router.push("/");
  }

  return (
    <>
      <button className="btn btn-ghost text-xl flex items-center justify-center w-full" onClick={handleClickLogo}>
        <Image src="/images/logo.png" alt="favifont logo" width={40} height={40} /> <span className="block max-[400px]:hidden ml-2 font-jsMath text-2xl">FaviFont</span></button>
    </>
  );
}

function Header() {
  return (
    <div className="flex h-16 items-center px-6 bg-zinc-900 text-white z-50 sticky top-0 w-full">
      <div className="mr-auto">
        <FaviFontLogo />
      </div>
      <div className="ml-auto">
        <UserProfile />
      </div>
    </div>
  );
}

export default Header;