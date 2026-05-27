import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Target,
  DollarSign,
  Trophy,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { customerAPI, leadAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

/* ────────── Constants ────────── */
const PIE_COLORS = {
  new: '#3b82f6',
  interested: '#8b5cf6',
  negotiation: '#f59e0b',
  closed: '#22c55e',
  rejected: '#ef4444',
};

const STATUS_LABELS = {
  new: 'New',
  interested: 'Interested',
  negotiation: 'Negotiation',
  closed: 'Closed',
  rejected: 'Rejected',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ────────── Helpers ────────── */
function formatCurrency(value) {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value}`;
}

function formatNumber(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLeadStatusBadgeClass(status) {
  const map = {
    new: 'badge-info',
    interested: 'badge-primary',
    negotiation: 'badge-warning',
    closed: 'badge-success',
    rejected: 'badge-danger',
  };
  return map[status] || 'badge-neutral';
}

function getCustomerStatusBadgeClass(status) {
  const map = {
    active: 'badge-success',
    inactive: 'badge-neutral',
    prospect: 'badge-info',
  };
  return map[status] || 'badge-neutral';
}

/* ────────── Build real monthly revenue from leads ────────── */
function buildMonthlyRevenue(leads) {
  const now = new Date();
  const data = [];

  // Build last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    // Sum lead values created/closed in this month
    const revenue = leads
      .filter((l) => {
        const created = new Date(l.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      })
      .reduce((sum, l) => sum + (Number(l.value) || 0), 0);

    data.push({
      name: MONTH_NAMES[month],
      revenue,
    });
  }

  return data;
}

/* ────────── Custom Tooltip ────────── */
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      <div className="chart-tooltip-value">
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{payload[0].name}</div>
      <div className="chart-tooltip-value">{payload[0].value} leads</div>
    </div>
  );
}

/* ────────── Skeleton Loader ────────── */
function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="skeleton" style={{ width: 280, height: 28, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 180, height: 16 }} />
      </div>

      <div className="skeleton-stats-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton skeleton-stat-card" />
        ))}
      </div>

      <div className="skeleton-charts-grid">
        <div className="skeleton skeleton-chart" />
        <div className="skeleton skeleton-chart" />
      </div>

      <div className="skeleton skeleton-activity" />
    </div>
  );
}

/* ────────── Main Component ────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [custRes, leadRes, taskRes] = await Promise.all([
          customerAPI.getAll(),
          leadAPI.getAll(),
          taskAPI.getAll(),
        ]);
        setCustomers(custRes.data?.data || custRes.data || []);
        setLeads(leadRes.data?.data || leadRes.data || []);
        setTasks(taskRes.data?.data || taskRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeLeads = leads.filter(
      (l) => l.status && l.status !== 'closed' && l.status !== 'rejected'
    ).length;
    const totalRevenue = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const closedDeals = leads.filter((l) => l.status === 'closed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

    return { totalCustomers, activeLeads, totalRevenue, closedDeals, pendingTasks };
  }, [customers, leads, tasks]);

  /* ── Real monthly revenue from leads ── */
  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(leads), [leads]);

  /* ── Check if chart has any data ── */
  const hasRevenueData = monthlyRevenue.some((m) => m.revenue > 0);

  /* ── Pie data ── */
  const pieData = useMemo(() => {
    const counts = {};
    leads.forEach((l) => {
      const status = l.status || 'new';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: PIE_COLORS[key] || '#64748b',
    }));
  }, [leads]);

  /* ── Recent activity (merge customers + leads, sort by date) ── */
  const recentActivity = useMemo(() => {
    const items = [];

    customers.forEach((c) => {
      items.push({
        id: `c-${c._id || c.id}`,
        type: 'customer',
        name: c.name || c.company || 'Unknown',
        detail: c.email || c.company || '',
        status: c.status || 'active',
        date: c.updatedAt || c.createdAt,
      });
    });

    leads.forEach((l) => {
      items.push({
        id: `l-${l._id || l.id}`,
        type: 'lead',
        name: l.title || l.company || 'Untitled Lead',
        detail: l.company || l.contact || '',
        status: l.status || 'new',
        date: l.updatedAt || l.createdAt,
      });
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items.slice(0, 8);
  }, [customers, leads]);

  if (loading) return <DashboardSkeleton />;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-greeting">
          <h1>
            Welcome back, {firstName}
          </h1>
          <span className="wave" role="img" aria-label="wave">👋</span>
        </div>
        <p>Here's what's happening with your CRM today.</p>
      </div>

      {/* ── Stats Cards — All real data, no fake trends ── */}
      <div className="stats-grid">
        <StatCard
          icon={<Users />}
          value={formatNumber(stats.totalCustomers)}
          label="Total Customers"
          variant="blue-cyan"
        />
        <StatCard
          icon={<Target />}
          value={formatNumber(stats.activeLeads)}
          label="Active Leads"
          variant="purple-pink"
        />
        <StatCard
          icon={<DollarSign />}
          value={formatCurrency(stats.totalRevenue)}
          label="Total Revenue"
          variant="green-emerald"
        />
        <StatCard
          icon={<Trophy />}
          value={formatNumber(stats.closedDeals)}
          label="Closed Deals"
          variant="orange-yellow"
        />
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">
        {/* Monthly Revenue Chart — Real data from leads */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>
              <BarChart3 />
              Monthly Revenue
            </h3>
            <span className="chart-period">Last 12 months</span>
          </div>
          <div className="chart-wrapper">
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 11 }}
                    tickFormatter={(v) => formatCurrency(v)}
                    dx={-5}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.06)' }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: '#22c55e',
                      stroke: '#ffffff',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <BarChart3 />
                <p>No revenue data yet</p>
                <p>Add leads with values to see revenue trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>
              <PieIcon />
              Lead Status
            </h3>
            <span className="chart-period">{leads.length} total</span>
          </div>
          <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    {/* Center text */}
                    <text x="50%" y="47%" textAnchor="middle" className="pie-center-label">
                      {leads.length}
                    </text>
                    <text x="50%" y="57%" textAnchor="middle" className="pie-center-sublabel">
                      LEADS
                    </text>
                  </PieChart>
                </ResponsiveContainer>

                <div className="pie-legend">
                  {pieData.map((entry, i) => (
                    <div key={i} className="pie-legend-item">
                      <span className="pie-legend-dot" style={{ background: entry.color }} />
                      <span>{entry.name}</span>
                      <span className="pie-legend-count">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <PieIcon />
                <p>No leads to display</p>
                <p>Create leads to see status distribution</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="activity-section">
        <div className="activity-card">
          <div className="activity-card-header">
            <h3>
              <Activity />
              Recent Activity
            </h3>
            <span className="activity-count">
              {recentActivity.length} items
            </span>
          </div>

          {recentActivity.length > 0 ? (
            <ul className="activity-list">
              {recentActivity.map((item) => (
                <li key={item.id} className="activity-item">
                  <div className={`activity-avatar ${item.type}`}>
                    {getInitials(item.name)}
                  </div>
                  <div className="activity-info">
                    <div className="activity-name">
                      {item.name}
                      <span className={`activity-type-tag ${item.type}`}>
                        {item.type}
                      </span>
                    </div>
                    {item.detail && (
                      <div className="activity-detail">{item.detail}</div>
                    )}
                  </div>
                  <div className="activity-meta">
                    <span
                      className={`badge ${
                        item.type === 'lead'
                          ? getLeadStatusBadgeClass(item.status)
                          : getCustomerStatusBadgeClass(item.status)
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="activity-date">{timeAgo(item.date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <Activity />
              <p>No recent activity yet.</p>
              <p>Start by adding customers or leads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────── Stat Card Sub-component (no fake trends) ────────── */
function StatCard({ icon, value, label, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-glow" />
      <div className="stat-card-top">
        <div className={`stat-icon ${variant}`}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
