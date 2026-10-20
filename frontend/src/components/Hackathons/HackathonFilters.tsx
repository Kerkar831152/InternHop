import type { HackathonFiltersProps } from "../../types/hackathons";

function getSortOrder(value: string): HackathonFiltersProps["sortBy"] {
  if (value === "deadline" || value === "title") return value;
  return "recommended";
}

function HackathonFilters({
  search,
  location,
  type,
  onSearchChange,
  onLocationChange,
  onTypeChange,
  locations,
  types,
  sortBy,
  onSortChange,
}: HackathonFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <span>⌕</span>

        <input
          type="search"
          aria-label="Search hackathons"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search hackathons..."
        />
      </div>

      <select
        aria-label="Filter hackathons by location"
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
      >
        <option value="">All locations</option>
        {locations.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>

      <select
        aria-label="Filter hackathons by format"
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="">All formats</option>
        {types.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>

      <select
        aria-label="Sort hackathons"
        value={sortBy}
        onChange={(event) => onSortChange(getSortOrder(event.target.value))}
      >
        <option value="recommended">Recommended order</option>
        <option value="deadline">Deadline soonest</option>
        <option value="title">Title A–Z</option>
      </select>
    </div>
  );
}

export default HackathonFilters;