import { Search, Plus, ListFilter, CircleCheck, CircleX, X } from 'lucide-react';
import Permission from '../../../configuration/roles/components/Permission';
import ButtonComponent from '../../../../shared/ButtonComponent';
import FormSelect from '../../../../shared/FormSelect';

function ProvidersToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onNewClick,
}) {
  const statusOptions = [
    { value: '', label: 'Todos', icon: ListFilter, iconClassName: 'text-gray-400' },
    { value: 'activo', label: 'Activos', icon: CircleCheck, iconClassName: 'text-green-600' },
    { value: 'inactivo', label: 'Inactivos', icon: CircleX, iconClassName: 'text-red-500' },
  ];

  return (
    <div className="flex flex-col gap-3 shrink-0 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4 lg:flex-1">
        <div className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-16 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200"
            aria-label="Buscar proveedores"
          />
          {searchTerm && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSearchChange('')}
              className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-[#004D77]"
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div className="w-full lg:w-48">
          <FormSelect
            value={statusFilter}
            options={statusOptions}
            onChange={onStatusChange}
            icon={ListFilter}
            placeholder="Estado"
            ariaLabel="Estado de proveedor"
            placement="bottom"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 lg:w-auto">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Permission permission="proveedores.crear">
            <ButtonComponent
              onClick={onNewClick}
              title="Nuevo"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <span className="hidden sm:inline">Nuevo</span>
              <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </ButtonComponent>
          </Permission>
        </div>
      </div>
    </div>
  );
}

export default ProvidersToolbar;
