import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import StoreLocator from './pages/StoreLocator';

import Shop from './pages/customer/Shop';
import Products from './pages/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import OrderTracking from './pages/OrderTracking';

import StaffOrders from './pages/staff/StaffOrders';
import StaffInventory from './pages/staff/StaffInventory';
import StaffWholesale from './pages/staff/StaffWholesale';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminShopPreview from './pages/admin/AdminShopPreview';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminInventory from './pages/admin/AdminInventory';

import DriverDeliveries from './pages/driver/DriverDeliveries';

import WholesaleShop from './pages/wholesale/WholesaleShop';
import WholesaleOrders from './pages/wholesale/WholesaleOrders';

/**
 * Inner component that sits inside AuthProvider so it can read the current user.
 * It passes the userId into CartProvider and WishlistProvider so each account
 * gets its own isolated cart and wishlist in localStorage.
 */
function AppRoutes() {
  const { user } = useAuth();
  const userId = user?._id || null;

  return (
    <CartProvider key={`cart-${userId ?? 'guest'}`} userId={userId}>
      <WishlistProvider key={`wish-${userId ?? 'guest'}`} userId={userId}>
        {/*
          key={userId ?? 'guest'} forces React to fully unmount + remount all
          page components when the logged-in user changes (login / logout /
          account switch). This guarantees every useEffect data-fetch runs fresh
          for the correct user and no stale data from a previous session leaks.
        */}
        <Routes key={`routes-${userId ?? 'guest'}`}>
          {/* Public / auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Public pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/stores" element={<StoreLocator />} />
          <Route path="/track/:orderId" element={<OrderTracking />} />
          <Route path="/products" element={<Products />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Customer */}
          <Route path="/" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={['customer']}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute roles={['customer', 'staff', 'admin', 'driver']}>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Staff */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <StaffOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/inventory"
            element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <StaffInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/wholesale"
            element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <StaffWholesale />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminSuppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/purchases"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPurchases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory-intel"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shop"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminShopPreview />
              </ProtectedRoute>
            }
          />

          {/* Driver */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute roles={['driver']}>
                <DriverDeliveries />
              </ProtectedRoute>
            }
          />

          {/* Wholesale */}
          <Route
            path="/wholesale"
            element={
              <ProtectedRoute roles={['wholesale', 'customer', 'staff', 'admin']}>
                <WholesaleShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesale/orders"
            element={
              <ProtectedRoute roles={['wholesale']}>
                <WholesaleOrders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </WishlistProvider>
    </CartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
