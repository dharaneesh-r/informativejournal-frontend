import Image from "next/image";
import React from "react";
import logo from "../public/logo.png";

const Loading = () => {
  return (
    <div className="w-[100%] flex text-center  place-content-center h-[90%]">
      <Image
        src={logo}
        width={200}
        height={100}
        alt="Informative Journal"
        className="m-auto animate-pulse"
      />
    </div>
  );
};

export default Loading;
