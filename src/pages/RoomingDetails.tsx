import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAccommodationPlanById, updateAccommodationUtilization } from '../features/rooming/roomingService';
import type { AccommodationPlan } from '../features/rooming/types';
import { ROUTES } from '../routes/routeRegistry';
import { EmptyState } from '../components/EmptyState';
import { ROLES } from '../auth/permissions';

export function RoomingDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const [plan, setPlan] = useState<AccommodationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [singleActual, setSingleActual] = useState(0);
  const [doubleActual, setDoubleActual] = useState(0);
  const [tripleActual, setTripleActual] = useState(0);
  const [actualPax, setActualPax] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Accommodation plan ID is missing.');
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const plan = await getAccommodationPlanById(id);
        if (mounted) {
          setPlan(plan);
          setSingleActual(plan.utilization?.single_rooms_actual ?? 0);
          setDoubleActual(plan.utilization?.double_rooms_actual ?? 0);
          setTripleActual(plan.utilization?.triple_rooms_actual ?? 0);
          setActualPax(plan.utilization?.actual_pax ?? 0);
          setRemarks(plan.utilization?.remarks ?? plan.remarks ?? '');
        }
      } catch (caught) {
        if (mounted) {
          setError((caught as Error).message ?? 'Unable to load accommodation plan.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const canManageAccommodation =
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.SALES_HEAD;

  const handleSaveUtilization = async () => {
    if (!plan) return;
    setOperationMessage(null);
    try {
      await updateAccommodationUtilization(plan.id, {
        plan_id: plan.id,
        single_rooms_actual: singleActual,
        double_rooms_actual: doubleActual,
        triple_rooms_actual: tripleActual,
        actual_pax: actualPax,
        remarks,
      });
      const refreshed = await getAccommodationPlanById(plan.id);
      setPlan(refreshed);
      setOperationMessage('Accommodation utilization saved successfully.');
    } catch (caught) {
      setOperationMessage((caught as Error).message ?? 'Unable to save accommodation utilization.');
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading accommodation details...</div>;
  }

  if (error || !plan) {
    return (
      <EmptyState
        title={error ? 'Unable to load accommodation plan' : 'Accommodation plan not found'}
        description={error ?? 'Please go back to the accommodation list and try again.'}
        icon={<Building2 size={48} style={{ color: 'var(--danger)' }} />}
      />
    );
  }

  const plannedCapacity = plan.single_rooms_planned + plan.double_rooms_planned + plan.triple_rooms_planned;
  const actualCapacity = singleActual + doubleActual + tripleActual;
  const variance = plannedCapacity - actualCapacity;
  const utilizationRate = plannedCapacity > 0 ? Math.round((actualCapacity / plannedCapacity) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Accommodation plan</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Review planned accommodation and reconcile actual room usage for this booking.
            </p>
          </div>
          <Link
            to={ROUTES.rooming}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to accommodation
          </Link>
        </div>
      </div>

      {operationMessage ? (
        <div style={{ marginBottom: 'var(--space-4)', padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
          {operationMessage}
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 'var(--space-5)' }}>
        <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-3)' }}>
            <Building2 size={18} />
            <h4 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>Plan summary</h4>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Booking</div>
              <div style={{ fontWeight: 600 }}>{plan.booking?.booking_reference ?? plan.booking_id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Venue</div>
              <div style={{ fontWeight: 600 }}>{plan.booking?.hotels?.hotel_name ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Meeting</div>
              <div style={{ fontWeight: 600 }}>{plan.booking?.meeting_requests?.meeting_name ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</div>
              <div style={{ fontWeight: 600 }}>{plan.status.replace('_', ' ')}</div>
            </div>
          </div>
        </section>

        <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-3)' }}>
            <CalendarDays size={18} />
            <h4 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>Utilization dashboard</h4>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Planned Rooms</div>
              <div style={{ fontWeight: 600 }}>{plannedCapacity}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Actual Rooms</div>
              <div style={{ fontWeight: 600 }}>{actualCapacity}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Utilization</div>
              <div style={{ fontWeight: 600 }}>{utilizationRate}%</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Variance</div>
              <div style={{ fontWeight: 600 }}>{variance}</div>
            </div>
          </div>
        </section>
      </div>

      <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-md)', fontWeight: 600 }}>Update actual utilization</h4>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Single rooms actual</div>
            <input
              type="number"
              min={0}
              value={singleActual}
              onChange={(event) => setSingleActual(Number(event.target.value))}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Double rooms actual</div>
            <input
              type="number"
              min={0}
              value={doubleActual}
              onChange={(event) => setDoubleActual(Number(event.target.value))}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Triple rooms actual</div>
            <input
              type="number"
              min={0}
              value={tripleActual}
              onChange={(event) => setTripleActual(Number(event.target.value))}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Actual pax</div>
            <input
              type="number"
              min={0}
              value={actualPax}
              onChange={(event) => setActualPax(Number(event.target.value))}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Remarks</div>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows={4}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <button
            type="button"
            onClick={handleSaveUtilization}
            disabled={!canManageAccommodation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.95rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary)',
              background: canManageAccommodation ? 'var(--primary)' : 'var(--border)',
              color: canManageAccommodation ? '#fff' : 'var(--text-muted)',
              cursor: canManageAccommodation ? 'pointer' : 'not-allowed',
            }}
          >
            Save utilization
          </button>
        </div>
      </section>
    </div>
  );
}
