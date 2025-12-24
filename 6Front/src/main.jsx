import React from "react";
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' 
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import theme from './theme.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)

