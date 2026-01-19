import axiosInstance from '../api/axios';

// Patient API - Using authenticated axios instance
export const patientApi = {
  // Get all patients
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/patients/');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get single patient by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/patients/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  create: async (patientData) => {
    try {
      const response = await axiosInstance.post('/patients/', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al crear paciente');
      }
      throw error;
    }
  },

  // Update patient
  update: async (id, patientData) => {
    try {
      const response = await axiosInstance.put(`/patients/${id}/`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error al actualizar paciente');
      }
      throw error;
    }
  },

  // Delete patient
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/patients/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error al eliminar paciente');
      }
      throw error;
    }
  },

  // Add medication to patient
  addMedication: async (patientId, medicationData) => {
    try {
      const response = await axiosInstance.post(`/patients/${patientId}/add_medication/`, medicationData);
      return response.data;
    } catch (error) {
      console.error('Error adding medication:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error al añadir medicación');
      }
      throw error;
    }
  },

  // Delete medication from patient
  deleteMedication: async (patientId, medicationId) => {
    try {
      await axiosInstance.delete(`/medications/${medicationId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error al eliminar medicación');
      }
      throw error;
    }
  },

  // Add medical note
  addNote: async (patientId, noteData) => {
    try {
      const response = await axiosInstance.post(`/patients/${patientId}/add_note/`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error al añadir nota');
      }
      throw error;
    }
  },
};

// Medication API - Using authenticated axios instance
export const medicationApi = {
  // Administer medication
  administer: async (medicationId, data) => {
    try {
      const response = await axiosInstance.post(`/medications/${medicationId}/administer/`, data);
      return response.data;
    } catch (error) {
      console.error('Error administering medication:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error al administrar medicación');
      }
      throw error;
    }
  },
};

export default { patientApi, medicationApi };

