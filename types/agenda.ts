export interface AgendaItem {
  id: string;
  event_id: string;
  title: string;
  status: string;
  order_index: number;
  // Based on current UI needs, we expect these but they might be in metadata or additional fields
  time?: string;
  location?: string;
  speaker?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgendaMeta {
  total: number;
  page: number;
  total_page: number;
}

export interface AgendaResponse {
  status: boolean;
  message: string;
  data: AgendaItem[];
  meta: AgendaMeta;
}

export interface GetAgendasParams {
  page?: number;
  limit?: number;
  event_id?: string;
  title?: string;
  status?: string;
  order_index?: number;
}

export interface CreateAgendaPayload {
  event_id: string;
  title: string;
  description: string;
  order_index: number;
  status: string;
  start_at: string;
  end_at: string;
}

export interface CreateAgendaResponse {
  status: boolean;
  message: string;
  data: AgendaItem;
}
