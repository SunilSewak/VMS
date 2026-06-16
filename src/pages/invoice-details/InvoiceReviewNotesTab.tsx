import { useState } from 'react';
import type { InvoiceReviewComment } from '../../features/invoices/types';
import type { UserProfile } from '../../types';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function InvoiceReviewNotesTab({
  comments,
  user,
  onAddComment,
  onResolveComment
}: {
  comments: InvoiceReviewComment[];
  user: UserProfile | null;
  onAddComment: (comment: string) => Promise<void>;
  onResolveComment: (id: string) => Promise<void>;
}) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
      <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Review Notes</h2>
      
      <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {comments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No review notes added yet.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ padding: 'var(--space-3)', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{c.user?.full_name ?? 'Unknown User'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</span>
              </div>
              <p style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>{c.comment}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {c.resolved ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>✓ Resolved</span>
                ) : (
                  <button
                    onClick={() => onResolveComment(c.id)}
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment or question..."
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
