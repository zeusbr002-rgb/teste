import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { WorkerHome } from './pages/WorkerHome';
import { OrderDetails } from './pages/OrderDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { History } from './pages/History';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import { UserRole } from './types';
import { WorkOrderProvider } from './contexts/WorkOrderContext';
import { UserProvider, useUser } from './contexts/UserContext';

const AppContent: React.FC = () => {
  const { user, logout } = useUser();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" />} 
      />
      
      <Route 
        path="*" 
        element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <Routes>
                <Route path="/" element={user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <WorkerHome />} />
                <Route path="/admin" element={user.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/order/:id" element={<OrderDetails />} />
                <Route path="/Cronograma" element={<Calendar />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/history" element={<Navigate to="/history" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <WorkOrderProvider>
      <UserProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </UserProvider>
    </WorkOrderProvider>
  );
};

export default App;
