import React from 'react';

interface VIPBadgeProps {
  postType?: string | null;
  className?: string;
}

const VIPBadge: React.FC<VIPBadgeProps> = ({ postType, className = "" }) => {
  if (!postType) return null;

  // Normalize postType to handle different formats
  const normalizedType = postType.toLowerCase();

  let badgeText = "";
  let bgColor = "";
  let textColor = "text-white";

  if (normalizedType.includes("diamond") || normalizedType.includes("kim cương") || normalizedType.includes("kimcuong")) {
    badgeText = "VIP KIM CƯƠNG";
    bgColor = "bg-red-600"; // Màu đỏ như trong hình
  } else if (normalizedType.includes("gold") || normalizedType.includes("vàng") || normalizedType.includes("vang")) {
    badgeText = "VIP VÀNG";
    bgColor = "bg-yellow-500"; // Màu vàng
  } else if (normalizedType.includes("silver") || normalizedType.includes("bạc") || normalizedType.includes("bac")) {
    badgeText = "VIP BẠC";
    bgColor = "bg-gray-400"; // Màu bạc
  } else {
    return null; // Not a VIP post
  }

  return (
    <div
      className={`absolute top-2 left-2 ${bgColor} ${textColor} px-3 py-1.5 rounded text-xs font-bold shadow-lg z-10 ${className}`}
      style={{ top: '8px', left: '8px' }}
    >
      {badgeText}
    </div>
  );
};

export default VIPBadge;
