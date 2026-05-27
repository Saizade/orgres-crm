import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User, Target, CheckSquare } from 'lucide-react';
import { customerAPI, leadAPI, taskAPI } from '../../services/api';
import './Topbar.css';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview' },
  '/customers': { title: 'Customers', subtitle: 'Manage' },
  '/leads': { title: 'Leads', subtitle: 'Pipeline' },
  '/tasks': { title: 'Tasks', subtitle: 'Track' },
  '/ai-tools': { title: 'AI Tools', subtitle: 'Intelligence' },
  '/settings': { title: 'Settings', subtitle: 'Configure' },
};

const Topbar = ({ sidebarCollapsed, onMobileMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = pageTitles[location.pathname] || { title: 'Orgres CRM', subtitle: '' };

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setShowResults(true);
      try {
        const [custRes, leadRes, taskRes] = await Promise.allSettled([
          customerAPI.getAll(),
          leadAPI.getAll(),
          taskAPI.getAll(),
        ]);

        const q = query.toLowerCase();
        const items = [];

        if (custRes.status === 'fulfilled') {
          (custRes.value.data || []).forEach(c => {
            if (
              c.name?.toLowerCase().includes(q) ||
              c.email?.toLowerCase().includes(q) ||
              c.company?.toLowerCase().includes(q)
            ) {
              items.push({
                id: `c-${c.id}`,
                type: 'customer',
                icon: <User size={14} />,
                title: c.name,
                subtitle: c.company || c.email,
                link: '/customers',
              });
            }
          });
        }

        if (leadRes.status === 'fulfilled') {
          (leadRes.value.data || []).forEach(l => {
            if (
              l.title?.toLowerCase().includes(q) ||
              l.company?.toLowerCase().includes(q)
            ) {
              items.push({
                id: `l-${l.id}`,
                type: 'lead',
                icon: <Target size={14} />,
                title: l.title,
                subtitle: `${l.status} • ₹${l.value || 0}`,
                link: '/leads',
              });
            }
          });
        }

        if (taskRes.status === 'fulfilled') {
          (taskRes.value.data || []).forEach(t => {
            if (t.title?.toLowerCase().includes(q)) {
              items.push({
                id: `t-${t.id}`,
                type: 'task',
                icon: <CheckSquare size={14} />,
                title: t.title,
                subtitle: t.status,
                link: '/tasks',
              });
            }
          });
        }

        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleResultClick = (link) => {
    navigate(link);
    setQuery('');
    setShowResults(false);
  };

  // Notification functions
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const [custRes, leadRes, taskRes] = await Promise.allSettled([
        customerAPI.getAll(),
        leadAPI.getAll(),
        taskAPI.getAll(),
      ]);

      const items = [];
      if (custRes.status === 'fulfilled') {
        (custRes.value.data || []).slice(0, 3).forEach(c => {
          items.push({ id: `c-${c.id}`, icon: 'customer', title: `Customer: ${c.name}`, detail: c.company || c.email, time: c.createdAt });
        });
      }
      if (leadRes.status === 'fulfilled') {
        (leadRes.value.data || []).slice(0, 3).forEach(l => {
          items.push({ id: `l-${l.id}`, icon: 'lead', title: `Lead: ${l.title}`, detail: `Status: ${l.status}`, time: l.createdAt });
        });
      }
      if (taskRes.status === 'fulfilled') {
        (taskRes.value.data || []).filter(t => t.status !== 'completed').slice(0, 3).forEach(t => {
          const overdue = t.due_date && new Date(t.due_date) < new Date();
          items.push({ id: `t-${t.id}`, icon: 'task', title: `${overdue ? '⚠ ' : ''}Task: ${t.title}`, detail: t.due_date ? `Due: ${new Date(t.due_date).toLocaleDateString()}` : 'No due date', time: t.createdAt, urgent: overdue });
        });
      }
      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const toggleNotifications = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) fetchNotifications();
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const notifIconMap = {
    customer: <User size={14} />,
    lead: <Target size={14} />,
    task: <CheckSquare size={14} />,
  };

  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMobileMenuToggle} aria-label="Toggle menu">
          <Menu />
        </button>
        <div className="topbar-page-title">
          {currentPage.title}
          {currentPage.subtitle && <span>/ {currentPage.subtitle}</span>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search" ref={searchRef}>
          <Search />
          <input
            type="search"
            placeholder="Search customers, leads..."
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
          />

          {showResults && (
            <div className="search-dropdown">
              {searching ? (
                <div className="search-loading">Searching...</div>
              ) : results.length === 0 ? (
                <div className="search-empty">No results for "{query}"</div>
              ) : (
                results.map(r => (
                  <div key={r.id} className="search-item" onClick={() => handleResultClick(r.link)}>
                    <div className={`search-item-icon ${r.type}`}>{r.icon}</div>
                    <div className="search-item-content">
                      <div className="search-item-title">{r.title}</div>
                      <div className="search-item-subtitle">{r.subtitle}</div>
                    </div>
                    <span className="search-item-type">{r.type}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="topbar-notification-wrapper" ref={notifRef}>
          <button
            className={`topbar-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <Bell />
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>Notifications</h4>
                <button className="notif-close" onClick={() => setShowNotifications(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="notif-list">
                {notifLoading ? (
                  <div className="notif-loading">
                    <div className="skeleton" style={{ height: 48, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 48, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 48 }} />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={24} />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.urgent ? 'urgent' : ''}`}>
                      <div className={`notif-icon ${n.icon}`}>{notifIconMap[n.icon]}</div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-detail">{n.detail}</div>
                      </div>
                      <div className="notif-time">{timeAgo(n.time)}</div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="notif-footer"><span>{notifications.length} recent items</span></div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
