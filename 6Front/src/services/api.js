const API_BASE_URL = 'http://localhost:8000/api';

// Patient API
export const patientApi = {
  // Get all patients
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/`);
      if (!response.ok) throw new Error('Error al obtener pacientes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get single patient by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}/`);
      if (!response.ok) throw new Error('Error al obtener paciente');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  create: async (patientData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear paciente');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  update: async (id, patientData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error('Error al actualizar paciente');
      return await response.json();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // Delete patient
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar paciente');
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Add medication to patient
  addMedication: async (patientId, medicationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/add_medication/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicationData),
      });
      if (!response.ok) throw new Error('Error al añadir medicación');
      return await response.json();
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  },

  // Delete medication from patient
  deleteMedication: async (patientId, medicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medications/${medicationId}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar medicación');
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },

  // Add medical note
  addNote: async (patientId, noteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/add_note/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Error al añadir nota');
      return await response.json();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },
};

// Medication API
export const medicationApi = {
  // Administer medication
  administer: async (medicationId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/${medicationId}/administer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al administrar medicación');
      return await response.json();
    } catch (error) {
      console.error('Error administering medication:', error);
      throw error;
    }
  },
};

export default { patientApi, medicationApi };

