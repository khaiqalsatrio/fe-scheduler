export interface AgendaItem {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  isAllDay?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // UI Specific fields
  time?: string;
  speaker?: string;
  status?: string;
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
  title: string;
  note: string;
  startAt: string;
  endAt: string;
  location?: string;
  isAllDay: boolean;
}
