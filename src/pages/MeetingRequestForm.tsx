import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from '../lib/shims/react-hook-form';
import {
  ArrowLeft, Save, Send, Edit3, Search, AlertCircle, RefreshCw,
  ClipboardList, MapPin, Users, Wrench, Home, Building2, Check,
  Award, Briefcase, Calendar, Sparkles, Star, Hotel,
  Layers, GraduationCap, CheckCircle2, TrendingUp, Cpu, BedDouble
} from 'lucide-react';
import { useMeetingRequest, useMeetingMasters } from '../features/meetings/hooks';
import { createMeetingRequest, updateMeetingRequest } from '../features/meetings/api';
import { DEFAULT_FORM_VALUES, SEATING_STYLES } from '../features/meetings/constants';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes/routeRegistry';
import { CityCombobox, CitySelection } from '../components/CityCombobox';
import { SearchableCombobox } from '../components/SearchableCombobox';

// ─── CSS Styles for Premium Layout ──────────────────────────────────────────
const STYLE_INJECTION = `
  .form-grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.75rem;
    align-items: start;
  }
  @media (min-width: 992px) {
    .form-grid-layout {
      grid-template-columns: 2.2fr 1fr;
    }
  }
  .sticky-sidebar {
    position: static;
  }
  @media (min-width: 992px) {
    .sticky-sidebar {
      position: sticky;
      top: 1.5rem;
    }
  }
  .meeting-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }
  @media (min-width: 576px) {
    .meeting-type-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
  .type-card {
    padding: 1.25rem 1rem;
    border-radius: 12px;
    border: 2px solid var(--border);
    background-color: var(--surface);
    cursor: pointer;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    text-align: center;
  }
  .type-card:hover:not(.disabled) {
    border-color: #a5b4fc;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .type-card.active {
    border-color: #6366f1;
    background-color: #f5f6ff;
  }
  .type-card.disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
  .city-chip {
    padding: 5px 12px;
    border-radius: 20px;
    background-color: var(--background);
    border: 1px solid var(--border);
    font-size: 12px;
    cursor: pointer;
    transition: all 150ms ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--text-main);
    font-weight: 500;
  }
  .city-chip:hover:not(.disabled) {
    border-color: var(--primary);
    background-color: #f5f3ff;
    color: var(--primary);
  }
  .city-chip.active {
    background-color: #eef2ff;
    border-color: #6366f1;
    color: #4f46e5;
    font-weight: 600;
  }
  .city-chip.disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
  .residential-tile {
    padding: 1.25rem;
    border-radius: 12px;
    border: 2px solid var(--border);
    background-color: var(--surface);
    cursor: pointer;
    transition: all 200ms ease;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
  }
  .residential-tile:hover:not(.disabled) {
    border-color: #a5b4fc;
    transform: translateY(-2px);
  }
  .residential-tile.active {
    border-color: #6366f1;
    background-color: #f5f6ff;
  }
  .residential-tile.disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
  /* Progress Bar */
  .completion-bar-track {
    width: 100%;
    height: 6px;
    background: #e5e7eb;
    border-radius: 99px;
    overflow: hidden;
  }
  .completion-bar-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #10b981, #34d399);
    transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* Draft Saved Toast */
  @keyframes toastSlideIn {
    from { transform: translateY(-20px) translateX(-50%); opacity: 0; }
    to   { transform: translateY(0)      translateX(-50%); opacity: 1; }
  }
  @keyframes toastSlideOut {
    from { transform: translateY(0)      translateX(-50%); opacity: 1; }
    to   { transform: translateY(-20px) translateX(-50%); opacity: 0; }
  }
  .draft-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 40px;
    background: #064e3b;
    color: white;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    animation: toastSlideIn 300ms ease forwards;
    pointer-events: none;
    white-space: nowrap;
  }
  .draft-toast.hide {
    animation: toastSlideOut 300ms ease forwards;
  }
  /* Derived insight rows in sidebar */
  .insight-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px dashed #f0f0f0;
  }
  .insight-row:last-child { border-bottom: none; }
`;

// Popular target cities list
const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Goa', 'Pune', 'Bengaluru', 'Hyderabad'];

// ─── Fallback meeting types (shown when Supabase table is empty) ─────────────
const FALLBACK_MEETING_TYPES = [
  { id: 'ft-launch',   meeting_type_name: 'Launch Meeting' },
  { id: 'ft-cycle',    meeting_type_name: 'Cycle Meeting'  },
  { id: 'ft-review',   meeting_type_name: 'Review Meeting' },
  { id: 'ft-training', meeting_type_name: 'Training'       },
  { id: 'ft-gtg',      meeting_type_name: 'GTG'            },
  { id: 'ft-stay',     meeting_type_name: 'Stay'           },
];

// ─── Inline Design Helpers ────────────────────────────────────────────────────

