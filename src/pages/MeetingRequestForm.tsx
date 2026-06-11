import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMeetingRequest, useMeetingMasters } from '../features/meetings/hooks';
import { createMeetingRequest, updateMeetingRequest } from '../features/meetings/meetingService';
import { useRequestShortlists } from '../features/venues/hooks';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { MeetingRequest } from '../features/meetings/types';

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }}>
      {children}
    </div>
  );
}

const initialFormState = {
  meeting_name: '',
  division_id: '',
  meeting_type_id: '',
  city_id: '',
  zone: '',
  start_date: '',
  end_date: '',
  expected_pax: 0,
  guaranteed_pax: 0,
  residential_flag: false,
  rooms_required: 0,
  halls_required: 0,
  seating_style: '',
  av_requirements: '',
  food_requirements: '',
  transfer_requirements: '',
};

export function MeetingRequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { request, loading: requestLoading, refresh } = useMeetingRequest(id as string | undefined);
  const { shortlists } = useRequestShortlists(request?.id ?? null);
  const { divisions, cities, meetingTypes, loading: mastersLoading, error: mastersError } = useMeetingMasters();

  const [form, setForm] = useState<typeof initialFormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = !!(user && (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN));
  const canEdit = !isAdmin && (!request || request.status === 'DRAFT');

  useEffect(() => {
    if (!request) {
      setForm((current) => ({
        ...current,
        division_id: user?.division_id ?? current.division_id,
      }));
      return;
    }

    setForm({
      meeting_name: request.meeting_name || '',
      division_id: request.division_id || user?.division_id || '',
      meeting_type_id: request.meeting_type_id || '',
      city_id: request.city_id || '',
      zone: request.zone || '',
      start_date: request.start_date || '',
      end_date: request.end_date || '',
      expected_pax: request.expected_pax ?? 0,
      guaranteed_pax: request.guaranteed_pax ?? 0,
      residential_flag: !!request.residential_flag,
      rooms_required: request.rooms_required ?? 0,
      halls_required: request.halls_required ?? 0,
      seating_style: request.seating_style || '',
      av_requirements: request.av_requirements || '',
      food_requirements: request.food_requirements || '',
      transfer_requirements: request.transfer_requirements || '',
    });
  }, [request, user?.division_id]);

  const handleChange = (field: keyof typeof initialFormState, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      if (request) {
        await updateMeetingRequest(request.id, { ...form });
        await refresh?.();
        alert('Draft saved successfully.');
      } else if (user) {
        const created = await createMeetingRequest({ ...form }, user);
        navigate(ROUTES.meetingRequestView.replace(':id', created.id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      if (request) {
        await updateMeetingRequest(request.id, { ...form }, 'SUBMITTED_TO_ADMIN');
        await refresh?.();
      } else if (user) {
        const created = await createMeetingRequest({ ...form }, user, 'SUBMITTED_TO_ADMIN');
        navigate(ROUTES.meetingRequestView.replace(':id', created.id));
      }
      alert('Request submitted to Admin.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  if (requestLoading || mastersLoading) return <div style={{ padding: 24 }}>Loading request form…</div>;
  if (mastersError) return <div style={{ padding: 24, color: 'red' }}>Failed to load form options: {mastersError}</div>;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 20, display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0 }}>{request ? `Request ${request.request_number}` : 'New Request'}</h2>

      {isAdmin ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Panel>
            <h3 style={{ marginTop: 0 }}>Request Summary</h3>
            <div><strong>Meeting:</strong> {request?.meeting_name ?? '—'}</div>
            <div><strong>Division:</strong> {request?.divisions?.division_name ?? '—'}</div>
            <div><strong>Type:</strong> {request?.meeting_types?.meeting_type_name ?? '—'}</div>
            <div><strong>City:</strong> {request?.cities?.city_name ?? request?.target_city_name ?? '—'}</div>
            <div><strong>Zone:</strong> {request?.zone ?? '—'}</div>
            <div><strong>Dates:</strong> {request?.start_date ?? '—'} — {request?.end_date ?? '—'}</div>
            <div><strong>Pax:</strong> {request?.expected_pax ?? 0} expected / {request?.guaranteed_pax ?? 0} guaranteed</div>
            <div><strong>Accommodation Required:</strong> {request?.residential_flag ? 'Yes' : 'No'}</div>
            <div><strong>Rooms Required:</strong> {request?.rooms_required ?? 0}</div>
            <div><strong>Halls Required:</strong> {request?.halls_required ?? 0}</div>
            <div><strong>Seating Style:</strong> {request?.seating_style || '—'}</div>
            <div><strong>AV Requirements:</strong> {request?.av_requirements || '—'}</div>
            <div><strong>Food Requirements:</strong> {request?.food_requirements || '—'}</div>
            <div><strong>Transport Requirements:</strong> {request?.transfer_requirements || '—'}</div>
            <hr />
            <h4>Sales Head Recommendations</h4>
            {shortlists && shortlists.length > 0 ? (
              <ul>
                {shortlists.map((s) => (
                  <li key={s.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{s.hotels?.hotel_name ?? s.hotel_id}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`${ROUTES.venueDetails}?id=${s.hotel_id}`)} className="btn btn-secondary">View</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No recommendations submitted.</div>
            )}
          </Panel>

          <Panel>
            <h3 style={{ marginTop: 0 }}>Admin Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary" onClick={async () => {
                if (!request) return;
                await updateMeetingRequest(request.id, {}, 'AVAILABILITY_CHECK');
                refresh?.();
                alert('Availability check started');
              }}>
                Check Availability
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(`${ROUTES.venueExplorer}?requestId=${id}`)}>
                Find Matching Venues
              </button>
              <button className="btn btn-primary" onClick={() => navigate(`${ROUTES.bookingNew}?requestId=${id}`)}>
                Create Booking
              </button>
            </div>
          </Panel>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          <Panel>
            <h3 style={{ marginTop: 0 }}>Editable Request Form</h3>
            {request && request.status !== 'DRAFT' && (
              <div style={{ marginBottom: 12, color: 'var(--text-muted)' }}>
                This request has been submitted and is now read-only.
              </div>
            )}
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'block', fontWeight: 600 }}>Meeting Name</label>
                <input
                  value={form.meeting_name}
                  onChange={(e) => handleChange('meeting_name', e.target.value)}
                  disabled={!canEdit}
                  className="input"
                  placeholder="Enter meeting name"
                />
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Division</label>
                  <select
                    value={form.division_id}
                    onChange={(e) => handleChange('division_id', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                  >
                    <option value="">Select division</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>{division.division_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Meeting Type</label>
                  <select
                    value={form.meeting_type_id}
                    onChange={(e) => handleChange('meeting_type_id', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                  >
                    <option value="">Select meeting type</option>
                    {meetingTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.meeting_type_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>City</label>
                  <select
                    value={form.city_id}
                    onChange={(e) => handleChange('city_id', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                  >
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.city_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Zone</label>
                  <input
                    value={form.zone}
                    onChange={(e) => handleChange('zone', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                    placeholder="Enter zone or area"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Expected Pax</label>
                  <input
                    type="number"
                    min={0}
                    value={form.expected_pax}
                    onChange={(e) => handleChange('expected_pax', Number(e.target.value))}
                    disabled={!canEdit}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Guaranteed Pax</label>
                  <input
                    type="number"
                    min={0}
                    value={form.guaranteed_pax}
                    onChange={(e) => handleChange('guaranteed_pax', Number(e.target.value))}
                    disabled={!canEdit}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Accommodation Requirement</label>
                  <select
                    value={form.residential_flag ? 'yes' : 'no'}
                    onChange={(e) => handleChange('residential_flag', e.target.value === 'yes')}
                    disabled={!canEdit}
                    className="input"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Hall Requirement</label>
                  <input
                    type="number"
                    min={0}
                    value={form.halls_required}
                    onChange={(e) => handleChange('halls_required', Number(e.target.value))}
                    disabled={!canEdit}
                    className="input"
                    placeholder="Number of halls"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Rooms Required</label>
                  <input
                    type="number"
                    min={0}
                    value={form.rooms_required}
                    onChange={(e) => handleChange('rooms_required', Number(e.target.value))}
                    disabled={!canEdit}
                    className="input"
                    placeholder="Number of rooms"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Seating Style</label>
                  <input
                    value={form.seating_style}
                    onChange={(e) => handleChange('seating_style', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                    placeholder="e.g. Theatre, Classroom"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>AV Requirements</label>
                  <textarea
                    value={form.av_requirements}
                    onChange={(e) => handleChange('av_requirements', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                    rows={3}
                    placeholder="Describe audio / visual needs"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Food Requirements</label>
                  <textarea
                    value={form.food_requirements}
                    onChange={(e) => handleChange('food_requirements', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                    rows={3}
                    placeholder="Describe catering needs"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600 }}>Transport Requirements</label>
                  <textarea
                    value={form.transfer_requirements}
                    onChange={(e) => handleChange('transfer_requirements', e.target.value)}
                    disabled={!canEdit}
                    className="input"
                    rows={3}
                    placeholder="Describe transport support needed"
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--status-danger)', fontWeight: 600 }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={!canEdit || saving}>
                  Save Draft
                </button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={!canEdit || saving}>
                  Submit Request
                </button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

export default MeetingRequestForm;
