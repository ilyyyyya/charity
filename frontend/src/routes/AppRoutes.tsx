import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import FundDetails from '../pages/FundDetails';
import CreateFund from '../pages/CreateFund';
import Profile from '../pages/Profile';
import VolunteerApplication from '../pages/VolunteerApplication';
import FundVolunteerRequests from '../pages/FundVolunteerRequests';
import OrganizerProfile from '../pages/OrganizerProfile';
import FundDonationsPage from '../pages/FundDonationsPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-light tracking-widest uppercase">Загрузка</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Публичные маршруты */}
      <Route path="/" element={<Home />} />
      <Route path="/funds/:id" element={<FundDetails />} />
      
      {/* Защищенные маршруты */}
      <Route 
        path="/funds/:id/donations" 
        element={
          <ProtectedRoute>
            <FundDonationsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-fund" 
        element={
          <ProtectedRoute>
            <CreateFund />
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
      <Route 
        path="/volunteer-application/:fundId" 
        element={
          <ProtectedRoute>
            <VolunteerApplication />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/funds/:fundId/volunteer-requests" 
        element={
          <ProtectedRoute>
            <FundVolunteerRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizer/:username" 
        element={
          <ProtectedRoute>
            <OrganizerProfile />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;