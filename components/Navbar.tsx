import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
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
}

const Navbar = ({
  logo = { url: "/", src: "/logo.png", alt: "DJSCE Logo", title: "DJSCE" },
  menu = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "About", url: "/about" },
  ],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/register" },
  },
}: NavbarProps) => {
  return (
    <section className="p-4 bg-gray-900 border-b border-blue-900">
      <div className="container mx-auto text-white">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href={logo.url} className="flex items-center gap-2">
              <Image src={logo.src} width={40} height={40} alt={logo.alt} />
              <span className="text-lg font-semibold tracking-tighter font-roboto">
                {logo.title}
              </span>
            </Link>

            {/* Desktop menu */}
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-800 font-roboto"
                    >
                      <Link href={item.url}>
                        <span className="group-hover:text-white">
                          {item.title}
                        </span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-700 hover:bg-blue-800 hover:border-blue-600 font-roboto text-white focus:text-white active:text-white"
            >
              <Link href={auth.login.url}>
                <span className="group-hover:text-white">
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
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={logo.url} className="flex items-center gap-2">
              <Image src={logo.src} width={32} height={32} alt={logo.alt} />
              <span className="text-lg font-semibold tracking-tighter font-roboto">
                {logo.title}
              </span>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-blue-800 hover:bg-blue-800 hover:border-blue-700"
                >
                  <Menu className="size-4 text-white" />
                </Button>
              </SheetTrigger>

              <SheetContent className="overflow-y-auto bg-gray-900 text-white">
                <SheetHeader>
                  <SheetTitle>
                    <Link href={logo.url} className="flex items-center gap-2">
                      <Image
                        src={logo.src}
                        width={32}
                        height={32}
                        alt={logo.alt}
                      />
                      <span className="text-lg font-semibold tracking-tighter text-white font-roboto">
                        {logo.title}
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 p-4">
                  <div className="flex flex-col gap-4">
                    {menu.map((item) => (
                      <Link
                        key={item.title}
                        href={item.url}
                        className="text-md font-semibold py-1 hover:text-blue-300 font-roboto"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-blue-900">
                    <Button
                      asChild
                      variant="outline"
                      className="border-blue-700 hover:bg-blue-800 hover:border-blue-600 font-roboto text-white focus:text-white active:text-white"
                    >
                      <Link href={auth.login.url}>
                        <span className="hover:text-white">
                          {auth.login.title}
                        </span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-blue-800 hover:bg-blue-700 font-roboto text-white focus:text-white active:text-white"
                    >
                      <Link href={auth.signup.url}>
                        <span className="hover:text-white">
                          {auth.signup.title}
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
