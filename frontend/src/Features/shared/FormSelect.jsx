import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

function FormSelect({
  value,
  options,
  onChange,
  icon: Icon,
  disabled = false,
  error = false,
  placeholder = 'Seleccionar',
  className = '',
  optionClassName = '',
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => String(option.value) === String(value));
  const SelectedIcon = selectedOption?.icon || Icon;
  const selectedIconClassName = selectedOption?.iconClassName || 'text-gray-400';
  const hasIcon = Boolean(SelectedIcon);

  const updateDropdownPosition = useCallback(() => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const gap = 1;
    const maxHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const availableHeight = Math.max(120, Math.min(maxHeight, openUp ? spaceAbove : spaceBelow));

    setDropdownStyle({
      position: 'fixed',
      top: openUp ? Math.max(gap, rect.top - availableHeight - gap) : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight: availableHeight,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = wrapperRef.current?.contains(event.target);
      const clickedDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((current) => !current)}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        className={`
          w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-8 py-2.5 text-sm border rounded-lg outline-none
          transition-colors duration-200 flex items-center justify-between gap-2
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
          ${disabled ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 cursor-pointer hover:border-[#004D77]'}
          ${className}
        `}
      >
        {SelectedIcon && (
          <SelectedIcon
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${selectedIconClassName}`}
            strokeWidth={1.8}
          />
        )}
        <span className="truncate text-left">
          {selectedOption?.label || placeholder}
        </span>
        {!disabled && (
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={2}
          />
        )}
      </button>

      {isOpen && !disabled && dropdownStyle && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-300 rounded-lg shadow-2xl ring-1 ring-black/5 overflow-y-auto"
        >
          <ul className="py-1">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              const OptionIcon = option.icon;

              return (
                <li key={`${option.value}-${option.label}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm transition-colors duration-150
                      ${isSelected ? 'bg-[#004D77]/10 text-[#004D77] cursor-pointer' : 'text-gray-700 hover:bg-[#004D77]/10 cursor-pointer'}
                      ${optionClassName}
                    `}
                  >
                    <div className="font-medium flex items-center gap-2">
                      {OptionIcon && (
                        <OptionIcon
                          className={`w-4 h-4 shrink-0 ${option.iconClassName || 'text-gray-400'}`}
                          strokeWidth={1.8}
                        />
                      )}
                      {option.label}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}

export default FormSelect;
