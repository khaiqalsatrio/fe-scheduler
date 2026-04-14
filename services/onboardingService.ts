import apiClient from './apiClient';

/**
 * Service to handle Onboarding operations
 */
export const OnboardingService = {
  /**
   * Check current user onboarding status
   */
  async getStatus(): Promise<any> {
    const response = await apiClient.get('/onboarding/status');
    return response.data;
  },

  /**
   * Get list of professional reference options
   */
  async getReferences(): Promise<any> {
    const response = await apiClient.get('/onboarding/references/options');
    return response.data;
  },

  /**
   * Get list of interest category options
   */
  async getInterests(): Promise<any> {
    const response = await apiClient.get('/onboarding/interests/options');
    return response.data;
  },

  /**
   * Step 1: Save name, position, and avatar
   */
  async saveStep1(data: { name: string; position: string; avatar?: any }): Promise<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('position', data.position);
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }
    
    const response = await apiClient.post('/onboarding/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Step 2: Save professional references (max 5)
   */
  async saveStep2(topics: string[]): Promise<any> {
    const response = await apiClient.post('/onboarding/references', { topics });
    return response.data;
  },

  /**
   * Step 3: Save interests (max 3) and mark onboarding as completed
   */
  async saveStep3(interests: { category: string; sub_category: string }[]): Promise<any> {
    const response = await apiClient.post('/onboarding/interests', { interests });
    return response.data;
  },
};

export default OnboardingService;
