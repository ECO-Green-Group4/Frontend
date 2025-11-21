import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from 'lucide-react';
import ecoLogo from "@/assets/logo/eco_green.png";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Điều hướng về trang chủ và reload để làm sạch toàn bộ state UI
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo + Tên */}
        <Link to="/" className="flex items-center space-x-3">
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

          {/* Profile Dropdown like GitHub: Profile + Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || user?.email || "User"} />
                  <AvatarFallback>
                    <User className="w-5 h-5 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-contracts">My Contracts</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register">Register</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
