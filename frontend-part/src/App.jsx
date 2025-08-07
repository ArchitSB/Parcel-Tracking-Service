import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackingPage from './pages/TrackingPage';
import Dashboard from './pages/Dashboard';
import ShipmentsList from './pages/ShipmentsList';
import CreateShipment from './pages/CreateShipment';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/track/:trackingNumber" element={<TrackingPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Partner Only Routes */}
            <Route path="/shipments" element={
              <ProtectedRoute requirePartner>
                <ShipmentsList />
              </ProtectedRoute>
            } />
            
            <Route path="/shipments/create" element={
              <ProtectedRoute requirePartner>
                <CreateShipment />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
