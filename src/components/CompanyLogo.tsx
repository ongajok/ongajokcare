import React from "react";

interface CompanyLogoProps {
  className?: string;
  size?: number;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ className = "", size = 44 }) => {
  return (
    <img
      src="https://i.postimg.cc/sgwptvp9/logo.png"
      alt="온가족간병협회 로고"
      style={{ width: size, height: size }}
      className={`object-contain select-none inline-block ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
