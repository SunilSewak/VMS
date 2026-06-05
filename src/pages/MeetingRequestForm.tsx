import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from '../lib/shims/react-hook-form';
import { ArrowLeft, Save, Send, Edit3, AlertCircle, RefreshCw } from 'lucide-react';
import { useMeetingRequest, useMeetingMasters } from '../features/meetings/hooks';
import { createMeetingRequest, updateMeetingRequest } from '../features/meetings/api';
import { DEFAULT_FORM_VALUES, SEATING_STYLES } from '../features/meetings/constants';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes/routeRegistry';
import { CityCombobox, CitySelection } from '../components/CityCombobox';

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

  const { register, handleSubmit, reset, watch } = useForm({
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

      // Validation check
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
      ? `Edit Draft Request (${request?.request_number || '...'})` 
      : `Meeting Request Specs (${request?.request_number || '...'})`;

  const isLoading = mastersLoading || (!isCreate && requestLoading);
  const isFormDisabled = isView;

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
        <p>Loading request parameters...</p>
      </div>
    );
  }

  const loadError = mastersError || requestError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(ROUTES.meetingRequests)}
            style={{ padding: 'var(--space-2)' }}
            title="Back to listing"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>
              {pageTitle}
            </h3>
            {request && (
              <span className={`badge badge-${request.status === 'DRAFT' ? 'info' : 'warning'}`} style={{ fontSize: '11px' }}>
                Status: {request.status}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {isView && request?.status === 'DRAFT' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/meeting-requests/${id}/edit`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit3 size={16} />
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
                <Save size={16} />
                <span>Save Draft</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit((vals: any) => onSave(vals, 'SUBMITTED'))}
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>Submit Request</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Errors display */}
      {(loadError || submitError) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          color: '#ef4444',
          fontSize: 'var(--font-sm)'
        }}>
          <AlertCircle size={16} />
          <span>{submitError || loadError}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={(e) => e.preventDefault()} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
        
        {/* Section 1: Basic Specifications */}
        <div>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--primary)' }}>
            1. Basic Specifications
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Meeting Name <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Q3 Sales Briefing"
                {...register('meeting_name')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Division <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <select
                className="form-control"
                {...register('division_id')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>{div.division_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Meeting Type <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <select
                className="form-control"
                {...register('meeting_type_id')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              >
                <option value="">Select Meeting Type</option>
                {meetingTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.meeting_type_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location & Timing Details */}
        <div>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--primary)' }}>
            2. Location & Timings
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Target City <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <CityCombobox
                cities={cities}
                value={citySelection}
                onChange={setCitySelection}
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Zone
              </label>
              <select
                className="form-control"
                {...register('zone')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              >
                <option value="West">West</option>
                <option value="East">East</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="Central">Central</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Start Date <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-control"
                {...register('start_date')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                End Date <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-control"
                {...register('end_date')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Attendance, Seating & Logistics */}
        <div>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--primary)' }}>
            3. Setup & Capacity
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Expected PAX <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                type="number"
                className="form-control"
                {...register('expected_pax')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Guaranteed PAX <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                type="number"
                className="form-control"
                {...register('guaranteed_pax')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Seating Style
              </label>
              <select
                className="form-control"
                {...register('seating_style')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              >
                {SEATING_STYLES.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Halls Required
              </label>
              <input
                type="number"
                className="form-control"
                {...register('halls_required')}
                disabled={isFormDisabled}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontWeight: '600', fontSize: 'var(--font-sm)' }}>
              <input
                type="checkbox"
                {...register('residential_flag')}
                disabled={isFormDisabled}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Residential Event (Requires Hotel Rooms)</span>
            </label>

            {residentialFlag && (
              <div style={{ marginTop: 'var(--space-3)', maxWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Rooms Required
                </label>
                <input
                  type="number"
                  className="form-control"
                  {...register('rooms_required')}
                  disabled={isFormDisabled}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Specifications & Requirements */}
        <div>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--primary)' }}>
            4. Requirements Specifications
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                AV & Stage Requirements
              </label>
              <textarea
                className="form-control"
                placeholder="e.g. LED walls, Stage, Collar mics, Projectors, Console audio setup..."
                {...register('av_requirements')}
                disabled={isFormDisabled}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Food & Beverage Requirements
              </label>
              <textarea
                className="form-control"
                placeholder="e.g. Lunch buffet, High tea menu, Dinner specifications, Beverage availability..."
                {...register('food_requirements')}
                disabled={isFormDisabled}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Transfer / Travel Logistics
              </label>
              <textarea
                className="form-control"
                placeholder="e.g. Railway/Airport pickups needed, Local site shuttles, Coordinator help..."
                {...register('transfer_requirements')}
                disabled={isFormDisabled}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
