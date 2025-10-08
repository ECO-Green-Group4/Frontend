import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Settings, 
  User, 
  Search, 
  Filter,
  Zap
} from 'lucide-react';
import ecoLogo from '@/assets/logo/eco_green.png';

const MainScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = ['All', 'EV', 'Battery'];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Create Post Button */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img 
                    src={ecoLogo} 
                    alt="ECO Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Center - Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link 
                to="/create-post" 
                className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Create Post
              </Link>
              <Link 
                to="/view-cart" 
                className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
              >
                View cart
              </Link>
              <Link 
                to="/electric-vehicle" 
                className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Electric Vehicle
              </Link>
              <Link 
                to="/battery" 
                className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Battery
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for EV, Battery ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-gray-100 border-gray-200 focus:bg-white focus:border-green-500"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-medium"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {/* Filter Button */}
            <Button 
              variant="outline" 
              className="border-black text-black hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>

            {/* Filter Tags */}
            <div className="flex items-center gap-2">
              {filterOptions.map((filter) => (
                <Badge
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    activeFilter === filter 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-white text-black border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] p-8">
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <Zap className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-400">
              Các bài viết về EV và Battery sẽ hiển thị tại đây sau khi hoàn thành luồng đăng bài
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainScreen;