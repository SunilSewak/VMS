import { useState, useRef } from 'react';
import { UploadCloud, Image, Trash2, CheckCircle2, ImagePlus } from 'lucide-react';
import type { HotelWithRelations, VenuePhoto } from '../../features/venues/types';
import { uploadVenuePhoto, deleteVenuePhoto } from '../../features/venues/venueService';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface PhotosTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${size} bytes`;
}

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
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const photoCount = photoList.length;
  const photoReady = photoCount >= 5;
  const halls = hotel.halls || [];

  function validateSelectedFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload JPG, JPEG, PNG or WEBP images only.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Maximum file size is 10 MB. Please choose a smaller image.';
    }
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (!photo.hall_id) {
      return 'Hotel-level photo';
    }
    return halls.find((hall) => hall.id === photo.hall_id)?.hall_name || 'Hall photo';
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <ImagePlus size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Photo readiness</p>
                <p className="mt-2 text-sm text-slate-600">
                  A hotel is photo-ready when it has at least 5 venue photos.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total hotel photos</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{photoCount}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Readiness status</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">
                      {photoReady ? 'YES' : 'NO'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${photoReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {photoReady ? '5+ Images' : 'Needs more photos'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Upload new venue photo</p>
                <p className="mt-1 text-sm text-slate-500">Supported formats: JPG, JPEG, PNG, WEBP. Max size 10 MB.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                <UploadCloud size={16} />
                Upload
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Select image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setMessage(null);
                    setError(null);
                  }}
                />
                {selectedFile ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Selected: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Caption (optional)</label>
                <input
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                  placeholder="Describe the photo or hall location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Attach to hall</label>
                <select
                  value={hallId}
                  onChange={(event) => setHallId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  <option value="">Hotel-wide photo</option>
                  {halls.map((hall) => (
                    <option key={hall.id} value={hall.id}>{hall.hall_name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${uploading ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-slate-900">Venue Photo Gallery</p>
                <p className="mt-1 text-sm text-slate-500">Manage hotel and hall photos for this venue.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${photoReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {photoReady ? 'Photo Readiness: YES' : 'Photo Readiness: NO'}
              </span>
            </div>

            {photoList.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                <Image size={32} className="mx-auto" />
                <p className="mt-4 text-sm font-medium">No images uploaded yet.</p>
                <p className="mt-2 text-sm text-slate-500">Use the upload panel to add photos for the hotel or halls.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photoList.map((photo) => {
                  const imageSrc = photo.photo_url || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80';

                  return (
                    <div key={photo.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm">
                      <div className="relative h-52 overflow-hidden bg-slate-200">
                        <img
                          src={imageSrc}
                          alt={photo.caption || 'Venue photo'}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            (event.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                      <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{getHallLabel(photo)}</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 truncate">{photo.caption || 'No caption provided'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id)}
                          className="rounded-full p-2 text-rose-600 transition hover:bg-rose-50 hover:text-rose-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{formatDate(photo.created_at)}</span>
                        {photo.storage_path ? <span>• {photo.storage_path.split('/').pop()}</span> : null}
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
    </div>
  );
}
