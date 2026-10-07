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
    <div className="filter-bar">
      <div className="search-box">
        <span>⌕</span>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search hackathons..."
        />
      </div>

      <select
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
      >
        <option value="">All locations</option>
        <option value="Online">Online</option>
        <option value="Goa">Goa</option>
        <option value="Bangalore">Bangalore</option>
      </select>

      <select
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="">All formats</option>
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
        <option value="Hybrid">Hybrid</option>
      </select>
    </div>
  );
}

export default HackathonFilters;