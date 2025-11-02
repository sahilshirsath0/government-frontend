import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  ImageIcon, 
  Award, 
  Users, 
  MessageSquare,
  Settings,
  LogOut,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { t } = useTranslation('admin');
  const location = useLocation();
  const { logout } = useAuth();

  // Menu items
  const menuItems = [
    {
      id: 'dashboard',
      label: t('sidebar.dashboard'),
      icon: LayoutDashboard,
      path: '/admin-dashboard'
    },
    {
      id: 'announcements',
      label: t('sidebar.announcements'),
      icon: Megaphone,
      path: '/admin-dashboard/announcements'
    },
    {
      id: 'gallery',
      label: t('sidebar.gallery'),
      icon: ImageIcon,
      path: '/admin-dashboard/gallery'
    },
    {
      id: 'nagrik-seva',
      label: t('sidebar.nagrikSeva'),
      icon: Users,
      path: '/admin-dashboard/nagrik-seva'
    },
    {
      id: 'village-details',
      label: t('sidebar.villageDetails'),
      icon: MapPin,
      path: '/admin-dashboard/village-details'
    },
    {
      id: 'programs',
      label: t('sidebar.programs'),
      icon: Award,
      path: '/admin-dashboard/programs'
    },
    {
      id: 'awards',
      label: t('sidebar.awards'),
      icon: Award,
      path: '/admin-dashboard/awards'
    },
    {
      id: 'members',
      label: t('sidebar.members'),
      icon: Users,
      path: '/admin-dashboard/members'
    },
    {
      id: 'feedback',
      label: t('sidebar.feedback'),
      icon: MessageSquare,
      path: '/admin-dashboard/feedback'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-blue-900 text-white w-64 min-h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{t('sidebar.title')}</h1>
            <p className="text-blue-300 text-sm">{t('sidebar.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
                style={{ marginBottom: '12px' }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
