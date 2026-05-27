import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, BarChart3, Users } from 'lucide-react';
import orgresLogo from '../assets/orgres-logo.png';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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

      {/* Right Panel — Login Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your Orgres CRM account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
                <div className="auth-input-icon">
                  <Mail />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="auth-input-icon">
                  <Lock />
                </div>
              </div>
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
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="auth-footer">
            <span>Don&apos;t have an account? </span>
            <Link to="/register">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
