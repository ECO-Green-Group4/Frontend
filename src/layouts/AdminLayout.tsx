import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  FileText, 
  Package, 
  BarChart3, 
  Settings, 
  Search,
  Bell,
  Settings as SettingsIcon,
  User,
  Wrench
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import ecoLogo from '@/assets/logo/eco_green.png';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const menuItems = [
    {
      id: 'users',
      label: 'User management',
      icon: Users,
      path: '/admin/users',
      active: location.pathname === '/admin/users'
    },
    {
      id: 'orders',
      label: 'Order management',
      icon: FileText,
      path: '/admin/orders',
      active: location.pathname === '/admin/orders'
    },
    {
      id: 'posts',
      label: 'Manage posts',
      icon: FileText,
      path: '/admin/posts',
      active: location.pathname === '/admin/posts'
    },
    {
      id: 'packages',
      label: 'Manage packages',
      icon: Package,
      path: '/admin/packages',
      active: location.pathname === '/admin/packages'
    },
    {
      id: 'services',
      label: 'Manage services',
      icon: Wrench,
      path: '/admin/services',
      active: location.pathname === '/admin/services'
    },
    {
      id: 'reports',
      label: 'Reports & Statistics',
      icon: BarChart3,
      path: '/admin/reports',
      active: location.pathname === '/admin/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      active: location.pathname === '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={ecoLogo} alt="Eco Green Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-green-500">EcoGreen</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
              <SettingsIcon className="w-5 h-5" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || user?.email || "User"} />
                    <AvatarFallback>
                      <User className="w-4 h-4 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <button onClick={() => navigate('/profile')}>Profile</button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 min-h-screen border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      item.active
                        ? 'bg-gray-200 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
