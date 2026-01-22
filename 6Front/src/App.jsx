import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout'; 
import Home from './pages/home';
import Login from './pages/login';
import Clinical from './pages/menu';
import Patient from './components/patient';
import ErrorBoundary from './components/ErrorBoundary';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clinical" element={<PrivateRoute><Clinical /></PrivateRoute>}/>
          <Route path="/patient/:id" element={<PrivateRoute><Patient /></PrivateRoute>} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;