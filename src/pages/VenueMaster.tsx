import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, AlertCircle, MapPin } from 'lucide-react';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';
import { HotelFormModal } from '../components/HotelFormModal';
import { getHotels, createHotel, updateHotel, deleteHotel } from '../features/venues/venueService';
import { ROUTES } from '../routes/routeRegistry';
import type { Hotel } from '../features/venues/types';
import type { HotelCreateInput, HotelUpdateInput } from '../features/venues/types';

export function VenueMaster() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHotels();
      setHotels(data || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load hotels');
      console.error('Error loading hotels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedHotel(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const navigate = useNavigate();

  const handleDetailsClick = (hotel: Hotel) => {
    navigate(ROUTES.venueAdminDetails.replace(':id', hotel.id));
  };

  const handleFormSave = async (input: HotelCreateInput | HotelUpdateInput) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && selectedHotel) {
        const updated = await updateHotel(selectedHotel.id, input as HotelUpdateInput);
        setHotels(hotels.map(h => h.id === selectedHotel.id ? updated : h));
        setSuccess('Hotel updated successfully');
      } else {
        const created = await createHotel(input as HotelCreateInput);
        setHotels([...hotels, created]);
        setSuccess('Hotel created successfully');
      }

      setTimeout(() => setSuccess(null), 3000);
      setIsFormOpen(false);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to save hotel';
      setError(errorMsg);
      console.error('Error saving hotel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (hotel: Hotel) => {
    setDeleteConfirm(hotel.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteHotel(deleteConfirm);
      setHotels(hotels.filter(h => h.id !== deleteConfirm));
      setDeleteConfirm(null);
      setSuccess('Hotel deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to delete hotel';
      setError(errorMsg);
      console.error('Error deleting hotel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  

  const columns: ColumnDefinition<Hotel>[] = [
    {
      header: 'Hotel Name',
      accessor: (row) => <strong>{row.hotel_name}</strong>,
      priority: 'always',
      mobileLabel: 'Name'
    },
    {
      header: 'City',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={14} />
          <span>{row.city?.city_name || 'N/A'}</span>
        </div>
      ),
      priority: 'tablet-desktop',
      mobileLabel: 'City'
    },
    {
      header: 'Rooms',
      accessor: (row) => row.total_rooms || '-',
      priority: 'tablet-desktop',
      mobileLabel: 'Rooms'
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge badge-${row.status === 'ACTIVE' ? 'success' : 'warning'}`}>
          {row.status}
        </span>
      ),
      priority: 'tablet-desktop',
      mobileLabel: 'Status'
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button
            onClick={() => handleDetailsClick(row)}
            title="View details"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              fontWeight: 600,
              fontSize: 'var(--font-sm)'
            }}
            disabled={isLoading}
          >
            Details
          </button>
          <button
            onClick={() => handleEditClick(row)}
            title="Edit hotel"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
            disabled={isLoading}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            title="Delete hotel"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
            disabled={isLoading || deleteConfirm === row.id}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      priority: 'always',
      mobileLabel: 'Actions'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Venue Master</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Manage hotels, halls, accommodations, and occupancy rules.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateClick} disabled={isLoading}>
          <Plus size={16} />
          <span>Add Hotel</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#059669',
          borderRadius: 'var(--radius-md)',
        }}>
          {success}
        </div>
      )}

      {/* Hotels Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', margin: 0 }}>Hotels</h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Showing {hotels.length} hotels</span>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <ResponsiveDataTable
            columns={columns}
            data={hotels}
            keyExtractor={(row) => row.id}
            emptyState={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hotels found. Create one to get started.</div>}
          />
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }} onClick={() => setDeleteConfirm(null)}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '400px',
            width: '90%',
            padding: 'var(--space-6)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Delete Hotel?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Are you sure? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Form Modal */}
      {isFormOpen && (
        <HotelFormModal
          hotel={isEditMode ? selectedHotel : null}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedHotel(null);
            setIsEditMode(false);
          }}
          onComplete={() => {
            setIsFormOpen(false);
            setSelectedHotel(null);
            setIsEditMode(false);
            loadHotels();
          }}
        />
      )}
    </div>
  );
}
