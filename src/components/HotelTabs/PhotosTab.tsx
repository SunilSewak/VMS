import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, ImagePlus } from 'lucide-react';
import type { HotelWithRelations, VenuePhoto } from '../../features/venues/types';
import { uploadVenuePhoto, deleteVenuePhoto } from '../../features/venues/venueService';
import { supabase } from '../../lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80';

interface PhotosTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} bytes`;
}

const fieldLabel = {
  display: 'block',
  fontSize: 'var(--font-sm)',
  fontWeight: 600,
  color: 'var(--text-main)',
  marginBottom: 'var(--space-2)',
} as const;

export function PhotosTab({ hotel, onRefresh }: PhotosTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [hallId, setHallId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const photoList = [...(hotel.photos || [])].sort((a, b) => {
    const orderA = a.display_order ?? 99;
    const orderB = b.display_order ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
  });

  const photoCount = photoList.length;
  const photoReady = photoCount >= 5;
  const halls = hotel.halls || [];

  function validateSelectedFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Please upload JPG, JPEG, PNG or WEBP images only.';
    if (file.size > MAX_FILE_SIZE) return 'Maximum file size is 10 MB. Please choose a smaller image.';
    return null;
  }

  async function handleUpload() {
    setError(null);
    setMessage(null);
    if (!selectedFile) {
      setError('Please choose an image to upload.');
      return;
    }
    const validationError = validateSelectedFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setUploading(true);
      await uploadVenuePhoto(hotel.id, selectedFile, hallId || null, caption.trim() || null);
      setMessage('Photo uploaded successfully.');
      setSelectedFile(null);
      setCaption('');
      setHallId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onRefresh();
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setError(err?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    try {
      await deleteVenuePhoto(photoId);
      setMessage('Photo deleted successfully.');
      onRefresh();
    } catch (err: any) {
      console.error('Photo delete failed:', err);
      setError(err?.message || 'Failed to delete photo.');
    }
  }

  function getHallLabel(photo: VenuePhoto) {
    if (!photo.hall_id) return 'Hotel-level photo';
    return halls.find((hall) => hall.id === photo.hall_id)?.hall_name || 'Hall photo';
  }

  const readinessColor = photoReady ? 'var(--status-success)' : 'var(--status-warning)';

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 340px) 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* ─── LEFT: Readiness + Upload ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Readiness */}
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary)', color: 'var(--text-on-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ImagePlus size={20} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)' }}>Photo readiness</p>
                <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  A hotel is photo-ready when it has at least 5 venue photos.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-5)', display: 'grid', gap: 'var(--space-3)' }}>
              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--font-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total hotel photos</p>
                <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)' }}>{photoCount}</p>
              </div>
              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Readiness status</p>
                    <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-main)' }}>{photoReady ? 'YES' : 'NO'}</p>
                  </div>
                  <span style={{
                    borderRadius: 'var(--radius-full)', padding: '4px 12px',
                    fontSize: 'var(--font-sm)', fontWeight: 700,
                    background: `color-mix(in srgb, ${readinessColor} 16%, transparent)`, color: readinessColor,
                  }}>
                    {photoReady ? '5+ Images' : 'Needs more'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)' }}>Upload new venue photo</p>
                <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>JPG, JPEG, PNG, WEBP. Max 10 MB.</p>
              </div>
              <span 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  borderRadius: 'var(--radius-full)', background: 'var(--surface-2)',
                  padding: '4px 12px', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--border)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              >
                <UploadCloud size={16} /> Upload
              </span>
            </div>

            <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={fieldLabel}>Select image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="input"
                  style={{ width: '100%' }}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setMessage(null);
                    setError(null);
                  }}
                />
                {selectedFile && (
                  <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                    Selected: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label style={fieldLabel}>Caption (optional)</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Describe the photo or hall location"
                />
              </div>

              <div>
                <label style={fieldLabel}>Attach to hall</label>
                <select
                  className="input"
                  style={{ width: '100%' }}
                  value={hallId}
                  onChange={(event) => setHallId(event.target.value)}
                >
                  <option value="">Hotel-wide photo</option>
                  {halls.map((hall) => (
                    <option key={hall.id} value={hall.id}>{hall.hall_name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={{ borderRadius: 'var(--radius-lg)', background: 'color-mix(in srgb, var(--status-error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)', padding: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--status-error)' }}>
                  {error}
                </div>
              )}
              {message && (
                <div style={{ borderRadius: 'var(--radius-lg)', background: 'color-mix(in srgb, var(--status-success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--status-success) 30%, transparent)', padding: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--status-success)' }}>
                  {message}
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
                style={{ width: '100%', justifyContent: 'center', opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Gallery ─── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>Venue Photo Gallery</p>
              <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Manage hotel and hall photos for this venue.</p>
            </div>
            <span style={{
              borderRadius: 'var(--radius-full)', padding: '4px 12px',
              fontSize: 'var(--font-sm)', fontWeight: 700,
              background: `color-mix(in srgb, ${readinessColor} 16%, transparent)`, color: readinessColor,
            }}>
              {photoReady ? 'Photo Readiness: YES' : 'Photo Readiness: NO'}
            </span>
          </div>

          {photoList.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--border)',
                background: 'var(--surface-2)',
                padding: 'var(--space-10)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <ImageIcon size={32} style={{ margin: '0 auto' }} />
              <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>No images uploaded yet.</p>
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-sm)' }}>Click here or use the upload panel to add photos.</p>
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-5)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              {photoList.map((photo) => {
                let imageSrc = FALLBACK_IMG;
                if (photo.storage_path) {
                  const { data } = supabase.storage.from('venue-photos').getPublicUrl(photo.storage_path);
                  imageSrc = data.publicUrl;
                }
                return (
                  <div key={photo.id} style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <div style={{ height: '180px', overflow: 'hidden', background: 'var(--surface-2)' }}>
                      <img
                        src={imageSrc}
                        alt={photo.file_name || 'Venue photo'}
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        onError={(event) => { (event.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                    </div>
                    <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 'var(--font-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{getHallLabel(photo)}</p>
                          <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {photo.file_name || 'No caption provided'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id)}
                          title="Delete photo"
                          style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-2)', border: 'none', background: 'transparent', color: 'var(--status-error)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--text-light)' }}>
                        <span>{formatDate(photo.uploaded_at)}</span>
                        {(photo as any).storage_path ? <span>• {String((photo as any).storage_path).split('/').pop()}</span> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
