import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import OrdersList from './pages/orders/OrdersList';
import OrderDetail from './pages/orders/OrderDetail';
import OrderCreate from './pages/orders/OrderCreate';
import CustomersList from './pages/customers/CustomersList';
import CustomerDetail from './pages/customers/CustomerDetail';
import MaterialsList from './pages/materials/MaterialsList';
import ProductionRecords from './pages/production/ProductionRecords';
import InspectionList from './pages/inspection/InspectionList';
import DispatchList from './pages/logistics/DispatchList';
import UsersList from './pages/users/UsersList';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role) && !user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Orders */}
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/new" element={<OrderCreate />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        
        {/* Customers */}
        <Route path="customers" element={<CustomersList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        
        {/* Materials */}
        <Route path="materials" element={<MaterialsList />} />
        
        {/* Production */}
        <Route path="production" element={<ProductionRecords />} />
        
        {/* Inspection */}
        <Route path="inspection" element={<InspectionList />} />
        
        {/* Logistics */}
        <Route path="logistics" element={<DispatchList />} />
        
        {/* Users (Admin only) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersList />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;