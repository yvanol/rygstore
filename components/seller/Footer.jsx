import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full px-10 py-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <Image 
          className="hidden md:block w-24 h-24 object-contain" 
          src={assets.logo} 
          width={100}
          height={100}
          alt="logo" 
        />
        <div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">
          Copyright 2025 © RYG.dev All Right Reserved.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 py-4">
        <a href="#">
          <Image 
            src={assets.facebook_icon} 
            alt="facebook_icon" 
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        </a>
        <a href="#">
          <Image 
            src={assets.twitter_icon} 
            alt="twitter_icon" 
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        </a>
        <a href="#">
          <Image 
            src={assets.instagram_icon} 
            alt="instagram_icon" 
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        </a>
      </div>
    </div>
  );
};

export default Footer;