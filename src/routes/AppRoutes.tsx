// Cấu hình router cho app
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Import các trang
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import MainScreen from '../pages/MainScreen';
import CreatePost from '../pages/CreatePost';
import ViewCart from '../pages/ViewCart';
import ElectricVehicle from '../pages/ElectricVehicle';
import Battery from '../pages/Battery';
import Membership from '../pages/Membership';
import Favorited from '../pages/Favorited';
import History from '../pages/History';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Trang chủ */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes - Không dùng layout */}
        <Route path="/login" element={
          <PublicRoute redirectTo="/dashboard">
            <Login />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute redirectTo="/dashboard">
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes - Chỉ hiển thị khi đã đăng nhập */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DefaultLayout>
              <Dashboard />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <DefaultLayout>
              <Profile />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path="/main" element={<MainScreen />} />

        
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/view-cart" element={
          <ProtectedRoute>
            <ViewCart />
          </ProtectedRoute>
        } />

        <Route path="/electric-vehicle" element={
          <ProtectedRoute>
            <ElectricVehicle />
          </ProtectedRoute>
        } />

        <Route path="/battery" element={
          <ProtectedRoute>
            <Battery />
          </ProtectedRoute>
        } />



<Route path="/membership" element={
          <ProtectedRoute>
            <Membership />
          </ProtectedRoute>
        } />
        <Route path="/favorited" element={
          <ProtectedRoute>
            <Favorited />
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />

        {/* 404 Page - Phải đặt cuối cùng */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
