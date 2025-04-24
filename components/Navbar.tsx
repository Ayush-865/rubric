import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";

interface MenuItem {
  title: string;
  url: string;
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: { title: string; url: string };
    signup: { title: string; url: string };
  };
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({
  logo = { url: "/", src: "/logo.png", alt: "DJSCE Logo", title: "DJSCE" },
  menu = [],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/register" },
  },
  isAuthenticated,
  onLogout,
}: NavbarProps) => {
  return (
    <section className="p-4 bg-gray-900 border-b border-blue-900">
      <div className="container mx-auto flex items-center justify-between text-white">
        {/* Logo */}
        <Link href={logo.url} className="flex items-center gap-2">
          <Image src={logo.src} width={40} height={40} alt={logo.alt} />
          <span className="text-lg font-semibold tracking-tighter font-roboto">
            {logo.title}
          </span>
        </Link>

        {/* Desktop Menu */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            {menu.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  asChild
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-800 font-roboto"
                >
                  <Link href={item.url}>
                    <span className="group-hover:text-white">{item.title}</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons */}
        <div className="flex gap-2">
          {isAuthenticated ? (
            <Button
              onClick={onLogout}
              size="sm"
              className="bg-red-600 hover:bg-red-500 font-roboto text-white focus:text-white active:text-white"
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="sm"
                className="bg-blue-700 hover:bg-blue-600 font-roboto text-white focus:text-white active:text-white"
              >
                <Link href={auth.login.url}>
                  <span className="group-hover:text-white ">
                    {auth.login.title}
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-blue-800 hover:bg-blue-700 font-roboto text-white focus:text-white active:text-white"
              >
                <Link href={auth.signup.url}>
                  <span className="group-hover:text-white">
                    {auth.signup.title}
                  </span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Navbar;
