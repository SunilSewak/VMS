/**
 * Reusable Form Controls for AVEMS
 * 
 * Step 5: Request Form Optimization Components
 */

import React from 'react';
import { Check } from 'lucide-react';

// =====================================================================
// MULTI-SELECT CHECKBOX GROUP
// =====================================================================

interface MultiSelectCheckboxProps {
  options: readonly string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  columns?: number;
}

export function MultiSelectCheckbox({
  options,
  selectedValues,
  onChange,
  disabled = false,
  columns = 2,
}: MultiSelectCheckboxProps) {
  const handleToggle = (option: string) => {
    if (disabled) return;
    
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--space-3)',
      }}
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        
        return (
          <label
            key={option}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              background: isSelected ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleToggle(option)}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '4px',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                background: isSelected ? 'var(--primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isSelected && <Check size={14} color="white" strokeWidth={3} />}
            </div>
            <span
              style={{
                fontSize: 'var(--font-sm)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--primary)' : 'var(--text)',
              }}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// =====================================================================
// RADIO BUTTON GROUP
// =====================================================================

interface RadioGroupProps {
  options: Array<{ value: string; label: string }>;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inline?: boolean;
}

export function RadioGroup({
  options,
  selectedValue,
  onChange,
  disabled = false,
  inline = false,
}: RadioGroupProps) {
  return (
    <div
      style={{
        display: inline ? 'flex' : 'grid',
        flexDirection: inline ? 'row' : undefined,
        gap: 'var(--space-3)',
        flexWrap: inline ? 'wrap' : undefined,
      }}
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        
        return (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              background: isSelected ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
            onClick={() => !disabled && onChange(option.value)}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isSelected && (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 'var(--font-sm)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--primary)' : 'var(--text)',
              }}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// =====================================================================
// MULTI-SELECT DROPDOWN
// =====================================================================

interface MultiSelectDropdownProps {
  options: readonly string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSelections?: number;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  disabled = false,
  placeholder = 'Select options...',
  maxSelections,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    if (disabled) return;
    
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return; // Don't add if max reached
      }
      onChange([...selectedValues, option]);
    }
  };

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(selectedValues.filter(v => v !== option));
    }
  };

  const displayText = selectedValues.length === 0
    ? placeholder
    : `${selectedValues.length} selected`;

  const isMaxReached = maxSelections ? selectedValues.length >= maxSelections : false;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Selected Items Display */}
      {selectedValues.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {selectedValues.map((value) => (
            <span
              key={value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: '4px 8px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
              }}
            >
              {value}
              {!disabled && (
                <button
                  onClick={(e) => handleRemove(value, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="input"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ color: selectedValues.length === 0 ? 'var(--text-muted)' : 'var(--text)' }}>
          {displayText}
        </span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {/* Max Selection Warning */}
      {isMaxReached && (
        <div
          style={{
            marginTop: 'var(--space-1)',
            fontSize: 'var(--font-xs)',
            color: 'var(--status-warning)',
          }}
        >
          Maximum {maxSelections} selections allowed
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            const isDisabled = isMaxReached && !isSelected;
            
            return (
              <div
                key={option}
                onClick={() => !isDisabled && handleToggle(option)}
                style={{
                  padding: 'var(--space-3)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  background: isSelected ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                  opacity: isDisabled ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 5%, transparent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.background = isSelected
                      ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                      : 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '4px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: 'var(--font-sm)',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'var(--primary)' : 'var(--text)',
                  }}
                >
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// FORM SECTION WRAPPER
// =====================================================================

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function FormSection({ title, description, children, icon }: FormSectionProps) {
  return (
    <div
      style={{
        background: 'var(--background)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        border: '2px solid var(--border)',
      }}
    >
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h3
          style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 700,
            marginBottom: description ? 'var(--space-2)' : 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {icon}
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

