import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hotel, CalendarRange, Coins, CornerDownLeft, X } from 'lucide-react';
import { ROUTES } from '../routes/routeRegistry';

interface SearchResultItem {
  id: string;
  title: string;
  category: 'Hotels' | 'Halls' | 'Requests' | 'Bookings' | 'Invoices';
  subtitle: string;
  path: string;
}

const searchableData: SearchResultItem[] = [
  // Hotels
  { id: 'h1', title: 'Taj Lands End', category: 'Hotels', subtitle: 'Mumbai • 5-Star • Cap: 300', path: ROUTES.venueExplorer },
  { id: 'h2', title: 'Grand Hyatt', category: 'Hotels', subtitle: 'Goa • 5-Star • Cap: 500', path: ROUTES.venueExplorer },
  { id: 'h3', title: 'JW Marriott', category: 'Hotels', subtitle: 'Pune • 5-Star • Cap: 250', path: ROUTES.venueExplorer },
  { id: 'h4', title: 'Novotel Juhu', category: 'Hotels', subtitle: 'Mumbai • 4-Star • Cap: 200', path: ROUTES.venueExplorer },
  { id: 'h5', title: 'The Leela Palace', category: 'Hotels', subtitle: 'Bengaluru • 5-Star • Cap: 450', path: ROUTES.venueExplorer },
  
  // Halls
  { id: 'hl1', title: 'Grand Ballroom (Taj)', category: 'Halls', subtitle: 'Capacity: 300 Pax • Audio-Visual Equipped', path: ROUTES.venueExplorer },
  { id: 'hl2', title: 'Poolside Lawn (Hyatt)', category: 'Halls', subtitle: 'Capacity: 500 Pax • Outdoor Event Area', path: ROUTES.venueExplorer },
  
  // Bookings
  { id: 'b1', title: 'Board of Directors Meeting', category: 'Bookings', subtitle: '12 June 2026 • Confirmed', path: ROUTES.bookings },
  { id: 'b2', title: 'HR Annual Training Program', category: 'Bookings', subtitle: '24 June 2026 • Confirmed', path: ROUTES.bookings },

  // Invoices
  { id: 'i1', title: 'INV-2026-001 (Taj Lands End)', category: 'Invoices', subtitle: '₹4,50,000 • Paid', path: `${ROUTES.finance}?tab=invoices` },
  { id: 'i2', title: 'INV-2026-002 (Grand Hyatt)', category: 'Invoices', subtitle: '₹8,20,000 • Pending', path: `${ROUTES.finance}?tab=invoices` }
];

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandSearch({ isOpen, onClose }: CommandSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle Ctrl+K shortcut to open/close
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtered results
  const filtered = query.trim() === '' 
    ? searchableData.slice(0, 5) 
    : searchableData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      );

  // Keyboard navigation within results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  const handleSelect = (item: SearchResultItem) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  // Icon mapping helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hotels': return <Hotel size={16} />;
      case 'Halls': return <Hotel size={16} style={{ opacity: 0.7 }} />;
      case 'Bookings': return <CalendarRange size={16} />;
      case 'Invoices': return <Coins size={16} />;
      default: return <Search size={16} />;
    }
  };

  return (
    <div className="command-backdrop" onClick={onClose}>
      <div className="command-modal" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="command-search-wrapper">
          <Search size={20} style={{ color: 'var(--text-light)' }} />
          <input 
            ref={inputRef}
            type="text" 
            className="command-search-input" 
            placeholder="Search hotels, halls, bookings, invoices..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button onClick={onClose} style={{ color: 'var(--text-light)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search Results */}
        <div className="command-results">
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div>
              <div className="command-group-title">
                {query ? 'Search Results' : 'Recent / Recommended'}
              </div>
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div 
                    key={item.id}
                    className={`command-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ 
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex'
                      }}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="command-item-label">{item.title}</div>
                        <div className="command-item-meta">{item.subtitle}</div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--primary)', fontSize: '10px' }}>
                        <span>Navigate</span>
                        <CornerDownLeft size={10} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer keyboard helper */}
        <div className="command-footer">
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <span><span className="keycap">↑↓</span> to navigate</span>
            <span><span className="keycap">Enter</span> to select</span>
          </div>
          <div>
            <span><span className="keycap">ESC</span> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
