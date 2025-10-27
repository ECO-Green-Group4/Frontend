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

  if (normalizedType.includes("diamond")) {
    badgeText = "VIP DIAMOND";
    bgColor = "bg-gradient-to-r from-blue-600 to-cyan-500";
  } else if (normalizedType.includes("gold")) {
    badgeText = "VIP GOLD";
    bgColor = "bg-gradient-to-r from-yellow-500 to-orange-500";
  } else if (normalizedType.includes("silver")) {
    badgeText = "VIP SILVER";
    bgColor = "bg-gradient-to-r from-gray-500 to-gray-400";
  } else {
    return null; // Not a VIP post
  }

  return (
    <div
      className={`absolute !top-2 !right-2 ${bgColor} ${textColor} px-3 py-1 rounded-md text-xs font-bold shadow-lg z-10 ${className}`}
      style={{ top: '8px', right: '8px' }}
    >
      {badgeText}
    </div>
  );
};

export default VIPBadge;
