import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout'; 
import Home from './pages/Home';
import Menu from './pages/Menu';
import Patient from './components/patient';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/patient/:id" element={<Patient />} />
        
      </Route>
    </Routes>
  );
}

export default App;