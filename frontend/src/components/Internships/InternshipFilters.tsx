import type { InternshipFiltersProps } from "../../types/internships";

function getSortOrder(value: string): InternshipFiltersProps["sortBy"] {
  if (value === "deadline" || value === "title") return value;
  return "recommended";
}

function InternshipFilters({
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
}: InternshipFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <span>⌕</span>

        <input
          type="search"
          aria-label="Search internships"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search internships..."
        />
      </div>

      <select
        aria-label="Filter internships by location"
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}>
        <option value="">All locations</option>
        {locations.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>

      <select
        aria-label="Filter internships by work mode"
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="">All types</option>
        {types.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>

      <select
        aria-label="Sort internships"
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

export default InternshipFilters;