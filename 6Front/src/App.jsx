import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout'; 
import Home from './pages/home';
import Login from './pages/login';
import Clinical from './pages/menu';
import Patient from './components/patient';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clinical" element={<PrivateRoute><Clinical /></PrivateRoute>}/>
        <Route path="/patient/:id" element={<PrivateRoute><Patient /></PrivateRoute>} />
        
      </Route>
    </Routes>
  );
}

export default App;