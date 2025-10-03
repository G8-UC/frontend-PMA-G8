import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import BrokerNotifications from './components/broker/BrokerNotifications';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Login from './pages/LoginNew';
import MyRentals from './pages/MyRentals';
import PropertyDetail from './pages/PropertyDetail';
import LoadingScreen from './components/common/LoadingScreen';
import './App.css';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <BrokerNotifications />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/my-rentals" element={<MyRentals />} />
              <Route path="/loading" element={<LoadingScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;