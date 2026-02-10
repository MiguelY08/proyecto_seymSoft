import {
  LayoutDashboard,
  Users,
  UserSquare2,
  ShoppingCart,
  ShoppingBag,
  Tags,
  Package,
  Palette,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react";
const sidebar = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold text-gray-800">
            Papelería Magic
          </span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Inicio" />
          <SidebarItem icon={Users} label="Usuarios" hasSubmenu />
          <SidebarItem icon={UserSquare2} label="Clientes" />
          <SidebarItem icon={ShoppingCart} label="Ventas" hasSubmenu />
          <SidebarItem icon={ShoppingBag} label="Compras" hasSubmenu />
          <SidebarItem icon={Tags} label="Categorías" />
          <SidebarItem icon={Package} label="Productos" />
          <SidebarItem icon={Palette} label="Apariencia" hasSubmenu />
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400">
          v1.0.0 - 2024
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Opción sidebar</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-blue-600">opción submenu</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="relative text-gray-500 hover:text-blue-600">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800 leading-none">
                  Yorman Alirio O...
                </p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                  Administrador
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                YA
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 border-dashed min-h-[500px] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">
                El contenido de la sección aparecerá aquí
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default sidebar;
