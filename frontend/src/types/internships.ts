export interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  internshipType: string;
  skills: string[];
  stipend: string;
  deadline: string;
}

export interface InternshipCardProps {
  internship: Internship;
  saved: boolean;
  onToggleSave: (id: number) => void;
}

export interface InternshipFiltersProps {
  search: string;
  location: string;
  type: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}