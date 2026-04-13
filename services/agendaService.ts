import apiClient from './apiClient';
import { AgendaResponse, GetAgendasParams, CreateAgendaPayload, CreateAgendaResponse } from '../types/agenda';

/**
 * Agenda Service to handle all agenda-related API calls
 */
export const agendaService = {
  /**
   * Fetch all agenda items with optional filters
   */
  getAgendas: async (params: GetAgendasParams = {}): Promise<AgendaResponse> => {
    try {
      const response = await apiClient.get<AgendaResponse>('/agendas', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('AgendaService: Error fetching agendas', error);
      throw error;
    }
  },

  /**
   * Helper to fetch a specific page
   */
  getAgendasByPage: async (page: number, limit: number = 10): Promise<AgendaResponse> => {
    return agendaService.getAgendas({ page, limit });
  },

  /**
   * Create a new agenda item
   */
  createAgenda: async (payload: CreateAgendaPayload): Promise<CreateAgendaResponse> => {
    try {
      const response = await apiClient.post<CreateAgendaResponse>('/agendas', payload);
      return response.data;
    } catch (error) {
      console.error('AgendaService: Error creating agenda', error);
      throw error;
    }
  },

  /**
   * Delete an agenda item
   */
  deleteAgenda: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`/agendas/${id}`);
      return response.data;
    } catch (error) {
      console.error('AgendaService: Error deleting agenda', error);
      throw error;
    }
  }
};

export default agendaService;
