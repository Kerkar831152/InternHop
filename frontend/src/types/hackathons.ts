export interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  location: string;
  eventType: string;
  skills: string[];
  prize: string;
  deadline: string;
}

export interface HackathonCardProps {
  hackathon: Hackathon;
  saved: boolean;
  onToggleSave: (id: number) => void;
}

export interface HackathonFiltersProps {
  search: string;
  location: string;
  type: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}