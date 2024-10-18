import React from "react";
import { ModeToggle } from "@/components/ui/modde-toggle";
import { CloudSunRain } from "lucide-react";

export const Header = () => {
  return (
    <div className="fixed top-0 left-0 h-14 w-screen px-5 z-10 backdrop-blur-sm flex items-center justify-between border-b">
      <div className="flex gap-2 items-center cursor-pointer">
        <CloudSunRain className="text-primary"   />
        <h1 className="font-bold">Wetter APP</h1>
      </div>
      <ModeToggle />
    </div>
  );
};
