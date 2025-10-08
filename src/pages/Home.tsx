import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ecoLogo from '@/assets/logo/eco_green.png';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Main Content */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Side - Logo and Title */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <div className="bg-green-500 p-4 rounded-lg mr-4">
              <img 
                src={ecoLogo} 
                alt="EcoGreen Logo" 
                className="w-12 h-12 object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-green-500">EcoGreen</h1>
              <p className="text-gray-600 text-lg">Trading Platform</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="flex-1 max-w-md w-full">
          <Card className="w-full">
            <CardContent className="p-8">
              <div className="space-y-4">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button 
                      className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
                    >
                      Vào Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button 
                        className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
                      >
                        Create a new account
                      </Button>
                    </Link>
                    
                    <Link to="/login">
                      <Button 
                        variant="ghost"
                        className="w-full h-12 text-green-500 hover:text-green-600 hover:bg-green-50 font-medium text-base"
                      >
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <Link 
          to="/terms" 
          className="text-green-500 hover:text-green-600 text-sm"
        >
          Terms of Service and Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default Home;
