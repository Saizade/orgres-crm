import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, ArrowRight, Sparkles, BarChart3, Users } from 'lucide-react';
import orgresLogo from '../assets/orgres-logo.png';
import toast from 'react-hot-toast';
import './Login.css';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sales');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
    const classes = ['', 'weak', 'fair', 'good', 'strong', 'strong'];
    return { score: Math.min(score, 4), label: labels[score] || 'Weak', className: classes[score] || 'weak' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      {/* Left Panel — Animated Gradient Mesh */}
      <div className="auth-left">
        <div className="auth-orbs">
          <div className="auth-orb auth-orb--1" />
          <div className="auth-orb auth-orb--2" />
          <div className="auth-orb auth-orb--3" />
          <div className="auth-orb auth-orb--4" />
          <div className="auth-orb auth-orb--5" />
        </div>

        <div className="auth-grid" />

        <div className="auth-particles">
          <div className="auth-particle" />
          <div className="auth-particle" />
          <div className="auth-particle" />
          <div className="auth-particle" />
          <div className="auth-particle" />
          <div className="auth-particle" />
        </div>

        <div className="auth-brand">
          <div className="auth-brand-logo">
            <img src={orgresLogo} alt="Orgres" style={{ width: 56, height: 56, objectFit: 'contain' }} />
          </div>
          <h1>Orgres CRM</h1>
          <p>Intelligent Customer Management powered by AI</p>

          <div className="auth-brand-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Sparkles />
              </div>
              <span>AI-powered customer insights</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <BarChart3 />
              </div>
              <span>Advanced analytics dashboard</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Users />
              </div>
              <span>Team collaboration tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Get started with Orgres CRM in seconds</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrapper">
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                />
                <div className="auth-input-icon">
                  <User />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <div className="auth-input-icon">
                  <Mail />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="reg-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <div className="auth-input-icon">
                  <Lock />
                </div>
              </div>
              {password && (
                <>
                  <div className="password-strength">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`password-strength-bar ${
                          level <= passwordStrength.score ? `active ${passwordStrength.className}` : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="password-strength-label">{passwordStrength.label}</div>
                </>
              )}
            </div>

            <div className="auth-input-group">
              <label htmlFor="role">Role</label>
              <div className="auth-input-wrapper">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                </select>
                <div className="auth-input-icon">
                  <Shield />
                </div>
              </div>
            </div>

            <div className="auth-security-note">
              <Lock />
              <span>Your data is encrypted and securely stored. We never share your information.</span>
            </div>

            <div className="auth-submit">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                <div className="auth-btn-content">
                  {loading ? (
                    <>
                      <div className="auth-spinner" />
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="auth-footer">
            <span>Already have an account? </span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
