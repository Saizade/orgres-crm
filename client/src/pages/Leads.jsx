import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { leadAPI, customerAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  Plus,
  GripVertical,
  Calendar,
  DollarSign,
  Target,
  ArrowDownCircle,
} from 'lucide-react';
import './Leads.css';

/* ── Column definitions ─────────────────────────── */
const COLUMNS = [
  { id: 'new', label: 'New', color: '#3b82f6' },
  { id: 'interested', label: 'Interested', color: '#8b5cf6' },
  { id: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
  { id: 'closed', label: 'Closed', color: '#10b981' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
];

const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

const priorityBadge = (p) => {
  const map = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-success' };
  return map[p] || 'badge-neutral';
};

const fmtCurrency = (v) => {
  const num = Number(v);
  if (!num) return null;
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

const fmtDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const blankForm = {
  title: '',
  customer: '',
  status: 'new',
  priority: 'medium',
  value: '',
  followUpDate: '',
  notes: '',
};

/* ── Component ──────────────────────────────────── */
const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);

  /* ── Fetch data ────────────────────────────────── */
  const fetchLeads = useCallback(async () => {
    try {
      const { data } = await leadAPI.getAll();
      setLeads(Array.isArray(data) ? data : data.leads ?? data.data ?? []);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(Array.isArray(data) ? data : data.customers ?? data.data ?? []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchCustomers();
  }, [fetchLeads, fetchCustomers]);

  /* ── Derived: bucket leads into columns ────────── */
  const buckets = {};
  COLUMNS.forEach((c) => {
    buckets[c.id] = leads.filter(
      (l) => (l.status || 'new').toLowerCase() === c.id
    );
  });

  const totalValue = leads.reduce((s, l) => s + (Number(l.value) || 0), 0);

  /* ── Drag & Drop ───────────────────────────────── */
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;
    const targetColumn = COLUMNS.find((c) => c.id === newStatus);

    const prevLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) =>
        String(l._id ?? l.id) === draggableId ? { ...l, status: newStatus } : l
      )
    );

    toast.success(`Moved to ${targetColumn?.label ?? newStatus}`);

    try {
      await leadAPI.update(draggableId, { status: newStatus });
    } catch {
      setLeads(prevLeads);
      toast.error('Failed to update lead status');
    }
  };

  /* ── Add Lead ──────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        status: formData.status,
        priority: formData.priority,
        value: formData.value ? Number(formData.value) : undefined,
        followUpDate: formData.followUpDate || undefined,
        notes: formData.notes || undefined,
      };
      if (formData.customer) payload.customer = formData.customer;

      await leadAPI.create(payload);
      toast.success('Lead created!');
      setModalOpen(false);
      setFormData(blankForm);
      fetchLeads();
    } catch {
      toast.error('Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Add Lead Modal (shared) ──────────────────── */
  const addLeadModal = (
    <Modal
      isOpen={modalOpen}
      onClose={() => { setModalOpen(false); setFormData(blankForm); }}
      title="Add New Lead"
    >
      <form className="add-lead-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="lead-title">Title *</label>
          <input
            id="lead-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Enterprise deal — Acme Corp"
          />
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="lead-customer">Customer</label>
            <select id="lead-customer" name="customer" value={formData.customer} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id ?? c.id} value={c._id ?? c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="lead-status">Status</label>
            <select id="lead-status" name="status" value={formData.status} onChange={handleChange}>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="lead-priority">Priority</label>
            <select id="lead-priority" name="priority" value={formData.priority} onChange={handleChange}>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="lead-value">Value (₹)</label>
            <input
              id="lead-value"
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="lead-followup">Follow-up Date</label>
          <input
            id="lead-followup"
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label htmlFor="lead-notes">Notes</label>
          <textarea
            id="lead-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional details…"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setModalOpen(false); setFormData(blankForm); }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );

  /* ── Loading skeleton ──────────────────────────── */
  if (loading) {
    return (
      <div className="leads-page">
        <div className="leads-header">
          <div className="leads-header-left">
            <div className="leads-header-icon"><Target size={20} /></div>
            <h1>Lead <span>Pipeline</span></h1>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Lead
          </button>
        </div>
        <div className="leads-loading">
          {COLUMNS.map((c) => (
            <div key={c.id} className="leads-loading-column">
              <div className="leads-loading-header skeleton" />
              {[1, 2].map((i) => (
                <div key={i} className="leads-loading-card skeleton" />
              ))}
            </div>
          ))}
        </div>
        {addLeadModal}
      </div>
    );
  }

  /* ── Render ────────────────────────────────────── */
  return (
    <div className="leads-page">
      {/* Header — title + add button */}
      <div className="leads-header">
        <div className="leads-header-left">
          <div className="leads-header-icon">
            <Target size={20} />
          </div>
          <h1>Lead <span>Pipeline</span></h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* Stats Chips */}
      <div className="leads-stats">
        <div className="leads-stat-chip">
          Total Leads <span className="stat-value">{leads.length}</span>
        </div>
        <div className="leads-stat-chip">
          Pipeline Value <span className="stat-value">{fmtCurrency(totalValue) || '₹0'}</span>
        </div>
        {COLUMNS.slice(0, 3).map((c) => (
          <div className="leads-stat-chip" key={c.id}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
            {c.label} <span className="stat-value">{buckets[c.id].length}</span>
          </div>
        ))}
      </div>

      {/* Pipeline progress bar */}
      {leads.length > 0 && (
        <div className="pipeline-total-bar">
          {COLUMNS.map((c) => {
            const pct = (buckets[c.id].length / leads.length) * 100;
            return (
              <div
                key={c.id}
                className="bar-segment"
                style={{ width: `${pct}%`, background: c.color }}
                title={`${c.label}: ${buckets[c.id].length}`}
              />
            );
          })}
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <div className="kanban-column" key={col.id} data-status={col.id}>
              <div className="kanban-column-header">
                <div className="column-info">
                  <span className="column-dot" />
                  <span className="column-name">{col.label}</span>
                </div>
                <span className="column-count">{buckets[col.id].length}</span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    className={`kanban-cards${snapshot.isDraggingOver ? ' is-dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {buckets[col.id].length === 0 && (
                      <div className="kanban-empty">
                        <ArrowDownCircle size={22} />
                        <span>Drop leads here</span>
                      </div>
                    )}

                    {buckets[col.id].map((lead, idx) => {
                      const leadId = String(lead._id ?? lead.id);
                      return (
                        <Draggable key={leadId} draggableId={leadId} index={idx}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              className={`lead-card${dragSnapshot.isDragging ? ' dragging' : ''}`}
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <div className="lead-card-top">
                                <span className="lead-card-title">{lead.title}</span>
                                <span className="lead-card-grip">
                                  <GripVertical size={14} />
                                </span>
                              </div>

                              {(lead.customer?.name || lead.customerName) && (
                                <div className="lead-card-customer">
                                  {lead.customer?.name || lead.customerName}
                                </div>
                              )}

                              <div className="lead-card-meta">
                                {lead.value ? (
                                  <span className="lead-card-value">
                                    <DollarSign size={12} />
                                    {fmtCurrency(lead.value)}
                                  </span>
                                ) : (
                                  <span />
                                )}

                                {(lead.followUpDate || lead.followUp) && (
                                  <span className="lead-card-followup">
                                    <Calendar size={11} />
                                    {fmtDate(lead.followUpDate || lead.followUp)}
                                  </span>
                                )}

                                {lead.priority && (
                                  <span className="lead-card-priority">
                                    <span className={`badge ${priorityBadge(lead.priority)}`}>
                                      {lead.priority}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {addLeadModal}
    </div>
  );
};

export default Leads;
