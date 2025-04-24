import React, { useEffect } from "react";

const AdBanner = () => {
  useEffect(() => {
    // Create script element
    const script1 = document.createElement("script");
    script1.type = "text/javascript";
    script1.innerHTML = `
      atOptions = {
        'key' : '7f5821b215429f3c1b71ffb5628a2777',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    const script2 = document.createElement("script");
    script2.type = "text/javascript";
    script2.src =
      "//inwardabruptly.com/7f5821b215429f3c1b71ffb5628a2777/invoke.js";

    // Append scripts to document
    document.body.appendChild(script1);
    document.body.appendChild(script2);

    // Cleanup function
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <div className="ad-container">
      {/* The ad will be injected here by the script */}
    </div>
  );
};

export default AdBanner;
