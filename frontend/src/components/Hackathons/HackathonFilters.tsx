import type { HackathonFiltersProps } from "../../types/hackathons";

function HackathonFilters({
  search,
  location,
  type,
  onSearchChange,
  onLocationChange,
  onTypeChange,
}: HackathonFiltersProps) {
  return (
    <div className="hackathon-filters">
      <input
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search hackathons..."
      />

      <select
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
      >
        <option value="">All locations</option>
        <option value="Goa">Goa</option>
        <option value="Bangalore">Bangalore</option>
        <option value="Online">Online</option>
      </select>

      <select
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="">All types</option>
        <option value="Online">Online</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Offline">Offline</option>
      </select>
    </div>
  );
}

export default HackathonFilters;