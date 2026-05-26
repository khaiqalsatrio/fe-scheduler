import apiClient from './apiClient';

/**
 * Service to handle Onboarding operations
 */
export const OnboardingService = {
  /**
   * Get my onboarding data
   */
  async getOnboarding(): Promise<any> {
    try {
      const response = await apiClient.get('/onboarding/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Submit onboarding data
   */
  async submitOnboarding(data: {
    references: string[];
    interests: { category: string; sub_category: string }[];
  }): Promise<any> {
    const response = await apiClient.post('/onboarding', data);
    return response.data;
  },

  // Note: getReferences and getInterests endpoints were removed from the API documentation.
  // We provide mock implementation here to not break the frontend UI.
  async getReferences(): Promise<any> {
    return {
      data: [
        { id: '1', name: 'Teman' },
        { id: '2', name: 'Media Sosial' },
        { id: '3', name: 'Iklan' },
        { id: '4', name: 'Pencarian Web' },
        { id: '5', name: 'Lainnya' }
      ]
    };
  },

  async getInterests(): Promise<any> {
    return {
      data: [
        { id: '1', name: 'Web Development', category: 'Teknologi' },
        { id: '2', name: 'Startup', category: 'Bisnis' },
        { id: '3', name: 'Desain Grafis', category: 'Seni' },
        { id: '4', name: 'Digital Marketing', category: 'Bisnis' },
        { id: '5', name: 'Data Science', category: 'Teknologi' }
      ]
    };
  }
};

export default OnboardingService;
