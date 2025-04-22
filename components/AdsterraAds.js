"use client";

import { useEffect } from "react";

const AdsterraAd = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//pl26447988.profitableratecpm.com/9f9a594bffa09b1b31101eb1aa841b40/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    const container = document.getElementById(
      "container-9f9a594bffa09b1b31101eb1aa841b40"
    );
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
  }, []);

  return <div id="container-9f9a594bffa09b1b31101eb1aa841b40" />;
};

export default AdsterraAd;
