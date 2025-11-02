import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from '../../components/common/LanguageToggle';
import './Header.css';


const Header = ({ onToggleSidebar }) => {
  const { t } = useTranslation('admin');
  const { admin } = useAuth();


  return (
    <header className="header">
      <div className="header-content">
        {/* Left side */}
        <div className="header-left">
          <button
            onClick={onToggleSidebar}
            className="menu-toggle-btn"
          >
            <Menu size={20} />
          </button>
          <h1 className="header-title">
            {t('header.title')}
          </h1>
        </div>


        {/* Right side */}
        <div className="header-right">
          <LanguageToggle />
          
          {/* Notifications */}
        


          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              <User className="user-icon" />
            </div>
            <div className="user-info">
              <p className="user-name">{admin?.username}</p>
              <p className="user-role">{t('header.role')}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;
