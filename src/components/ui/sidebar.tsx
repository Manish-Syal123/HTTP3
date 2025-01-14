import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SidebarProps {
  items: {
    name: string;
    icon: LucideIcon;
  }[];
  activeItem: string;
  setActiveItem: (item: string) => void;
}

export function Sidebar({ items, activeItem, setActiveItem }: SidebarProps) {
  return (
    <div className="flex flex-col w-64 bg-[#242839] border-r border-[#3f465f] text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-[#3f465f]">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/svg/logo.svg" alt="HTTP3 logo" width={32} height={32} />
          <span className="text-xl font-bold">HTTP3</span>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        {items.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={cn(
              "w-full justify-start px-4 py-5 mb-2 text-left rounded-lg transition-colors",
              activeItem === item.name
                ? "bg-[#3f465f] border-2 border-[#3f465f] text-white"
                : "text-gray-400 hover:bg-[#3f465f] hover:text-white"
            )}
            onClick={() => setActiveItem(item.name)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t border-[#3f465f]">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} HTTP3. All rights reserved.
        </p>
      </div>
    </div>
  );
}
