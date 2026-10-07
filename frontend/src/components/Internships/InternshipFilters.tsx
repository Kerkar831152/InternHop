import type { InternshipFiltersProps } from "../../types/internships";

function InternshipFilters({
  search,
  location,
  type,
  onSearchChange,
  onLocationChange,
  onTypeChange,
}: InternshipFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <span>⌕</span>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search internships..."
        />
      </div>

      <select
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
      >
        <option value="">All locations</option>
        <option value="Goa">Goa</option>
        <option value="Bangalore">Bangalore</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Remote">Remote</option>
      </select>

      <select
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="">All types</option>
        <option value="Remote">Remote</option>
        <option value="Hybrid">Hybrid</option>
        <option value="On-site">On-site</option>
      </select>
    </div>
  );
}

export default InternshipFilters;