function SectionCard({ children }: { children: any }) {
  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: '16px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      padding: '2rem',
      display: 'flex', flexDirection: 'column', gap: '1.5rem',
      border: '1px solid var(--border)',
      background: 'linear-gradient(to bottom, var(--surface), #fafafa)'
    }}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  icon: any;
  title: string;
  subtitle: string;
  gradient: string;
}
function SectionHeader({ icon, title, subtitle, gradient }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)'
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: gradient, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
          {title}
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
    </div>
  );
}

interface FieldGroupProps { label: string; required?: boolean; children: any }
function FieldGroup({ label, required, children }: FieldGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '700',
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '4px'
      }}>
        {label}
        {required && <span style={{ color: 'var(--status-danger)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Stepper Sub-component ───────────────────────────────────────────────────
interface StepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}
function Stepper({ value, onChange, min = 0, max = 9999, disabled = false }: StepperProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className="stepper-btn"
      >
        -
      </button>
      <input
        type="number"
        className="form-control text-center"
        value={value}
        onChange={e => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            onChange(Math.min(max, Math.max(min, val)));
          } else if (e.target.value === '') {
            onChange(min);
          }
        }}
        disabled={disabled}
        style={{
          width: '70px',
          textAlign: 'center',
          height: '38px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontSize: 'var(--font-sm)',
          fontWeight: '600',
          color: 'var(--text-main)'
        }}
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className="stepper-btn"
      >
        +
      </button>
    </div>
  );
}

// Dynamic venue suggestions generator
interface VenueProps {
  name: string;
  location: string;
  rating: number;
  reviews: number;
  capacity: string;
  tags: string[];
}
function getSuggestedVenues(cityName: string): VenueProps[] {
  const normalized = cityName.trim().toLowerCase();
  
  if (normalized.includes('mumbai')) {
    return [
      {
        name: 'Taj Lands End, Bandra',
        location: 'Bandra West, Mumbai',
        rating: 4.8,
        reviews: 320,
        capacity: '50-600 PAX',
        tags: ['Ajanta Preferred', 'Seaside View']
      },
      {
        name: 'Trident, Bandra Kurla',
        location: 'BKC, Mumbai',
        rating: 4.7,
        reviews: 240,
        capacity: '30-400 PAX',
        tags: ['Corporate Rates', 'Premium AV']
      }
    ];
  }
  
  if (normalized.includes('goa')) {
    return [
      {
        name: 'Grand Hyatt, Bambolim',
        location: 'Bambolim, Goa',
        rating: 4.9,
        reviews: 450,
        capacity: '100-1200 PAX',
        tags: ['Resort Style', 'Grand Ballroom']
      },
      {
        name: 'Taj Exotica Resort & Spa',
        location: 'Benaulim, Goa',
        rating: 4.8,
        reviews: 290,
        capacity: '50-500 PAX',
        tags: ['Luxury Selection', 'Beachfront']
      }
    ];
  }

  if (normalized.includes('pune')) {
    return [
      {
        name: 'JW Marriott Hotel, Pune',
        location: 'Senapati Bapat Road, Pune',
        rating: 4.9,
        reviews: 380,
        capacity: '40-800 PAX',
        tags: ['High-Tech AV', 'Top Rated']
      },
      {
        name: 'The Ritz-Carlton, Pune',
        location: 'Yerawada, Pune',
        rating: 4.8,
        reviews: 150,
        capacity: '30-500 PAX',
        tags: ['Ajanta Approved', 'Luxury Corporate']
      }
    ];
  }

  if (normalized.includes('delhi') || normalized.includes('gurgaon') || normalized.includes('noida')) {
    return [
      {
        name: 'Taj Palace, New Delhi',
        location: 'Chanakyapuri, New Delhi',
        rating: 4.9,
        reviews: 410,
        capacity: '80-1500 PAX',
        tags: ['Presidential Standard', 'State-of-the-Art']
      },
      {
        name: 'Leela Ambience, Gurgaon',
        location: 'DLF Phase 3, Gurgaon',
        rating: 4.7,
        reviews: 310,
        capacity: '50-1000 PAX',
        tags: ['Corporate Hub', 'Easy Connectivity']
      }
    ];
  }

  if (normalized.includes('bangalore') || normalized.includes('bengaluru')) {
    return [
      {
        name: 'ITC Gardenia, Bengaluru',
        location: 'Residency Road, Bengaluru',
        rating: 4.8,
        reviews: 280,
        capacity: '40-600 PAX',
        tags: ['Eco-Certified', 'Premium Boardrooms']
      },
      {
        name: 'The Oberoi, Bengaluru',
        location: 'MG Road, Bengaluru',
        rating: 4.8,
        reviews: 190,
        capacity: '20-300 PAX',
        tags: ['Garden Setting', 'Bespoke Services']
      }
    ];
  }

  // Default suggestions
  return [
    {
      name: 'Taj Palace, New Delhi',
      location: 'Chanakyapuri, New Delhi',
      rating: 4.9,
      reviews: 410,
      capacity: '80-1500 PAX',
      tags: ['State-of-the-Art', 'Corporate Rates Active']
    },
    {
      name: 'Grand Hyatt, Bambolim',
      location: 'Bambolim, Goa',
      rating: 4.9,
      reviews: 450,
      capacity: '100-1200 PAX',
      tags: ['Resort Style', 'Ajanta Preferred']
    }
  ];
}

