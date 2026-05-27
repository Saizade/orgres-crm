import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import orgresLogo from '../../assets/orgres-logo.png';
import './Sidebar.css';

const navItems = [
  { section: 'Main' },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/leads', label: 'Leads', icon: Target },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { section: 'Intelligence' },
  { path: '/ai-tools', label: 'AI Tools', icon: Sparkles },
  { section: 'System' },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
        <ChevronLeft />
      </button>

      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <img src={orgresLogo} alt="Orgres" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} />
        </div>
        <div className="sidebar-brand-text">
          <h2>Orgres CRM</h2>
          <span>AI Powered CRM</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="sidebar-section-title">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut />
        <span className="sidebar-link-text">Logout</span>
      </button>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {getInitials(user?.name)}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'User'}</div>
          <div className="sidebar-user-role">{user?.role || 'sales'}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
