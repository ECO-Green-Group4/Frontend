import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import MainScreen from '../pages/MainScreen';
import CreatePost from '../pages/CreatePost';
import ViewCart from '../pages/ViewCart';
import ElectricVehicle from '../pages/ElectricVehicle';
import Battery from '../pages/Battery';
import Membership from '../pages/Membership';
import Favorited from '../pages/Favorited';
import History from '../pages/History';
import StaffContract from '../pages/StaffContract';
import DescriptionEV from '../pages/DescriptionEV';
import DescriptionBattery from '../pages/DescriptionBattery';
import NotFound from '../pages/NotFound';
import Waiting from '@/pages/Waiting';
import Payment from '@/pages/Payment';
import Unauthorized from '@/pages/Unauthorized';
import VnPayCallback from '@/pages/VnPayCallback';
import AdminLayout from '@/layouts/AdminLayout';
import StaffLayout from '@/layouts/StaffLayout';
import UserManagement from '@/components/UserManagement';
import PackageManagement from '@/components/PackageManagement';
import PostManagement from '@/components/PostManagement';
import ServiceManagement from '@/components/ServiceManagement';
import StaffOrderManagement from '@/components/StaffOrderManagement';
import ContractManagement from '@/pages/ContractManagement';
import ManageOrder from '@/pages/ManageOrder';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Trang chủ */}
        <Route path="/" element={<MainScreen />} />
        
        {/* Auth Routes - Không dùng layout */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes - Chỉ hiển thị khi đã đăng nhập */}
        <Route path="/profile" element={
          <ProtectedRoute>
            
              <Profile />
            
          </ProtectedRoute>
        } />

        

        
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

        <Route path="/description-ev/:id" element={
          <ProtectedRoute>
            <DescriptionEV />
          </ProtectedRoute>
        } />

        <Route path="/description-battery/:id" element={
          <ProtectedRoute>
            <DescriptionBattery />
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
<Route path="/waiting" element={
          <ProtectedRoute>
          <Waiting />
        </ProtectedRoute>
            
          
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />

        <Route path="/staff-contract" element={
          
            <StaffContract />
          
        } />


        {/* Admin Routes - Chỉ dành cho Admin (roleId = '2') */}
        <Route path="/admin" element={
          <RoleRoute requiredRole="2">
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </RoleRoute>
        } />
        
        <Route path="/admin/users" element={
          <RoleRoute requiredRole="2">
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </RoleRoute>
        } />
        
        <Route path="/admin/packages" element={
          <RoleRoute requiredRole="2">
            <AdminLayout>
              <PackageManagement />
            </AdminLayout>
          </RoleRoute>
        } />

        <Route path="/admin/posts" element={
          <RoleRoute requiredRole="2">
            <AdminLayout>
              <PostManagement />
            </AdminLayout>
          </RoleRoute>
        } />

        <Route path="/admin/orders" element={
          <RoleRoute requiredRole="2">
            <AdminLayout>
              <ManageOrder />
            </AdminLayout>
          </RoleRoute>
        } />
        <Route path="/admin/orders" element={
          <RoleRoute requiredRole="2">
            <AdminLayout>
              <ManageOrder />
            </AdminLayout>
          </RoleRoute>
        } />

        {/* VNPay Callback */}
        <Route path="/vnpay-callback" element={<VnPayCallback />} />

        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 Page - Phải đặt cuối cùng */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
