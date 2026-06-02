import apiClient from './apiClient';

export interface Document {
  id: string;
  title: string;
  file_url: string;
  file_size: number;
  file_type: string;
  location: string;
  created_at: string;
  updated_at: string;
  modifiedBy: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

export class DocumentService {
  static async getAllDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/api/documents');
    return response.data;
  }

  static async uploadDocument(fileUri: string, fileName: string, fileType: string, title?: string, location?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    if (title) formData.append('title', title);
    if (location) formData.append('location', location);

    const response = await apiClient.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async generateRecap(documentIds: string[], context: string, title?: string): Promise<{ result: string; document_url: string; document?: Document }> {
    const response = await apiClient.post('/api/documents/generate/recap', {
      source_document_ids: documentIds,
      context,
      title,
    });
    return response.data;
  }

  static async generateReport(documentIds: string[], context: string, title?: string): Promise<{ result: string; document_url: string; document?: Document }> {
    const response = await apiClient.post('/api/documents/generate/report', {
      source_document_ids: documentIds,
      context,
      title,
    });
    return response.data;
  }

  static async generateMom(documentIds: string[], context: string, title?: string): Promise<{ result: string; document_url: string; document?: Document }> {
    const response = await apiClient.post('/api/documents/generate/mom', {
      source_document_ids: documentIds,
      context,
      title,
    });
    return response.data;
  }

  static async askAgent(query: string): Promise<{ answer: string; references: any[] }> {
    const response = await apiClient.post('/api/agent/chat', { query });
    return response.data;
  }
}
