import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus, MapPin } from 'lucide-react';
import { City } from '../features/meetings/types';

export interface CitySelection {
  city_id: string | null;
  target_city_name: string | null;
}

interface CityComboboxProps {
  cities: City[];
  value: CitySelection;
  onChange: (value: CitySelection) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CityCombobox({
  cities,
  value,
  onChange,
  disabled = false,
  placeholder = 'Search or type city name…'
}: CityComboboxProps) {
  const getDisplayText = () => {
    if (value.city_id) {
      const match = cities.find(c => c.id === value.city_id);
      return match ? match.city_name : '';
    }
    return value.target_city_name || '';
  };

  const [inputText, setInputText] = useState(getDisplayText());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync display text when value changes externally (e.g. form reset on load)
  useEffect(() => {
    setInputText(getDisplayText());
  }, [value.city_id, value.target_city_name, cities.length]);

  // Close dropdown on outside click; revert input to last confirmed value
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputText(getDisplayText());
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [value]);

  const trimmed = inputText.trim();

  const filtered = trimmed
    ? cities.filter(c => c.city_name.toLowerCase().includes(trimmed.toLowerCase()))
    : cities;

  const hasExactMatch = cities.some(
    c => c.city_name.toLowerCase() === trimmed.toLowerCase()
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
    setIsOpen(true);
  }

  function handleSelectKnownCity(city: City) {
    onChange({ city_id: city.id, target_city_name: null });
    setInputText(city.city_name);
    setIsOpen(false);
  }

  function handleUseCustomCity() {
    if (!trimmed) return;
    onChange({ city_id: null, target_city_name: trimmed });
    setIsOpen(false);
  }

  const isKnownCity = !!value.city_id;
  const isCustomCity = !value.city_id && !!value.target_city_name;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{ width: '100%', paddingRight: '2rem', boxSizing: 'border-box' }}
        />
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Selection type badge */}
      {(isKnownCity || isCustomCity) && (
        <div style={{ marginTop: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isKnownCity && (
            <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
              <Check size={10} />
              Known City
            </span>
          )}
          {isCustomCity && (
            <span style={{ color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
              <MapPin size={10} />
              Custom City — stored as text
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '240px',
            overflowY: 'auto'
          }}
        >
          {/* Empty hint when no text typed */}
          {!trimmed && filtered.length === 0 && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Start typing to search cities…
            </div>
          )}

          {/* Matched city rows */}
          {filtered.map(city => {
            const isSelected = value.city_id === city.id;
            return (
              <div
                key={city.id}
                onClick={() => handleSelectKnownCity(city)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isSelected ? '#eef2ff' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = isSelected ? '#eef2ff' : 'var(--background)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = isSelected ? '#eef2ff' : 'transparent')}
              >
                <span>
                  {city.city_name}
                  {city.state && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '6px' }}>
                      ({city.state})
                    </span>
                  )}
                </span>
                {isSelected && <Check size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </div>
            );
          })}

          {/* Custom city option — shown when typed text has no exact match */}
          {trimmed && !hasExactMatch && (
            <div
              onClick={handleUseCustomCity}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                cursor: 'pointer',
                fontSize: 'var(--font-sm)',
                color: 'var(--primary)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                borderTop: filtered.length > 0 ? '1px solid var(--border)' : 'none',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--background)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Plus size={12} />
              <span>Use &ldquo;{trimmed}&rdquo;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
