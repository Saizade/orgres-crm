import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Activity,
  Zap,
  LogOut,
  Server,
  Database,
  Cpu,
  Calendar,
  Info,
  AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get('http://localhost:8000/api/auth/me', {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('crm_token')}`,
          },
        });
        setApiStatus('connected');
      } catch {
        setApiStatus('disconnected');
      }
    };
    checkHealth();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently joined';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Recently joined';
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="settings-page-header">
        <h1>Settings</h1>
        <p>Manage your account and application preferences</p>
      </div>

      {/* Profile Section */}
      <div className="settings-section">
        <div className="settings-section-title">
          <User />
          Profile
        </div>
        <div className="settings-profile">
          <div className="settings-avatar">{getInitials(user?.name)}</div>
          <div className="settings-profile-info">
            <h2>{user?.name || 'User'}</h2>
            <span className="settings-profile-email">
              {user?.email || 'No email'}
            </span>
            <div className="settings-profile-meta">
              <span className="settings-role-badge">
                <Shield size={11} />
                {user?.role || 'User'}
              </span>
              <span className="settings-member-since">
                <Calendar size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                Member since {formatDate(user?.createdAt || user?.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="settings-section">
        <div className="settings-section-title">
          <Info />
          Account Information
        </div>
        <div className="settings-info-grid">
          <div className="settings-info-item">
            <span className="settings-info-label">
              <User /> Full Name
            </span>
            <div className="settings-info-value">{user?.name || '—'}</div>
          </div>
          <div className="settings-info-item">
            <span className="settings-info-label">
              <Mail /> Email Address
            </span>
            <div className="settings-info-value">{user?.email || '—'}</div>
          </div>
          <div className="settings-info-item">
            <span className="settings-info-label">
              <Shield /> Role
            </span>
            <div className="settings-info-value" style={{ textTransform: 'capitalize' }}>
              {user?.role || '—'}
            </div>
          </div>
          <div className="settings-info-item">
            <span className="settings-info-label">
              <Calendar /> Joined
            </span>
            <div className="settings-info-value">
              {formatDate(user?.createdAt || user?.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="settings-section">
        <div className="settings-section-title">
          <Activity />
          Application
        </div>
        <div className="settings-app-info-grid">
          <div className="settings-app-info-item">
            <span className="settings-app-info-label">App Name</span>
            <span className="settings-app-info-value">Orgres CRM</span>
          </div>
          <div className="settings-app-info-item">
            <span className="settings-app-info-label">Version</span>
            <span className="settings-app-info-value">1.0.0</span>
          </div>
          <div className="settings-app-info-item">
            <span className="settings-app-info-label">API Status</span>
            <span className="settings-api-status">
              {apiStatus === 'checking' ? (
                <>
                  <span
                    className="settings-status-dot"
                    style={{ background: 'var(--warning)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
                  />
                  <span style={{ color: 'var(--warning)' }}>Checking…</span>
                </>
              ) : apiStatus === 'connected' ? (
                <>
                  <span className="settings-status-dot connected" />
                  <span style={{ color: 'var(--success)' }}>Connected</span>
                </>
              ) : (
                <>
                  <span className="settings-status-dot disconnected" />
                  <span style={{ color: 'var(--danger)' }}>Disconnected</span>
                </>
              )}
            </span>
          </div>
          <div className="settings-app-info-item">
            <span className="settings-app-info-label">Environment</span>
            <span className="settings-app-info-value">Development</span>
          </div>
        </div>

        <div className="settings-tech-section-label">Tech Stack</div>
        <div className="settings-tech-badges">
          <span className="settings-tech-badge react">
            <Zap size={14} />
            React
          </span>
          <span className="settings-tech-badge node">
            <Server size={14} />
            Node.js
          </span>
          <span className="settings-tech-badge mysql">
            <Database size={14} />
            MySQL
          </span>
          <span className="settings-tech-badge ai">
            <Cpu size={14} />
            Gemini AI
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section settings-danger">
        <div className="settings-section-title">
          <AlertTriangle />
          Danger Zone
        </div>
        <div className="settings-danger-content">
          <div className="settings-danger-text">
            <h4>Sign out of your account</h4>
            <p>
              You will be redirected to the login page. All unsaved changes will
              be lost.
            </p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
