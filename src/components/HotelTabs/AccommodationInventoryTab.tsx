import { useState, useEffect } from 'react';
import { Edit2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import type { Hotel, AccommodationInventory } from '../../features/venues/types';
import { getAccommodationByHotel, deleteAccommodation } from '../../features/venues/venueService';
import { AccommodationInventoryEditor } from '../AccommodationInventoryEditor';

interface AccommodationInventoryTabProps {
  hotel: Hotel;
  onRefresh: () => void;
}

function RoomStat({ label, value, accent, pct }: { label: string; value: number; accent: string; pct?: string }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{label}</p>
      <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: accent }}>{value}</p>
      {pct !== undefined && <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-light)', marginTop: 'var(--space-1)' }}>{pct}</p>}
    </div>
  );
}

export function AccommodationInventoryTab({ hotel, onRefresh }: AccommodationInventoryTabProps) {
  const [inventory, setInventory] = useState<AccommodationInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingInventory, setEditingInventory] = useState<AccommodationInventory | null>(null);

  useEffect(() => {
    loadInventory();
  }, [hotel.id]);

  async function loadInventory() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccommodationByHotel(hotel.id);
      setInventory(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('Error loading accommodation:', err);
      setError('Failed to load accommodation inventory');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateClick() {
    setEditingInventory(null);
    setShowEditor(true);
  }

  function handleEditClick() {
    if (inventory) {
      setEditingInventory(inventory);
      setShowEditor(true);
    }
  }

  async function handleDeleteClick() {
    if (!inventory) return;
    if (!confirm('Are you sure you want to delete this accommodation inventory?')) return;
    try {
      await deleteAccommodation(inventory.id);
      setInventory(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting accommodation:', err);
      setError('Failed to delete accommodation inventory');
    }
  }

  async function handleFormComplete() {
    setShowEditor(false);
    setEditingInventory(null);
    await loadInventory();
    onRefresh();
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <span style={{ color: 'var(--text-muted)' }}>Loading accommodation inventory...</span>
      </div>
    );
  }

  const pct = (n?: number) => (n && inventory?.total_rooms ? `${((n / inventory.total_rooms) * 100).toFixed(0)}%` : '-');
  const allocated = inventory
    ? (inventory.single_rooms || 0) + (inventory.double_rooms || 0) + (inventory.triple_rooms || 0) + (inventory.quad_rooms || 0)
    : 0;
  const matches = inventory && allocated === inventory.total_rooms;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)' }}>Accommodation Inventory</h3>
        {inventory ? (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary" onClick={handleEditClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Edit2 size={16} /> Edit
            </button>
            <button className="btn btn-danger" onClick={handleDeleteClick}>Delete</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleCreateClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Plus size={16} /> Create Inventory
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: 'var(--space-4)', background: 'color-mix(in srgb, var(--status-error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 'var(--space-3)' }}>
          <AlertCircle size={20} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ color: 'var(--status-error)' }}>{error}</p>
        </div>
      )}

      {inventory ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: 'var(--space-4) var(--space-6)',
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Inventory Configuration</h4>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-sm)', fontWeight: 700,
              background: 'color-mix(in srgb, var(--status-success) 14%, transparent)', color: 'var(--status-success)',
            }}>
              <CheckCircle size={16} /> Configured
            </span>
          </div>

          <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-6)' }}>
              <RoomStat label="Total Rooms" value={inventory.total_rooms} accent="var(--text-main)" />
              <RoomStat label="Single Rooms" value={inventory.single_rooms || 0} accent="var(--primary)" pct={pct(inventory.single_rooms)} />
              <RoomStat label="Double Rooms" value={inventory.double_rooms || 0} accent="var(--status-success)" pct={pct(inventory.double_rooms)} />
              <RoomStat label="Triple Rooms" value={inventory.triple_rooms || 0} accent="#8b5cf6" pct={pct(inventory.triple_rooms)} />
              <RoomStat label="Quad Rooms" value={inventory.quad_rooms || 0} accent="var(--status-warning)" pct={pct(inventory.quad_rooms)} />
              <RoomStat label="Allocated" value={allocated} accent="var(--text-main)" pct={`of ${inventory.total_rooms}`} />
            </div>

            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border)' }}>
              {matches ? (
                <div style={{ padding: 'var(--space-3)', background: 'color-mix(in srgb, var(--status-success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--status-success) 30%, transparent)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 'var(--space-2)' }}>
                  <CheckCircle size={16} style={{ color: 'var(--status-success)', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--status-success)' }}>✓ Inventory allocation matches total rooms perfectly</p>
                </div>
              ) : (
                <div style={{ padding: 'var(--space-3)', background: 'color-mix(in srgb, var(--status-warning) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 'var(--space-2)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--status-warning)' }}>
                    ⚠ Inventory allocation ({allocated}) does not equal total rooms ({inventory.total_rooms})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)', padding: 'var(--space-12, 3rem)', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--text-light)' }} />
          <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>No Accommodation Inventory</h4>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
            Create an accommodation inventory to specify room allocations by type.
          </p>
          <button className="btn btn-primary" onClick={handleCreateClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Plus size={18} /> Create Inventory Now
          </button>
        </div>
      )}

      {showEditor && (
        <AccommodationInventoryEditor
          hotel={hotel}
          inventory={editingInventory}
          onClose={() => {
            setShowEditor(false);
            setEditingInventory(null);
          }}
          onComplete={handleFormComplete}
        />
      )}
    </div>
  );
}
