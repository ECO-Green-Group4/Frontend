import React from "react";
import { Link, useLocation } from "react-router-dom";
import ecoLogo from "@/assets/logo/eco_green.png";

export default function Header() {
  const location = useLocation();

  

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo + Tên */}
        <Link to="/main" className="flex items-center space-x-3">
          <img src={ecoLogo} alt="Eco Green Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-green-500 tracking-wide">
            EcoGreen
          </span>
        </Link>

        
      </div>
    </header>
  );
}
