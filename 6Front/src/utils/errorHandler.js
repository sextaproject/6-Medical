/**
 * Centralized error handling utility
 * Replaces alert() calls with proper error handling
 */

/**
 * Show error notification
 * @param {string} message - Error message to display
 * @param {Function} setSnackbar - Snackbar state setter function
 */
export const showError = (message, setSnackbar) => {
  if (setSnackbar) {
    setSnackbar({
      open: true,
      message: message || 'Ha ocurrido un error. Por favor, intente nuevamente.',
      severity: 'error'
    });
  } else {
    // Fallback to console in development
    if (import.meta.env.DEV) {
      console.error('Error:', message);
    }
  }
};

/**
 * Show success notification
 * @param {string} message - Success message to display
 * @param {Function} setSnackbar - Snackbar state setter function
 */
export const showSuccess = (message, setSnackbar) => {
  if (setSnackbar) {
    setSnackbar({
      open: true,
      message: message || 'Operación exitosa',
      severity: 'success'
    });
  }
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object from API call
 * @param {Function} setSnackbar - Snackbar state setter function
 * @param {string} defaultMessage - Default error message
 */
export const handleApiError = (error, setSnackbar, defaultMessage = 'Error al procesar la solicitud') => {
  let errorMessage = defaultMessage;
  
  if (error.response) {
    // Server responded with error
    if (error.response.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta acción.';
    } else if (error.response.status === 401) {
      errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
    } else if (error.response.status === 400) {
      errorMessage = error.response.data?.detail || error.response.data?.message || 'Datos inválidos.';
    } else if (error.response.status === 404) {
      errorMessage = 'Recurso no encontrado.';
    } else if (error.response.status >= 500) {
      errorMessage = 'Error del servidor. Por favor, contacte al administrador.';
    } else {
      errorMessage = error.response.data?.detail || error.response.data?.message || defaultMessage;
    }
  } else if (error.request) {
    // Request made but no response
    errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
  } else {
    // Something else happened
    errorMessage = error.message || defaultMessage;
  }
  
  showError(errorMessage, setSnackbar);
  
  // Log error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('API Error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
