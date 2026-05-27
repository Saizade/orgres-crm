import React, { useState, useEffect, useRef } from 'react';
import { aiAPI, customerAPI, leadAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Mail,
  BarChart3,
  FileText,
  MessageSquare,
  Target,
  Sparkles,
  Send,
  Copy,
  Check,
  Loader2,
  Zap,
} from 'lucide-react';
import './AITools.css';

const TABS = [
  { id: 'email', label: 'Email Generator', icon: Mail, color: '#6366f1' },
  { id: 'insights', label: 'Customer Insights', icon: BarChart3, color: '#06b6d4' },
  { id: 'meeting', label: 'Meeting Summary', icon: FileText, color: '#f59e0b' },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: '#10b981' },
  { id: 'scoring', label: 'Lead Scoring', icon: Target, color: '#8b5cf6' },
];

const EMAIL_TYPES = ['Cold Email', 'Follow-up', 'Marketing', 'Thank You'];

/* ========== Main Component ========== */
export default function AITools() {
  const [activeTab, setActiveTab] = useState('email');

  return (
    <div className="ai-tools-page">
      {/* Decorative background orbs */}
      <div className="ai-orb ai-orb-1" />
      <div className="ai-orb ai-orb-2" />

      <div className="ai-tools-content">
        {/* Page Header */}
        <div className="ai-page-header">
          <h1>
            <span className="ai-header-glow">
              <Sparkles size={28} className="text-gradient" />
              <span className="text-gradient">AI Command Center</span>
            </span>
          </h1>
          <p>Supercharge your CRM workflow with intelligent AI-powered tools</p>
        </div>

        {/* Tab Navigation */}
        <div className="ai-tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
                data-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span className="ai-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="ai-tab-content" key={activeTab}>
          {activeTab === 'email' && <EmailGenerator />}
          {activeTab === 'insights' && <CustomerInsights />}
          {activeTab === 'meeting' && <MeetingSummary />}
          {activeTab === 'chat' && <AIChat />}
          {activeTab === 'scoring' && <LeadScoring />}
        </div>
      </div>
    </div>
  );
}

/* ========== Shared Components ========== */
function ShimmerLoading() {
  return (
    <div className="ai-shimmer-block">
      <div className="ai-shimmer-line" />
      <div className="ai-shimmer-line" />
      <div className="ai-shimmer-line" />
      <div className="ai-shimmer-line" />
      <div className="ai-shimmer-line" />
      <div className="ai-shimmer-line" />
    </div>
  );
}

