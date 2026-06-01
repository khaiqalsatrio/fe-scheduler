import apiClient from './apiClient';
import { GetAgendasParams, CreateAgendaPayload, AgendaItem } from '../types/agenda';

/**
 * Agenda Service to handle all agenda-related API calls
 */
export const agendaService = {
  /**
   * Fetch all agenda items with optional filters
   */
  getAgendas: async (params: GetAgendasParams = {}): Promise<AgendaItem[]> => {
    try {
      const response = await apiClient.get<AgendaItem[]>('/agendas', {
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
  getAgendasByPage: async (page: number, limit: number = 10): Promise<AgendaItem[]> => {
    return agendaService.getAgendas({ page, limit });
  },

  /**
   * Create a new agenda item
   */
  createAgenda: async (payload: CreateAgendaPayload): Promise<AgendaItem> => {
    try {
      const response = await apiClient.post<AgendaItem>('/agendas', payload);
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
