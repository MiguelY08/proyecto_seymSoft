import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

function FormSelect({
  value,
  options = [],
  onChange,
  icon: Icon,
  disabled = false,
  error = false,
  placeholder = 'Seleccionar',
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  optionClassName = '',
  ariaLabel,
  placement = 'auto',
  searchable = false,
  searchPlaceholder = 'Buscar...',
  noOptionsMessage = 'No se encontraron resultados',
  minDropdownWidth = 0,
  maxDropdownWidth,
  hideSelectedLabel = false,
}) {
  const safeOptions = Array.isArray(options) ? options : [];
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectedOption = safeOptions.find((option) => String(option.value) === String(value));
  const SelectedIcon = selectedOption?.icon || Icon;
  const selectedIconClassName = selectedOption?.iconClassName || 'text-gray-400';
  const hasIcon = Boolean(SelectedIcon);
  const normalizeSearch = (textValue) => String(textValue ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const normalizedSearchTerm = normalizeSearch(searchTerm.trim());
  const filteredOptions = searchable && normalizedSearchTerm
    ? safeOptions.filter((option) => normalizeSearch(option.label).includes(normalizedSearchTerm))
    : safeOptions;

  const updateDropdownPosition = useCallback(() => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const gap = 8;
    const maxHeight = 240;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportLeft = window.visualViewport?.offsetLeft ?? 0;
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const horizontalPadding = 8;
    const availableWidth = Math.max(120, viewportWidth - horizontalPadding * 2);
    const desiredWidth = Math.max(rect.width, Number(minDropdownWidth) || 0);
    const limitedWidth = Math.min(
      desiredWidth,
      Number(maxDropdownWidth) || availableWidth,
      availableWidth
    );
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const forceBottom = placement === 'bottom';
    const openUp = placement === 'top' || (placement === 'auto' && spaceBelow < 160 && spaceAbove > spaceBelow);
    const availableHeight = forceBottom
      ? Math.max(72, Math.min(maxHeight, Math.max(spaceBelow, 72)))
      : Math.max(120, Math.min(maxHeight, openUp ? spaceAbove : spaceBelow));
    const minLeft = viewportLeft + horizontalPadding;
    const maxLeft = viewportLeft + viewportWidth - horizontalPadding - limitedWidth;
    const left = Math.min(Math.max(rect.left, minLeft), Math.max(minLeft, maxLeft));
    const top = forceBottom
      ? rect.bottom + gap
      : openUp
      ? Math.max(viewportTop + gap, rect.top - availableHeight - gap)
      : Math.min(rect.bottom + gap, viewportTop + viewportHeight - gap - availableHeight);

    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width: limitedWidth,
      maxHeight: availableHeight,
      zIndex: 9999,
    });
  }, [maxDropdownWidth, minDropdownWidth, placement, setDropdownStyle]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = wrapperRef.current?.contains(event.target);
      const clickedDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedDropdown) {
        setIsOpen(false);
        setSearchTerm('');
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

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      setSearchTerm('');
    }
    setIsOpen((current) => !current);
  };

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        className={`
          w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-8 py-2.5 text-sm border rounded-lg outline-none
          transition-colors duration-200 flex items-center justify-between gap-2
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
          ${disabled ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 cursor-pointer hover:border-[#004D77]'}
          ${className} ${triggerClassName}
        `}
      >
        {SelectedIcon && (
          <SelectedIcon
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${selectedIconClassName}`}
            strokeWidth={1.8}
          />
        )}
        <span className={`truncate text-left ${hideSelectedLabel ? 'lg:hidden' : ''}`}>
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
          className={`bg-white border border-gray-300 rounded-lg shadow-2xl ring-1 ring-black/5 overflow-y-auto overscroll-contain ${dropdownClassName}`}
        >
          {searchable && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md outline-none text-gray-700 placeholder-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Limpiar busqueda"
                  >
                    <X className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option) => {
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
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">{noOptionsMessage}</p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default FormSelect;
