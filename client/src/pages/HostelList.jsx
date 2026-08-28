import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import HostelCard from '../components/HostelCard';
import { getHostels } from '../services/hostelService';
import useDebounce from '../hooks/useDebounce';
import './HostelList.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
];

function HostelList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hostels, setHostels] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read initial state from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || '',
    gender: searchParams.get('gender') || '',
    availability: searchParams.get('availability') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    amenities: searchParams.get('amenities') || '',
    minRating: searchParams.get('minRating') || '',
    minCleanliness: searchParams.get('minCleanliness') || '',
    minFood: searchParams.get('minFood') || '',
    minSafety: searchParams.get('minSafety') || '',
    sort: searchParams.get('sort') || 'newest',
  });
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const debouncedSearch = useDebounce(search, 400);

  // Build query params from state
  const buildParams = useCallback(() => {
    const params = { ...filters, page, search: debouncedSearch };
    const cleaned = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== '' && v !== undefined && v !== null) cleaned[k] = v;
    }
    return cleaned;
  }, [filters, page, debouncedSearch]);

  // Fetch hostels
  useEffect(() => {
    let cancelled = false;

    const fetchHostels = async () => {
      setLoading(true);
      setError('');
      try {
        const params = buildParams();
        const result = await getHostels(params);
        if (!cancelled) {
          setHostels(result.data || []);
          setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load hostels');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHostels();
    return () => { cancelled = true; };
  }, [buildParams]);

  // Sync state to URL
  useEffect(() => {
    const params = buildParams();
    if (params.sort === 'newest') delete params.sort;
    if (params.page === 1 || params.page === '1') delete params.page;
    setSearchParams(params, { replace: true });
  }, [buildParams, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({
      city: '', area: '', type: '', gender: '', availability: '',
      minRent: '', maxRent: '', amenities: '',
      minRating: '', minCleanliness: '', minFood: '', minSafety: '',
      sort: 'newest',
    });
    setPage(1);
  };

  return (
    <div className="hl-page">
      {/* Top area */}
      <div className="hl-top">
        <div className="hl-top-text">
          <h1>Browse Hostels</h1>
          <p>Find student accommodation across major Indian cities</p>
        </div>
        <div className="hl-search-row">
          <div className="hl-search-wrap">
            <svg className="hl-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="9" cy="9" r="6" /><path d="M14 14l4 4" />
            </svg>
            <input
              type="text"
              className="hl-search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search hostels by name, description, location..."
            />
          </div>
        </div>
      </div>

      {/* Result bar */}
      <div className="hl-result-bar">
        <div className="hl-result-left">
          {!loading && <span className="hl-count">{pagination.total} hostel{pagination.total !== 1 ? 's' : ''} found</span>}
          <button className="hl-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
            {filtersOpen ? '✕ Hide Filters' : '☰ Filters'}
          </button>
        </div>
        <div className="hl-sort-wrap">
          <label className="hl-sort-label">Sort:</label>
          <select className="hl-sort" value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main layout */}
      <div className="hl-main">
        {/* Sidebar filters */}
        <aside className={`hl-sidebar ${filtersOpen ? 'hl-sidebar--open' : ''}`}>
          <div className="hl-sidebar-head">
            <span className="hl-sidebar-title">Filters</span>
            <button className="hl-clear" onClick={clearFilters}>Clear all</button>
          </div>

          <div className="fl-section">
            <span className="fl-label">Location</span>
            <input type="text" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} placeholder="City" />
            <input type="text" value={filters.area} onChange={(e) => handleFilterChange('area', e.target.value)} placeholder="Area" />
          </div>

          <div className="fl-section">
            <span className="fl-label">Property</span>
            <div className="fl-row">
              <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="hostel">Hostel</option>
                <option value="pg">PG</option>
              </select>
              <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)}>
                <option value="">All Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="coed">Coed</option>
              </select>
            </div>
            <select value={filters.availability} onChange={(e) => handleFilterChange('availability', e.target.value)}>
              <option value="">Any Availability</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div className="fl-section">
            <span className="fl-label">Rent Range</span>
            <div className="fl-row">
              <input type="number" value={filters.minRent} onChange={(e) => handleFilterChange('minRent', e.target.value)} placeholder="Min ₹" min="0" />
              <input type="number" value={filters.maxRent} onChange={(e) => handleFilterChange('maxRent', e.target.value)} placeholder="Max ₹" min="0" />
            </div>
          </div>

          <div className="fl-section">
            <span className="fl-label">Amenities</span>
            <input type="text" value={filters.amenities} onChange={(e) => handleFilterChange('amenities', e.target.value)} placeholder="wifi, ac, meals..." />
          </div>

          <div className="fl-section">
            <span className="fl-label">Minimum Ratings</span>
            <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)}>
              <option value="">Overall: Any</option>
              <option value="3">Overall 3+</option>
              <option value="3.5">Overall 3.5+</option>
              <option value="4">Overall 4+</option>
              <option value="4.5">Overall 4.5+</option>
            </select>
            <div className="fl-row fl-row--3">
              <select value={filters.minCleanliness} onChange={(e) => handleFilterChange('minCleanliness', e.target.value)}>
                <option value="">Clean</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <select value={filters.minFood} onChange={(e) => handleFilterChange('minFood', e.target.value)}>
                <option value="">Food</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <select value={filters.minSafety} onChange={(e) => handleFilterChange('minSafety', e.target.value)}>
                <option value="">Safety</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="hl-results">
          {loading && <div className="hl-status">Loading hostels...</div>}

          {error && (
            <div className="hl-error">
              <p>{error}</p>
              <button onClick={() => setPage(page)}>Retry</button>
            </div>
          )}

          {!loading && !error && hostels.length === 0 && (
            <div className="hl-status">
              <p>No hostels found matching your filters.</p>
              <button className="hl-clear" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}

          {!loading && !error && hostels.length > 0 && (
            <>
              <div className="hl-grid">
                {hostels.map((h) => (
                  <HostelCard key={h._id} hostel={h} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="hl-pagination">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
                  <span className="hl-page-info">Page {pagination.page} of {pagination.pages}</span>
                  <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default HostelList;