// Get icon helper for meeting type
function getMeetingTypeIcon(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes('cycle')) return <RefreshCw size={24} style={{ color: '#4f46e5' }} />;
  if (norm.includes('review')) return <ClipboardList size={24} style={{ color: '#0ea5e9' }} />;
  if (norm.includes('training')) return <GraduationCap size={24} style={{ color: '#10b981' }} />;
  if (norm.includes('annual') || norm.includes('conference') || norm.includes('board')) return <Award size={24} style={{ color: '#f59e0b' }} />;
  if (norm.includes('launch')) return <Sparkles size={24} style={{ color: '#ec4899' }} />;
  if (norm.includes('gtg')) return <Users size={24} style={{ color: '#8b5cf6' }} />;
  if (norm.includes('stay')) return <Hotel size={24} style={{ color: '#0ea5e9' }} />;
  return <Briefcase size={24} style={{ color: '#6b7280' }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MeetingRequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Mode detection
  const isCreate = pathname.endsWith('/new');
  const isEdit = pathname.endsWith('/edit');
  const isView = !isCreate && !isEdit;

  const { divisions, cities, meetingTypes, loading: mastersLoading, error: mastersError } = useMeetingMasters();
  const { request, loading: requestLoading, error: requestError } = useMeetingRequest(id);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: DEFAULT_FORM_VALUES
  });

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [toastHiding, setToastHiding] = useState(false);
  
  // Track searchable combobox states separately
  const [citySelection, setCitySelection] = useState<CitySelection>({
    city_id: null,
    target_city_name: null
  });

  // Watch form fields for rendering custom UI elements and visual summary
  const meetingName = watch('meeting_name') || '';
  const divisionId = watch('division_id') || '';
  const meetingTypeId = watch('meeting_type_id') || '';
  const zone = watch('zone') || 'West';
  const startDate = watch('start_date') || '';
  const endDate = watch('end_date') || '';
  const expectedPax = watch('expected_pax') || 0;
  const guaranteedPax = watch('guaranteed_pax') || 0;
  const seatingStyle = watch('seating_style') || 'Cluster';
  const hallsRequired = watch('halls_required') || 1;
  const residentialFlag = watch('residential_flag') || false;
  const roomsRequired = watch('rooms_required') || 0;
  const avRequirements = watch('av_requirements') || '';
  const foodRequirements = watch('food_requirements') || '';
  const transferRequirements = watch('transfer_requirements') || '';

  // Sync loaded draft request into form values
  useEffect(() => {
    if (request && (isEdit || isView)) {
      reset({
        meeting_name: request.meeting_name,
        division_id: request.division_id,
        meeting_type_id: request.meeting_type_id,
        city_id: request.city_id,
        zone: request.zone || 'West',
        start_date: request.start_date ? request.start_date.split('T')[0] : '',
        end_date: request.end_date ? request.end_date.split('T')[0] : '',
        expected_pax: request.expected_pax,
        guaranteed_pax: request.guaranteed_pax,
        residential_flag: !!request.residential_flag,
        rooms_required: request.rooms_required || 0,
        halls_required: request.halls_required || 1,
        seating_style: request.seating_style || 'Cluster',
        av_requirements: request.av_requirements || '',
        food_requirements: request.food_requirements || '',
        transfer_requirements: request.transfer_requirements || ''
      });
      // Sync city selection state
      setCitySelection({
        city_id: request.city_id || null,
        target_city_name: request.target_city_name || null
      });
    }
  }, [request, isEdit, isView]);

  // Auto-populate division from user profile (only on create)
  useEffect(() => {
    if (isCreate && user?.division_id && !divisionId) {
      setValue('division_id', user.division_id);
    }
  }, [isCreate, user, divisions]);

  // Show draft saved toast for 3 seconds then fade out
  const showDraftToast = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setDraftSavedAt(timeStr);
    setToastHiding(false);
    setTimeout(() => setToastHiding(true), 2700);
    setTimeout(() => setDraftSavedAt(null), 3100);
  };

  const onSave = async (formValues: any, status: 'DRAFT' | 'SUBMITTED') => {
    if (!user) return;
    try {
      setSaving(true);
      setSubmitError(null);

      // Validation
      if (!formValues.meeting_name || formValues.meeting_name.trim().length < 3) {
        throw new Error('Meeting Name must be at least 3 characters long');
      }
      if (!formValues.division_id) throw new Error('Division is required');
      if (!formValues.meeting_type_id) throw new Error('Meeting Type is required');
      if (!citySelection.city_id && !citySelection.target_city_name) {
        throw new Error('City is required — select a known city or type a custom city name');
      }
      if (!formValues.start_date) throw new Error('Start Date is required');
      if (!formValues.end_date) throw new Error('End Date is required');
      if (new Date(formValues.start_date) > new Date(formValues.end_date)) {
        throw new Error('Start Date cannot be after End Date');
      }

      // Merge city selection (city_id for known cities, target_city_name for custom)
      const payload = {
        ...formValues,
        city_id: citySelection.city_id || null,
        target_city_name: citySelection.target_city_name || null
      };
      if (isCreate) {
        await createMeetingRequest(payload, user, status);
      } else if (id) {
        await updateMeetingRequest(id, payload, status);
      }

      if (status === 'DRAFT') {
        showDraftToast();
        // Stay on page for draft saves
      } else {
        navigate(ROUTES.meetingRequests);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isCreate
    ? 'New Meeting Request'
    : isEdit
      ? `Edit Draft — ${request?.request_number || '…'}`
      : `Request Details — ${request?.request_number || '…'}`;

  const isLoading = mastersLoading || (!isCreate && requestLoading);
  const isFormDisabled = isView;

  // ─── Completion Score ───────────────────────────────────────────
  const completionScore = (() => {
    const checks = [
      !!meetingName.trim(),
      !!divisionId,
      !!meetingTypeId,
      !!(citySelection.city_id || citySelection.target_city_name),
      !!startDate,
      !!endDate,
      expectedPax > 0,
      guaranteedPax > 0,
      !!avRequirements.trim(),
      !!foodRequirements.trim(),
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  })();

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
        <p style={{ fontWeight: '600', fontSize: 'var(--font-sm)' }}>Loading request details…</p>
      </div>
    );
  }

  const loadError = mastersError || requestError;
  const inputStyle = { width: '100%', boxSizing: 'border-box' as const };

  // Helper: Active city name resolver for display & suggestion mapping
  const getActiveCityName = () => {
    if (citySelection.city_id) {
      const match = cities.find(c => c.id === citySelection.city_id);
      return match ? match.city_name : '';
    }
    return citySelection.target_city_name || '';
  };
  const activeCityName = getActiveCityName();

  // Helper: Quick city select chip click handler
  const handleCityChipClick = (name: string) => {
    if (isFormDisabled) return;
    const match = cities.find(c => c.city_name.toLowerCase() === name.toLowerCase());
    if (match) {
      setCitySelection({ city_id: match.id, target_city_name: null });
    } else {
      setCitySelection({ city_id: null, target_city_name: name });
    }
  };

  // Duration Calculator
  const getDurationDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  };
  const durationDays = getDurationDays();

  // Date Formatter
  const formatDateFriendly = (dStr: string) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Selected Division & Type display labels
  const selectedDiv = divisions.find(d => d.id === divisionId);
  const selectedDivName = selectedDiv ? selectedDiv.division_name : '';

  const selectedType = meetingTypes.find(t => t.id === meetingTypeId);
  const selectedTypeName = selectedType ? selectedType.meeting_type_name : '';

  // Venue suggestions list
  const suggestedVenues = getSuggestedVenues(activeCityName);

  // ─── Effective meeting types (DB data or fallback) ───────────────
  const effectiveMeetingTypes = meetingTypes.length > 0 ? meetingTypes : FALLBACK_MEETING_TYPES;

  // ─── Derived intelligence for planning summary ───────────────────
  const derivedRoomsNeeded = residentialFlag
    ? (roomsRequired > 0 ? roomsRequired : Math.ceil(expectedPax * 0.8))
    : 0;
  const derivedHallCapacity = expectedPax > 0
    ? `${Math.ceil(expectedPax * 1.15)}–${Math.ceil(expectedPax * 1.25)} seats`
    : null;
  const derivedCategory = (() => {
    const n = selectedTypeName.toLowerCase();
    if (n.includes('training') || n.includes('review')) return 'Learning & Development';
    if (n.includes('launch')) return 'Brand & Launch';
    if (n.includes('cycle')) return 'Field Operations';
    if (n.includes('gtg') || n.includes('stay')) return 'Incentive & Reward';
    if (n.includes('annual') || n.includes('conference')) return 'Leadership';
    return selectedTypeName ? 'Corporate Event' : null;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Draft Saved Toast ──────────────────────────────────────── */}
      {draftSavedAt && (
        <div className={`draft-toast${toastHiding ? ' hide' : ''}`}>
          <CheckCircle2 size={15} style={{ color: '#6ee7b7' }} />
          Draft saved at {draftSavedAt}
        </div>
      )}
      
      {/* Inject responsive CSS style rules */}
      <style dangerouslySetInnerHTML={{ __html: STYLE_INJECTION }} />

      {/* Hidden inputs to keep react-hook-form bindings intact */}
      <input type="hidden" {...register('division_id')} />
      <input type="hidden" {...register('meeting_type_id')} />
      <input type="hidden" {...register('zone')} />
      <input type="hidden" {...register('seating_style')} />
      <input type="hidden" {...register('expected_pax')} />
      <input type="hidden" {...register('guaranteed_pax')} />
      <input type="hidden" {...register('rooms_required')} />
      <input type="hidden" {...register('halls_required')} />
      <input type="hidden" {...register('residential_flag')} />

      {/* ── Header Card ────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        padding: '1.25rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--surface) 0%, #f9fafb 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(ROUTES.meetingRequests)}
            style={{ padding: '0.5rem', flexShrink: 0 }}
            title="Back to listing"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{
              fontSize: 'var(--font-size-xl)', fontWeight: '700',
              color: 'var(--text-main)', margin: 0, lineHeight: 1.2
            }}>
              {pageTitle}
            </h2>
            {request && (
              <span
                className={`badge badge-${request.status === 'DRAFT' ? 'info' : 'warning'}`}
                style={{ fontSize: '11px', marginTop: '5px', display: 'inline-block' }}
              >
                {request.status}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {request && !isCreate && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`${ROUTES.venueExplorer}?requestId=${id}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Search size={15} />
              <span>Find Matching Venues</span>
            </button>
          )}
          {isView && request?.status === 'DRAFT' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/meeting-requests/${id}/edit`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit3 size={15} />
              <span>Edit Draft</span>
            </button>
          )}
          {!isFormDisabled && (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleSubmit((vals: any) => onSave(vals, 'DRAFT'))}
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={15} />
                <span>Save Draft</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit((vals: any) => onSave(vals, 'SUBMITTED'))}
                disabled={saving}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                }}
              >
                <Send size={15} />
                <span>{saving ? 'Submitting…' : 'Submit Request'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Completion Progress Bar ──────────────────────────────── */}
      {!isView && (
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          padding: '0.875rem 1.25rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} style={{ color: completionScore >= 80 ? '#10b981' : completionScore >= 50 ? '#f59e0b' : '#6b7280' }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Request Completion
              </span>
            </div>
            <span style={{
              fontSize: '13px',
              fontWeight: '800',
              color: completionScore >= 80 ? '#059669' : completionScore >= 50 ? '#d97706' : '#6b7280'
            }}>
              {completionScore}%
            </span>
          </div>
          <div className="completion-bar-track">
            <div
              className="completion-bar-fill"
              style={{
                width: `${completionScore}%`,
                background: completionScore >= 80
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : completionScore >= 50
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #d1d5db, #e5e7eb)'
              }}
            />
          </div>
          {completionScore < 100 && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {completionScore < 40
                ? 'Start by filling in the Meeting Name, Division, and Meeting Type.'
                : completionScore < 70
                ? 'Almost there — add location, dates, and attendee count.'
                : 'Nearly complete — add AV and catering requirements to finish.'}
            </p>
          )}
        </div>
      )}

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {(loadError || submitError) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: '12px', color: '#dc2626', fontSize: 'var(--font-sm)'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{submitError || loadError}</span>
        </div>
      )}

      {/* ── GRID LAYOUT: Left Form Cards & Right Summary Panel ─────── */}
      <div className="form-grid-layout">
        
        {/* Left Column: Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* SECTION 1 — Basic Specifications */}
          <SectionCard>
            <SectionHeader
              icon={<ClipboardList size={20} style={{ color: 'white' }} />}
              title="Basic Specifications"
              subtitle="Identify the event name, division owner, and meeting format"
              gradient="linear-gradient(135deg, #6366f1, #818cf8)"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <FieldGroup label="Meeting Name" required>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Q3 Cycle Meeting — Mumbai Zone"
                    {...register('meeting_name')}
                    disabled={isFormDisabled}
                    style={{ ...inputStyle, height: '38px' }}
                  />
                </FieldGroup>

                <FieldGroup label="Division" required>
                  <SearchableCombobox
                    options={divisions.map(d => ({ value: d.id, label: d.division_name }))}
                    value={divisionId}
                    onChange={(val) => setValue('division_id', val)}
                    placeholder="Select Division"
                    disabled={isFormDisabled}
                  />
                </FieldGroup>
              </div>

              {/* Replace Meeting Type dropdown with selectable cards */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{
                    display: 'block', fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                    margin: 0
                  }}>
                    Meeting Type <span style={{ color: 'var(--status-danger)' }}>*</span>
                  </label>
                  {meetingTypes.length === 0 && (
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                      backgroundColor: '#fef9c3', color: '#a16207',
                      fontWeight: '700', border: '1px solid #fde68a'
                    }}>
                      Sample Types
                    </span>
                  )}
                </div>
                <div className="meeting-type-grid">
                  {effectiveMeetingTypes.map(type => {
                    const isActive = meetingTypeId === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => !isFormDisabled && setValue('meeting_type_id', type.id)}
                        className={`type-card ${isActive ? 'active' : ''} ${isFormDisabled ? 'disabled' : ''}`}
                      >
                        {getMeetingTypeIcon(type.meeting_type_name)}
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                          {type.meeting_type_name}
                        </span>
                        {isActive && (
                          <div style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '16px', height: '16px', borderRadius: '50%',
                            backgroundColor: '#6366f1', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Check size={10} style={{ color: 'white' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 2 — Location & Timings */}
          <SectionCard>
            <SectionHeader
              icon={<MapPin size={20} style={{ color: 'white' }} />}
              title="Location & Timings"
              subtitle="Set target destination and corporate planning timeline"
              gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Target City input */}
              <FieldGroup label="Target City" required>
                <CityCombobox
                  cities={cities}
                  value={citySelection}
                  onChange={setCitySelection}
                  disabled={isFormDisabled}
                />
              </FieldGroup>

              {/* Quick-select city chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '-4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px', fontWeight: '600' }}>
                  Quick select:
                </span>
                {POPULAR_CITIES.map(cName => {
                  const isSelected = activeCityName.toLowerCase() === cName.toLowerCase();
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => handleCityChipClick(cName)}
                      className={`city-chip ${isSelected ? 'active' : ''} ${isFormDisabled ? 'disabled' : ''}`}
                      disabled={isFormDisabled}
                    >
                      <MapPin size={10} style={{ opacity: 0.8 }} />
                      {cName}
                    </button>
                  );
                })}
              </div>

              {/* Zone + Dates row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginTop: '4px' }}>
                <FieldGroup label="Zone">
                  <SearchableCombobox
                    options={[
                      { value: 'West', label: 'West' },
                      { value: 'East', label: 'East' },
                      { value: 'North', label: 'North' },
                      { value: 'South', label: 'South' },
                      { value: 'Central', label: 'Central' }
                    ]}
                    value={zone}
                    onChange={(val) => setValue('zone', val)}
                    placeholder="Select Zone"
                    disabled={isFormDisabled}
                  />
                </FieldGroup>

                <FieldGroup label="Start Date" required>
                  <input
                    type="date"
                    className="form-control"
                    {...register('start_date')}
                    disabled={isFormDisabled}
                    style={{ ...inputStyle, height: '38px' }}
                  />
                </FieldGroup>

                <FieldGroup label="End Date" required>
                  <input
                    type="date"
                    className="form-control"
                    {...register('end_date')}
                    disabled={isFormDisabled}
                    style={{ ...inputStyle, height: '38px' }}
                  />
                </FieldGroup>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 3 — Setup & Capacity */}
          <SectionCard>
            <SectionHeader
              icon={<Users size={20} style={{ color: 'white' }} />}
              title="Setup & Capacity"
              subtitle="Attendee limits, floor arrangements, and accommodation needs"
              gradient="linear-gradient(135deg, #10b981, #34d399)"
            />

            {/* Steppers & Seating Style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <FieldGroup label="Expected PAX" required>
                <Stepper
                  value={expectedPax}
                  onChange={(val) => setValue('expected_pax', val)}
                  min={1}
                  disabled={isFormDisabled}
                />
              </FieldGroup>

              <FieldGroup label="Guaranteed PAX" required>
                <Stepper
                  value={guaranteedPax}
                  onChange={(val) => setValue('guaranteed_pax', val)}
                  min={1}
                  disabled={isFormDisabled}
                />
              </FieldGroup>

              <FieldGroup label="Seating Style">
                <SearchableCombobox
                  options={SEATING_STYLES.map(s => ({ value: s, label: s }))}
                  value={seatingStyle}
                  onChange={(val) => setValue('seating_style', val)}
                  placeholder="Select Style"
                  disabled={isFormDisabled}
                />
              </FieldGroup>

              <FieldGroup label="Halls Required">
                <Stepper
                  value={hallsRequired}
                  onChange={(val) => setValue('halls_required', val)}
                  min={1}
                  disabled={isFormDisabled}
                />
              </FieldGroup>
            </div>

            {/* Replace Residential checkbox with selectable Tiles */}
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '700',
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '10px'
              }}>
                Accommodation Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                
                {/* Non-Residential Tile */}
                <div
                  onClick={() => !isFormDisabled && setValue('residential_flag', false)}
                  className={`residential-tile ${!residentialFlag ? 'active' : ''} ${isFormDisabled ? 'disabled' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Home size={22} style={{ color: !residentialFlag ? '#6366f1' : 'var(--text-muted)' }} />
                    {!residentialFlag && (
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        backgroundColor: '#6366f1', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Check size={11} style={{ color: 'white' }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 2px 0' }}>
                      Non-Residential Event
                    </h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      Ideal for local or single-day events. No room bookings needed.
                    </p>
                  </div>
                </div>

                {/* Residential Tile */}
                <div
                  onClick={() => !isFormDisabled && setValue('residential_flag', true)}
                  className={`residential-tile ${residentialFlag ? 'active' : ''} ${isFormDisabled ? 'disabled' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Building2 size={22} style={{ color: residentialFlag ? '#6366f1' : 'var(--text-muted)' }} />
                    {residentialFlag && (
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        backgroundColor: '#6366f1', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Check size={11} style={{ color: 'white' }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 2px 0' }}>
                      Residential Event
                    </h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      Overnight accommodation stays required for attendees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stepper for Rooms Required (revealed when residential) */}
              {residentialFlag && (
                <div style={{
                  marginTop: '1.25rem', padding: '1.25rem',
                  backgroundColor: '#f5f6ff', borderRadius: '12px',
                  border: '1px dashed #c7d2fe', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  maxWidth: '360px', animation: 'fadeIn 0.2s ease-in-out'
                }}>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: '#4338ca', margin: '0 0 2px 0' }}>
                      Room Allotment
                    </h5>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                      Indicate number of rooms required.
                    </p>
                  </div>
                  <Stepper
                    value={roomsRequired}
                    onChange={(val) => setValue('rooms_required', val)}
                    min={0}
                    disabled={isFormDisabled}
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* SECTION 4 — Requirements Specifications */}
          <SectionCard>
            <SectionHeader
              icon={<Wrench size={20} style={{ color: 'white' }} />}
              title="Requirements Specifications"
              subtitle="Specify customized AV, catering, and guest travel needs"
              gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FieldGroup label="AV & Stage Requirements">
                <textarea
                  className="form-control"
                  placeholder="e.g. LED screen walls, stage configuration, collar mics, sound systems..."
                  {...register('av_requirements')}
                  disabled={isFormDisabled}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', borderRadius: '8px' }}
                />
              </FieldGroup>

              <FieldGroup label="Food & Beverage Requirements">
                <textarea
                  className="form-control"
                  placeholder="e.g. Breakfast, hot lunch buffet, high tea setup, customized menu preferences..."
                  {...register('food_requirements')}
                  disabled={isFormDisabled}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', borderRadius: '8px' }}
                />
              </FieldGroup>

              <FieldGroup label="Transfer & Travel Logistics">
                <textarea
                  className="form-control"
                  placeholder="e.g. Local airport transfers, coach bookings, group travel arrangements..."
                  {...register('transfer_requirements')}
                  disabled={isFormDisabled}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', borderRadius: '8px' }}
                />
              </FieldGroup>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Sticky Visual Summary Panel & Suggested Venues */}
        <div className="sticky-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Visual Summary Card */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Summary Top Accent Gradient Header */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              padding: '1.25rem',
              color: 'white',
              position: 'relative'
            }}>
              {/* Subtle top decoration badge */}
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                fontSize: '9px', fontWeight: '800', padding: '2px 8px',
                backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {isView ? 'Archived Summary' : 'Live Preview'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Planning Summary
                </span>
              </div>
              <h4 style={{
                fontSize: '15px', fontWeight: '700', color: 'white', margin: 0,
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
              }}>
                {meetingName.trim() || 'Untitled Meeting Request'}
              </h4>
            </div>

            {/* Summary List Area */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--surface)' }}>
              
              {/* Owner details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f5f6ff', color: '#6366f1' }}>
                  <Briefcase size={16} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Corporate Owner
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {selectedDivName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal' }}>No division selected</span>}
                  </span>
                </div>
              </div>

              {/* Type details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <Layers size={16} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Meeting Format
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {selectedTypeName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal' }}>No type selected</span>}
                  </span>
                </div>
              </div>

              {/* Location details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Destination
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {activeCityName ? `${activeCityName} (${zone} Zone)` : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal' }}>No city configured</span>}
                  </span>
                </div>
              </div>

              {/* Date details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Timeline Schedule
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {startDate || endDate ? (
                      <>
                        {startDate ? formatDateFriendly(startDate) : '??'} – {endDate ? formatDateFriendly(endDate) : '??'}
                        {durationDays && (
                          <span style={{
                            marginLeft: '6px', padding: '1px 6px', borderRadius: '8px',
                            backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '10px', fontWeight: '700'
                          }}>
                            {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal' }}>Timeline unset</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Capacity details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#8b5cf6' }}>
                  <Users size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Seating & Room Capacity
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-main)', marginTop: '2px', fontWeight: '600' }}>
                    <span>Expected: {expectedPax} PAX</span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <span>Guaranteed: {guaranteedPax} PAX</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Seating: <strong style={{ color: 'var(--text-main)' }}>{seatingStyle}</strong> &bull; Halls: <strong style={{ color: 'var(--text-main)' }}>{hallsRequired}</strong>
                  </div>
                </div>
              </div>

              {/* Accommodation details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: residentialFlag ? '#eef2ff' : '#f9fafb', color: residentialFlag ? '#4f46e5' : '#6b7280' }}>
                  {residentialFlag ? <Building2 size={16} /> : <Home size={16} />}
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Accommodation Option
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: residentialFlag ? '#4f46e5' : 'var(--text-main)' }}>
                    {residentialFlag ? `Residential (${roomsRequired} rooms required)` : 'Non-Residential Event'}
                  </span>
                </div>
              </div>

              {/* Requirements Specifications Checklists */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                  backgroundColor: avRequirements.trim() ? '#e0e7ff' : '#f3f4f6',
                  color: avRequirements.trim() ? '#4338ca' : '#9ca3af'
                }}>
                  {avRequirements.trim() ? '✓ AV Configured' : 'No AV Added'}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                  backgroundColor: foodRequirements.trim() ? '#dcfce7' : '#f3f4f6',
                  color: foodRequirements.trim() ? '#15803d' : '#9ca3af'
                }}>
                  {foodRequirements.trim() ? '✓ Catering Configured' : 'No Catering'}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                  backgroundColor: transferRequirements.trim() ? '#ffedd5' : '#f3f4f6',
                  color: transferRequirements.trim() ? '#c2410c' : '#9ca3af'
                }}>
                  {transferRequirements.trim() ? '✓ Travel Logistics' : 'No Logistics'}
                </span>
              </div>

            </div>

            {/* ── Derived Intelligence Block ──────────────────────── */}
            {(durationDays || derivedCategory || derivedHallCapacity) && (
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                backgroundColor: '#fafafa',
                borderRadius: '0 0 12px 12px',
                margin: '0 -1.25rem -1.25rem',
                padding: '10px 1.25rem 1.25rem'
              }}>
                <span style={{
                  fontSize: '9px', fontWeight: '800', textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Cpu size={9} /> AI-Derived Insights
                </span>

                {durationDays && (
                  <div className="insight-row">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Meeting Duration</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                )}

                {residentialFlag && derivedRoomsNeeded > 0 && (
                  <div className="insight-row">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <BedDouble size={10} /> Est. Rooms
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>
                      ~{derivedRoomsNeeded} rooms
                    </span>
                  </div>
                )}

                {derivedHallCapacity && (
                  <div className="insight-row">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Suggested Hall</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {derivedHallCapacity}
                    </span>
                  </div>
                )}

                {derivedCategory && (
                  <div className="insight-row">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Meeting Category</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
                      {derivedCategory}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* SECTION 7 — Placeholder "Suggested Venues" section */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'linear-gradient(to bottom, var(--surface) 50%, #fafafa 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hotel size={16} style={{ color: '#4f46e5' }} />
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                  Suggested Venues
                </h4>
              </div>
              {activeCityName && (
                <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '4px', fontWeight: '600' }}>
                  {activeCityName}
                </span>
              )}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, marginTop: '-4px', lineHeight: 1.4 }}>
              Ajanta approved corporate properties matching target capacity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {suggestedVenues.map((v, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#a5b4fc';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                      {v.name}
                    </h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '11px', fontWeight: '600' }}>
                      <Star size={10} fill="#f59e0b" />
                      <span>{v.rating}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={10} />
                    {v.location}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                    <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: '500' }}>
                      Capacity: <strong>{v.capacity}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {v.tags.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '8px', padding: '1px 5px', borderRadius: '4px',
                            backgroundColor: t.includes('Preferred') || t.includes('Approved') ? '#ecfdf5' : '#f3f4f6',
                            color: t.includes('Preferred') || t.includes('Approved') ? '#047857' : '#4b5563',
                            fontWeight: '700', letterSpacing: '0.02em', textTransform: 'uppercase'
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom action bar (repeated for long-form convenience) ── */}
      {!isFormDisabled && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--surface) 0%, #f9fafb 100%)',
          marginTop: '0.5rem'
        }}>
          <button
            className="btn btn-secondary"
            onClick={handleSubmit((vals: any) => onSave(vals, 'DRAFT'))}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit((vals: any) => onSave(vals, 'SUBMITTED'))}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
            }}
          >
            <Send size={15} />
            <span>{saving ? 'Submitting…' : 'Submit Request'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
