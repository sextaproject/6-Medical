import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, styled } from '@mui/material';

import './MainLayout.css';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  overflowY: 'auto',
  overflowX: 'hidden',
}));

const Background = styled(Box)(({ theme }) => ({
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `linear-gradient(${theme.palette.primary.main} 1px, transparent 1px), linear-gradient(90deg, ${theme.palette.primary.main} 1px, transparent 1px)`,
    backgroundSize: '30px 30px', opacity: 0.04, pointerEvents: 'none', zIndex: 0,
}));


const MainLayout = () => {
  return (
<Container>
      <Background />
      <Outlet /> 
    </Container>
  );
};

export default MainLayout;







