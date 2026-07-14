import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Wrench } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Şimdilik sadece state veya UI olarak çıkış yapılıp login sayfasına dönülecek
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen bg-bgSurface border-r border-gray-200 flex flex-col justify-between p-4 sticky top-0">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <Wrench size={24} />
          </div>
          <h1 className="text-xl font-bold text-textPrimary tracking-tight">PitStop</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-textPrimary'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium w-full text-left"
      >
        <LogOut size={20} />
        <span>Çıkış Yap</span>
      </button>
    </aside>
  );
};

export default Sidebar;