function ResultCard({ text, title = 'AI Response' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="ai-result-card">
      <div className="ai-result-header">
        <h4>
          <span className="ai-result-dot" />
          {title}
        </h4>
        <button
          className={`ai-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="ai-result-text">{text}</div>
    </div>
  );
}

/* ========== Email Generator ========== */
function EmailGenerator() {
  const [form, setForm] = useState({
    type: 'Cold Email',
    customerName: '',
    company: '',
    context: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.customerName.trim()) {
      toast.error('Please enter a customer name');
      return;
    }

    setLoading(true);
    setResult('');
    try {
      const res = await aiAPI.generateEmail({
        type: form.type,
        customerName: form.customerName,
        company: form.company,
        context: form.context,
      });
      setResult(res.data.email || res.data.result || res.data.message || JSON.stringify(res.data, null, 2));
      toast.success('Email generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-section-layout">
      <div className="ai-form-card">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)' }} />
        <h3>
          <Mail size={20} style={{ color: '#6366f1' }} />
          Compose AI Email
        </h3>

        <div className="ai-form-grid">
          <div className="input-group">
            <label>Email Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              {EMAIL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="e.g. John Smith"
            />
          </div>

          <div className="input-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="input-group full-width">
            <label>Context / Notes</label>
            <textarea
              name="context"
              value={form.context}
              onChange={handleChange}
              placeholder="Provide additional context for the AI to craft a better email..."
              rows={4}
            />
          </div>
        </div>

        <div className="ai-form-actions">
          <button
            className="ai-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="spinner" />
            ) : (
              <Sparkles size={18} />
            )}
            {loading ? 'Generating...' : 'Generate Email'}
          </button>
        </div>
      </div>

      {loading && <ShimmerLoading />}
      {result && !loading && <ResultCard text={result} title="Generated Email" />}
    </div>
  );
}

/* ========== Customer Insights ========== */
function CustomerInsights() {
  const [customers, setCustomers] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customerAPI.getAll();
        setCustomers(res.data);
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setFetching(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleAnalyze = async () => {
    if (customers.length === 0) {
      toast.error('No customers to analyze');
      return;
    }

    setLoading(true);
    setResult('');
    try {
      const res = await aiAPI.customerInsights({ customers });
      setResult(res.data.insights || res.data.result || res.data.message || JSON.stringify(res.data, null, 2));
      toast.success('Insights generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-section-layout">
      <div className="ai-action-card">
        <div className="ai-action-icon insights">
          <BarChart3 size={24} />
        </div>
        <h3>Customer Intelligence</h3>
        <p>
          Analyze your entire customer base with AI to uncover patterns, segments,
          and actionable insights.
        </p>

        {!fetching && (
          <div className="ai-info-banner" style={{ width: '100%', maxWidth: 500 }}>
            <BarChart3 size={18} />
            <p>
              <span className="ai-count">{customers.length}</span>{' '}
              customer{customers.length !== 1 ? 's' : ''} ready for analysis
            </p>
          </div>
        )}

        <button
          className="ai-generate-btn ai-btn-cyan"
          onClick={handleAnalyze}
          disabled={loading || fetching}
        >
          {loading ? (
            <Loader2 size={18} className="spinner" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'Analyzing...' : 'Analyze All Customers'}
        </button>
      </div>

      {loading && <ShimmerLoading />}
      {result && !loading && <ResultCard text={result} title="Customer Insights" />}
    </div>
  );
}

/* ========== Meeting Summary ========== */
function MeetingSummary() {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error('Please enter meeting notes or transcript');
      return;
    }

    setLoading(true);
    setResult('');
    try {
      const res = await aiAPI.meetingSummary({ transcript });
      setResult(res.data.summary || res.data.result || res.data.message || JSON.stringify(res.data, null, 2));
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-section-layout">
      <div className="ai-form-card">
        <h3>
          <FileText size={20} style={{ color: '#f59e0b' }} />
          Meeting Summarizer
        </h3>

        <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <label>Meeting Transcript / Notes</label>
          <textarea
            className="ai-meeting-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript, raw notes, or key discussion points here. The AI will structure and summarize them into actionable items..."
            rows={8}
          />
        </div>

        <div className="ai-form-actions">
          <button
            className="ai-generate-btn ai-btn-amber"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="spinner" />
            ) : (
              <Sparkles size={18} />
            )}
            {loading ? 'Summarizing...' : 'Generate Summary'}
          </button>
        </div>
      </div>

      {loading && <ShimmerLoading />}
      {result && !loading && <ResultCard text={result} title="Meeting Summary" />}
    </div>
  );
}

/* ========== AI Chat ========== */
function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({
        message: text,
        history: messages,
      });
      const aiText = res.data.response || res.data.reply || res.data.message || res.data.result || JSON.stringify(res.data, null, 2);
      setMessages((prev) => [...prev, { role: 'ai', content: aiText }]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI chat failed');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat-container">
      {/* Chat Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-dot" />
        <h4>OrgresAI Assistant</h4>
        <span>• Always online</span>
      </div>

      {/* Messages */}
      <div className="ai-chat-messages">
        {messages.length === 0 && !loading && (
          <div className="ai-chat-welcome">
            <div className="ai-chat-welcome-icon">
              <MessageSquare size={28} />
            </div>
            <h3>How can I help you today?</h3>
            <p>
              Ask me anything about your CRM data, sales strategies, customer
              relationships, or business insights.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
            <div className="ai-chat-bubble-label">
              {msg.role === 'user' ? 'You' : 'OrgresAI'}
            </div>
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="ai-loading-dots">
            <div className="ai-loading-dot" />
            <div className="ai-loading-dot" />
            <div className="ai-loading-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="ai-chat-input-bar">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          className="ai-chat-send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

/* ========== Lead Scoring ========== */
function LeadScoring() {
  const [leads, setLeads] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await leadAPI.getAll();
        setLeads(res.data);
      } catch {
        toast.error('Failed to load leads');
      } finally {
        setFetching(false);
      }
    };
    fetchLeads();
  }, []);

  const handleScore = async () => {
    if (leads.length === 0) {
      toast.error('No leads to score');
      return;
    }

    setLoading(true);
    setResult('');
    try {
      const res = await aiAPI.leadScoring({ leads });
      setResult(res.data.scoring || res.data.result || res.data.message || JSON.stringify(res.data, null, 2));
      toast.success('Lead scoring complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to score leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-section-layout">
      <div className="ai-action-card">
        <div className="ai-action-icon scoring">
          <Target size={24} />
        </div>
        <h3>Intelligent Lead Scoring</h3>
        <p>
          Let AI evaluate and rank your leads based on engagement, fit,
          and conversion potential.
        </p>

        {!fetching && (
          <div className="ai-info-banner" style={{ width: '100%', maxWidth: 500 }}>
            <Target size={18} />
            <p>
              <span className="ai-count">{leads.length}</span>{' '}
              lead{leads.length !== 1 ? 's' : ''} ready for scoring
            </p>
          </div>
        )}

        <button
          className="ai-generate-btn ai-btn-purple"
          onClick={handleScore}
          disabled={loading || fetching}
        >
          {loading ? (
            <Loader2 size={18} className="spinner" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'Scoring...' : 'Score All Leads'}
        </button>
      </div>

      {loading && <ShimmerLoading />}
      {result && !loading && <ResultCard text={result} title="Lead Scoring Analysis" />}
    </div>
  );
}
