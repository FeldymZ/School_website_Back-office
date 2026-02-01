export interface AgendaEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  enabled: boolean;
}
