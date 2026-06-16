import { useState, useEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { Plus } from 'lucide-react';
import type { Hall, HotelWithRelations } from '../../features/venues/types';
import { getHallsByHotel, deleteHall } from '../../features/venues/venueService';
import { HallFormModal } from '../HallFormModal';

interface HallsTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

export function HallsTab({ hotel, onRefresh }: HallsTabProps) {
  const [halls, setHalls] = useState<Hall[]>(hotel.halls || []);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);

  useEffect(() => {
    loadHalls();
  }, [hotel.id]);

  async function loadHalls() {
    try {
      setLoading(true);
      const data = await getHallsByHotel(hotel.id);
      setHalls(data);
    } catch (error) {
      console.error('Error loading halls:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(hallId: string) {
    if (!confirm('Delete Conference Room?\n\nThis action cannot be undone.')) return;
    try {
      await deleteHall(hallId);
      await loadHalls();
      onRefresh();
    } catch (error) {
      console.error('Error deleting hall:', error);
      alert('Failed to delete hall');
    }
  }

  function handleAddHall() {
    setEditingHall(null);
    setShowFormModal(true);
  }

  function handleEditHall(hall: Hall) {
    setEditingHall(hall);
    setShowFormModal(true);
  }

  async function handleFormComplete() {
    setShowFormModal(false);
    setEditingHall(null);
    await loadHalls();
    onRefresh();
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading conference rooms...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Conference Rooms</p>
          <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)' }}>{halls.length}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddHall}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* Halls Grid */}
      {halls.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-16)',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--border)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No conference rooms configured</p>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-light)', marginTop: 'var(--space-1)' }}>
            Add a conference room to enable meeting space bookings
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {halls.map((hall) => {
            const ioColor = hall.indoor_outdoor === 'INDOOR' ? 'var(--status-success)'
              : hall.indoor_outdoor === 'OUTDOOR' ? 'var(--status-warning)' : '#8b5cf6';
            const statusColor = hall.status === 'ACTIVE' ? 'var(--status-success)' : 'var(--status-error)';
            return (
              <div key={hall.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card Header */}
                <div style={{
                  padding: 'var(--space-4) var(--space-5)',
                  background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-main)' }}>{hall.hall_name}</h3>
                  <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <Badge color={ioColor}>{hall.indoor_outdoor}</Badge>
                    <Badge color={statusColor}>{hall.status}</Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {hall.floor_name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Floor Name:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{hall.floor_name}</span>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                    <CapacityBox label="Classroom" value={hall.classroom_capacity} accent="var(--primary)" />
                    <CapacityBox label="U-Shape" value={hall.u_shape_capacity} accent="var(--status-success)" />
                    <CapacityBox label="Cluster" value={hall.cluster_capacity} accent="#8b5cf6" />
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--space-2)' }}>
                  <button onClick={() => handleEditHall(hall)} style={actionBtn('var(--primary)')}>Edit</button>
                  <button onClick={() => handleDelete(hall.id)} style={actionBtn('var(--status-error)')}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showFormModal && (
        <HallFormModal
          hotel={hotel}
          hall={editingHall}
          onClose={() => {
            setShowFormModal(false);
            setEditingHall(null);
          }}
          onComplete={handleFormComplete}
        />
      )}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 'var(--radius-md)',
      background: `color-mix(in srgb, ${color} 14%, transparent)`,
      color,
    }}>
      {children}
    </span>
  );
}

function CapacityBox({ label, value, accent }: { label: string; value?: number | null; accent: string }) {
  const has = !!value;
  return (
    <div style={{
      background: has ? `color-mix(in srgb, ${accent} 10%, transparent)` : 'var(--surface-2)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2)',
      opacity: has ? 1 : 0.6,
    }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: has ? accent : 'var(--text-light)' }}>{value || '—'}</p>
    </div>
  );
}

function actionBtn(color: string): CSSProperties {
  return {
    flex: 1,
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color,
    fontWeight: 700,
    fontSize: 'var(--font-sm)',
    cursor: 'pointer',
  };
}
