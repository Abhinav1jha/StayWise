import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ListProperty.css';

const AMENITY_OPTIONS = ['wifi', 'ac', 'meals', 'laundry', 'security', 'gym', 'parking', 'power backup', 'water purifier', 'housekeeping', 'common room', 'study room'];

const EMPTY_FORM = {
  name: '', type: 'hostel', description: '',
  address: '', city: '', area: '',
  latitude: '', longitude: '',
  monthlyRent: '', securityDeposit: '',
  gender: 'male',
  amenities: [],
  images: [''],
  roomTypes: [{ name: '', occupancy: '', price: '' }],
  availabilityStatus: 'available', bedsAvailable: '',
};

function ListProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }));
  };

  // Room types
  const setRoom = (i, key, val) => {
    const rooms = [...form.roomTypes];
    rooms[i] = { ...rooms[i], [key]: val };
    setForm(prev => ({ ...prev, roomTypes: rooms }));
  };
  const addRoom = () => setForm(prev => ({ ...prev, roomTypes: [...prev.roomTypes, { name: '', occupancy: '', price: '' }] }));
  const removeRoom = (i) => setForm(prev => ({ ...prev, roomTypes: prev.roomTypes.filter((_, idx) => idx !== i) }));

  // Images
  const setImage = (i, val) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm(prev => ({ ...prev, images: imgs }));
  };
  const addImage = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImage = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) return 'Monthly rent must be positive';
    if (form.description.trim().length < 10) return 'Description must be at least 10 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    const body = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      location: {
        address: form.address.trim(),
        city: form.city.trim().toLowerCase(),
        area: form.area.trim().toLowerCase(),
        ...(form.latitude && form.longitude ? {
          coordinates: { latitude: Number(form.latitude), longitude: Number(form.longitude) },
        } : {}),
      },
      pricing: {
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit) || 0,
      },
      gender: form.gender,
      amenities: form.amenities,
      images: form.images.filter(u => u.trim()),
      roomTypes: form.roomTypes.filter(r => r.name.trim()).map(r => ({
        name: r.name.trim(),
        occupancy: Number(r.occupancy) || 1,
        price: Number(r.price) || 0,
      })),
      availability: {
        status: form.availabilityStatus,
        bedsAvailable: Number(form.bedsAvailable) || 0,
      },
    };

    try {
      const { data } = await api.post('/hostels', body);
      navigate(`/hostels/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-property-page">
      <h1>List Your Property</h1>
      <p className="lp-sub">Add your hostel or PG to StayWise.</p>

      {error && <p className="lp-error">{error}</p>}

      <form onSubmit={handleSubmit} className="lp-form">
        {/* Basic Info */}
        <fieldset className="lp-section">
          <legend>Basic Information</legend>
          <div className="lp-field">
            <label>Property Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Greenview Boys Hostel" />
          </div>
          <div className="lp-row">
            <div className="lp-field">
              <label>Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="hostel">Hostel</option>
                <option value="pg">PG</option>
              </select>
            </div>
            <div className="lp-field">
              <label>Gender *</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="coed">Coed</option>
              </select>
            </div>
          </div>
          <div className="lp-field">
            <label>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe your property..." />
          </div>
        </fieldset>

        {/* Location */}
        <fieldset className="lp-section">
          <legend>Location</legend>
          <div className="lp-field">
            <label>Address</label>
            <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
          </div>
          <div className="lp-row">
            <div className="lp-field">
              <label>City *</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Delhi" />
            </div>
            <div className="lp-field">
              <label>Area</label>
              <input type="text" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Koramangala" />
            </div>
          </div>
          <div className="lp-row">
            <div className="lp-field">
              <label>Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="28.6139" />
            </div>
            <div className="lp-field">
              <label>Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="77.2090" />
            </div>
          </div>
        </fieldset>

        {/* Pricing */}
        <fieldset className="lp-section">
          <legend>Pricing</legend>
          <div className="lp-row">
            <div className="lp-field">
              <label>Monthly Rent (₹) *</label>
              <input type="number" min="0" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} placeholder="8000" />
            </div>
            <div className="lp-field">
              <label>Security Deposit (₹)</label>
              <input type="number" min="0" value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} placeholder="16000" />
            </div>
          </div>
        </fieldset>

        {/* Room Types */}
        <fieldset className="lp-section">
          <legend>Room Types</legend>
          {form.roomTypes.map((rt, i) => (
            <div key={i} className="lp-row lp-room-row">
              <div className="lp-field"><label>Name</label><input type="text" value={rt.name} onChange={e => setRoom(i, 'name', e.target.value)} placeholder="Double" /></div>
              <div className="lp-field"><label>Occupancy</label><input type="number" min="1" value={rt.occupancy} onChange={e => setRoom(i, 'occupancy', e.target.value)} placeholder="2" /></div>
              <div className="lp-field"><label>Price (₹)</label><input type="number" min="0" value={rt.price} onChange={e => setRoom(i, 'price', e.target.value)} placeholder="8000" /></div>
              {form.roomTypes.length > 1 && <button type="button" className="lp-remove-btn" onClick={() => removeRoom(i)}>✕</button>}
            </div>
          ))}
          <button type="button" className="lp-add-btn" onClick={addRoom}>+ Add room type</button>
        </fieldset>

        {/* Amenities */}
        <fieldset className="lp-section">
          <legend>Amenities</legend>
          <div className="lp-amenity-grid">
            {AMENITY_OPTIONS.map(a => (
              <label key={a} className={`lp-amenity-chip ${form.amenities.includes(a) ? 'active' : ''}`}>
                <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Images */}
        <fieldset className="lp-section">
          <legend>Images</legend>
          {form.images.map((url, i) => (
            <div key={i} className="lp-row lp-img-row">
              <div className="lp-field"><input type="url" value={url} onChange={e => setImage(i, e.target.value)} placeholder="https://..." /></div>
              {form.images.length > 1 && <button type="button" className="lp-remove-btn" onClick={() => removeImage(i)}>✕</button>}
            </div>
          ))}
          <button type="button" className="lp-add-btn" onClick={addImage}>+ Add image URL</button>
        </fieldset>

        {/* Availability */}
        <fieldset className="lp-section">
          <legend>Availability</legend>
          <div className="lp-row">
            <div className="lp-field">
              <label>Status</label>
              <select value={form.availabilityStatus} onChange={e => set('availabilityStatus', e.target.value)}>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div className="lp-field">
              <label>Beds Available</label>
              <input type="number" min="0" value={form.bedsAvailable} onChange={e => set('bedsAvailable', e.target.value)} placeholder="10" />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary lp-submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}

export default ListProperty;
