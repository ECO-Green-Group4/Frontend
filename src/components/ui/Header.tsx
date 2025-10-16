import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Settings, 
  User
} from 'lucide-react';
import ecoLogo from "@/assets/logo/eco_green.png";

export default function Header() {

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

        {/* Center - Navigation Links */}
        <nav className="flex items-center space-x-6">
          <Link 
            to="/create-post" 
            className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            Create Post
          </Link>
          <Link 
            to="/membership" 
            className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            Membership
          </Link>
          <Link 
            to="/favorited" 
            className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            Favorited
          </Link>
          <Link 
            to="/history" 
            className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            History
          </Link>
          
        </nav>

        {/* Right side - User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
