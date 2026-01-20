import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, styled, keyframes } from '@mui/material';
import logoImage from '../assets/6h.png';

// Animation LOGO
const spinAnimation = keyframes`  from { transform: rotate(0deg); } 
                                  to { transform: rotate(1440deg); }`;

const floatAnimation = keyframes`  0% { transform: translateY(0px); } 
  50% { transform: translateY(-8px); } 100% { transform: translateY(0px); }`;

const glowAnimation = keyframes` 0%   { filter: drop-shadow(0 0 8px rgba(124, 178, 239, 0.2)); }
  50%  { filter: drop-shadow(0 0 20px rgba(104, 147, 195, 0.7)); }100% { filter: drop-shadow(0 0 8px rgba(104, 147, 195, 0.4)); `;


const Content = styled(Box)({ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative', 
    zIndex: 1,
    minHeight: '100vh',
    width: '100%',
});

const LogoContainer = styled(Box)({ 
    position: 'relative', 
    cursor: 'pointer', 
    animation: `${floatAnimation} 6s ease-in-out infinite`,
});

const LogoGlow = styled(Box)(({ theme }) => ({ 
    position: 'absolute', width: '410px', height: '410px', borderRadius: '50%',
    background: 'transparent', 
    animation: `${glowAnimation} 2.5s infinite`,
    [theme.breakpoints.down('sm')]: { width: '160px', height: '160px' },
}));

const ClickableLogo = styled('img', {
  shouldForwardProp: (prop) => prop !== 'isSpinning',
})(({ theme, isSpinning }) => ({
  width: '400px', height: '400px', 
  // borderRadius: '50%',
  transition: 'all 0.3s ease', 
  // zIndex: 2,
  animation: isSpinning
    ? `${spinAnimation} 2s forwards`
    : `${glowAnimation} 3s ease-in-out infinite`,
  [theme.breakpoints.down('sm')]: { width: '150px', height: '150px' },
}));

const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 200, letterSpacing: '10px', color: '#6893c3', fontSize: '5rem',
    fontFamily: '"Orbitron", sans-serif',
    [theme.breakpoints.down('sm')]: { fontSize: '2.5rem', letterSpacing: '6px' },
}));

const Subtitle = styled(Typography)({
    color: '#6893c3', fontSize: '1rem', fontWeight: 400, 
    letterSpacing: '5px', textTransform: 'uppercase',
    textAlign: 'center',
});


function Home(){
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const handleClick = () => setIsSpinning(true);
  const handleAnimationEnd = () => navigate('/login');

  return (
    <Content>
      <LogoContainer onClick={handleClick}>
        <LogoGlow />
        <ClickableLogo
          src={logoImage}
          alt="Sexta Logo"
          isSpinning={isSpinning}
          onAnimationEnd={handleAnimationEnd}
        />
      </LogoContainer>
      <Box sx={{ marginTop: '2rem' }}>
        <Title variant="h2">SEXTA</Title>
        <Subtitle variant="h6"> MEDICINA INTELIGENTE </Subtitle>
      </Box>
    </Content>
  );
};

export default Home;