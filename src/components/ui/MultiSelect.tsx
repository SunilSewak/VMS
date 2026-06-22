import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string | number;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedIds: (string | number)[];
  onChange: (ids: (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function MultiSelect({ options, selectedIds, onChange, placeholder = "Select...", label, disabled = false }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));
  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleOption = (id: string | number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOption = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    onChange(selectedIds.filter(item => item !== id));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-1">{label}</label>}
      
      <div 
        className={`min-h-[42px] border rounded p-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer bg-white transition-colors ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'hover:border-vms-primary'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-gray-400 pl-2 text-sm">{placeholder}</span>
        )}
        
        {selectedOptions.map(opt => (
          <div key={opt.id} className="bg-vms-primary-light text-vms-primary-dark px-2 py-1 rounded-md flex items-center text-xs font-medium border border-vms-primary/20">
            {opt.label}
            {!disabled && (
              <X 
                className="w-3 h-3 ml-1.5 cursor-pointer hover:text-vms-primary text-vms-primary/70" 
                onClick={(e) => removeOption(e, opt.id)}
              />
            )}
          </div>
        ))}
        
        <div className="ml-auto pr-2 text-gray-400">
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-vms-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100 z-10">
            <input 
              type="text" 
              className="w-full p-2 text-sm border rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-vms-primary"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-center text-gray-500">No options found</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <div 
                    key={opt.id}
                    className={`px-3 py-2 text-sm rounded cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors ${isSelected ? 'bg-vms-primary-light/50 font-medium text-vms-primary-dark' : 'text-gray-700'}`}
                    onClick={() => toggleOption(opt.id)}
                  >
                    {opt.label}
                    {isSelected && <Check className="w-4 h-4 text-vms-primary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
