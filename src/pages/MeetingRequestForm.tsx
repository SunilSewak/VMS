import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from '../lib/shims/react-hook-form';
import {
  ArrowLeft, Save, Send, Edit3, AlertCircle, RefreshCw,
  ClipboardList, MapPin, Users, Wrench, Home, Building2, Check
} from 'lucide-react';
import { useMeetingRequest, useMeetingMasters } from '../features/meetings/hooks';
import { createMeetingRequest, updateMeetingRequest } from '../features/meetings/api';
import { DEFAULT_FORM_VALUES, SEATING_STYLES } from '../features/meetings/constants';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes/routeRegistry';
import { CityCombobox, CitySelection } from '../components/CityCombobox';

// ─── Inline design helpers ────────────────────────────────────────────────────

function SectionCard({ children }: { children: any }) {
  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: '16px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      padding: '2rem',
      display: 'flex', flexDirection: 'column', gap: '1.5rem'
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
        width: '44px', height: '44px', borderRadius: '10px',
        background: gradient, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
          {title}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
    </div>
  );
}

interface FieldGroupProps { label: string; required?: boolean; children: any }
function FieldGroup({ label, required, children }: FieldGroupProps) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '700',
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '7px'
      }}>
        {label}
        {required && <span style={{ color: 'var(--status-danger)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  );
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
  const [citySelection, setCitySelection] = useState<CitySelection>({
    city_id: null,
    target_city_name: null
  });

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

  const residentialFlag = watch('residential_flag');

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

      navigate(ROUTES.meetingRequests);
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

  // ── Residential card shared style
  const residentialCardStyle = (active: boolean) => ({
    padding: '1.25rem',
    borderRadius: '12px',
    border: `2px solid ${active ? '#6366f1' : 'var(--border)'}`,
    backgroundColor: active ? '#eef2ff' : 'var(--background)',
    cursor: isFormDisabled ? 'default' : 'pointer',
    transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
    display: 'flex', flexDirection: 'column' as const, gap: '0.5rem',
    userSelect: 'none' as const
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Header Card ────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        padding: '1.25rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem'
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
                  boxShadow: '0 4px 14px rgba(79,70,229,0.4)'
                }}
              >
                <Send size={15} />
                <span>{saving ? 'Submitting…' : 'Submit Request'}</span>
              </button>
            </>
          )}
        </div>
      </div>

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

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — Basic Specifications
      ══════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<ClipboardList size={20} style={{ color: 'white' }} />}
          title="Basic Specifications"
          subtitle="What is this meeting and which division owns it?"
          gradient="linear-gradient(135deg, #6366f1, #818cf8)"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <FieldGroup label="Meeting Name" required>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Q3 Cycle Meeting — Mumbai Zone"
              {...register('meeting_name')}
              disabled={isFormDisabled}
              style={inputStyle}
            />
          </FieldGroup>

          <FieldGroup label="Division" required>
            <select className="form-control" {...register('division_id')} disabled={isFormDisabled} style={inputStyle}>
              <option value="">Select Division</option>
              {divisions.map(div => (
                <option key={div.id} value={div.id}>{div.division_name}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Meeting Type" required>
            <select className="form-control" {...register('meeting_type_id')} disabled={isFormDisabled} style={inputStyle}>
              <option value="">Select Meeting Type</option>
              {meetingTypes.map(type => (
                <option key={type.id} value={type.id}>{type.meeting_type_name}</option>
              ))}
            </select>
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — Location & Timings
      ══════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<MapPin size={20} style={{ color: 'white' }} />}
          title="Location & Timings"
          subtitle="Where and when does this event take place?"
          gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)"
        />

        {/* City full-width row */}
        <FieldGroup label="Target City" required>
          <CityCombobox
            cities={cities}
            value={citySelection}
            onChange={setCitySelection}
            disabled={isFormDisabled}
          />
        </FieldGroup>

        {/* Zone + Dates row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <FieldGroup label="Zone">
            <select className="form-control" {...register('zone')} disabled={isFormDisabled} style={inputStyle}>
              <option value="West">West</option>
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="Central">Central</option>
            </select>
          </FieldGroup>

          <FieldGroup label="Start Date" required>
            <input type="date" className="form-control" {...register('start_date')} disabled={isFormDisabled} style={inputStyle} />
          </FieldGroup>

          <FieldGroup label="End Date" required>
            <input type="date" className="form-control" {...register('end_date')} disabled={isFormDisabled} style={inputStyle} />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — Setup & Capacity
      ══════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Users size={20} style={{ color: 'white' }} />}
          title="Setup & Capacity"
          subtitle="Attendance counts, seating configuration, and accommodation needs"
          gradient="linear-gradient(135deg, #10b981, #34d399)"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
          <FieldGroup label="Expected PAX" required>
            <input type="number" className="form-control" {...register('expected_pax')} disabled={isFormDisabled} style={inputStyle} />
          </FieldGroup>
          <FieldGroup label="Guaranteed PAX" required>
            <input type="number" className="form-control" {...register('guaranteed_pax')} disabled={isFormDisabled} style={inputStyle} />
          </FieldGroup>
          <FieldGroup label="Seating Style">
            <select className="form-control" {...register('seating_style')} disabled={isFormDisabled} style={inputStyle}>
              {SEATING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Halls Required">
            <input type="number" className="form-control" {...register('halls_required')} disabled={isFormDisabled} style={inputStyle} />
          </FieldGroup>
        </div>

        {/* ── Accommodation type selector cards ── */}
        <div>
          <p style={{
            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem'
          }}>
            Accommodation Type
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Non-Residential */}
            <div
              onClick={() => !isFormDisabled && setValue('residential_flag', false)}
              style={residentialCardStyle(!residentialFlag)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Home size={22} style={{ color: !residentialFlag ? '#6366f1' : 'var(--text-muted)' }} />
                {!residentialFlag && (
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Check size={12} style={{ color: 'white' }} />
                  </div>
                )}
              </div>
              <p style={{ fontWeight: '700', fontSize: 'var(--font-sm)', color: !residentialFlag ? '#4338ca' : 'var(--text-main)', margin: 0 }}>
                Non-Residential
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Day event — no overnight stay required
              </p>
            </div>

            {/* Residential */}
            <div
              onClick={() => !isFormDisabled && setValue('residential_flag', true)}
              style={residentialCardStyle(!!residentialFlag)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Building2 size={22} style={{ color: residentialFlag ? '#6366f1' : 'var(--text-muted)' }} />
                {residentialFlag && (
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Check size={12} style={{ color: 'white' }} />
                  </div>
                )}
              </div>
              <p style={{ fontWeight: '700', fontSize: 'var(--font-sm)', color: residentialFlag ? '#4338ca' : 'var(--text-main)', margin: 0 }}>
                Residential Event
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Hotel rooms needed for participant overnight stays
              </p>
            </div>
          </div>

          {/* Rooms Required — revealed when residential */}
          {residentialFlag && (
            <div style={{
              marginTop: '1rem', padding: '1rem 1.25rem',
              backgroundColor: '#eef2ff', borderRadius: '10px',
              border: '1px dashed #a5b4fc', maxWidth: '240px'
            }}>
              <FieldGroup label="Rooms Required">
                <input type="number" className="form-control" {...register('rooms_required')} disabled={isFormDisabled} style={inputStyle} />
              </FieldGroup>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — Requirements Specifications
      ══════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Wrench size={20} style={{ color: 'white' }} />}
          title="Requirements Specifications"
          subtitle="AV setup, food & beverage preferences, and travel logistics"
          gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <FieldGroup label="AV & Stage Requirements">
            <textarea
              className="form-control"
              placeholder="e.g. LED walls, stage, collar mics, projectors, console audio setup…"
              {...register('av_requirements')}
              disabled={isFormDisabled}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </FieldGroup>

          <FieldGroup label="Food & Beverage Requirements">
            <textarea
              className="form-control"
              placeholder="e.g. Lunch buffet, high tea, dinner specifications, beverage availability…"
              {...register('food_requirements')}
              disabled={isFormDisabled}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </FieldGroup>

          <FieldGroup label="Transfer & Travel Logistics">
            <textarea
              className="form-control"
              placeholder="e.g. Airport pickups, local shuttles, coordinator support required…"
              {...register('transfer_requirements')}
              disabled={isFormDisabled}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Bottom action bar (repeated for long-form convenience) ── */}
      {!isFormDisabled && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
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
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)'
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
