import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Users, Filter } from 'lucide-react';
import { customerAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Customers.css';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'active',
  notes: '',
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
];

const STATUS_BADGE = {
  active: 'badge-success',
  inactive: 'badge-danger',
  prospect: 'badge-info',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const SkeletonRows = () =>
  Array.from({ length: 6 }).map((_, i) => (
    <div className="skeleton-table-row" key={i}>
      <div className="skeleton-avatar-row">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-text-group">
          <div className="skeleton skeleton-text lg" />
          <div className="skeleton skeleton-text sm" />
        </div>
      </div>
      <div className="skeleton skeleton-cell medium" />
      <div className="skeleton skeleton-cell medium" />
      <div className="skeleton skeleton-cell narrow" />
      <div className="skeleton skeleton-cell medium" />
      <div className="skeleton skeleton-cell narrow" />
    </div>
  ));

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // ---------- Fetch ----------
  const fetchCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(data.data || data || []);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------- Filter / Search ----------
  const filteredCustomers = useMemo(() => {
    let list = customers;

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q))
      );
    }

    return list;
  }, [customers, searchQuery, statusFilter]);

  // ---------- Modal Handlers ----------
  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      status: customer.status || 'active',
      notes: customer.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setFormData(INITIAL_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(formData);
        toast.success('Customer created successfully');
      }
      closeModal();
      await fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete "${customer.name}"? This cannot be undone.`)) return;

    try {
      await customerAPI.delete(customer._id);
      toast.success('Customer deleted');
      await fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  // ---------- Render ----------
  return (
    <div className="customers-page">
      {/* Header */}
      <div className="customers-header">
        <div className="customers-header-left">
          <h1>Customers</h1>
          {!loading && (
            <span className="customers-count">
              <Users size={13} />
              {customers.length}
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Toolbar */}
      <div className="customers-toolbar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search customers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} />
        </div>

        <div className="toolbar-divider" />

        <div className="filter-group">
          <Filter size={15} className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="customers-table-card">
        {loading ? (
          <SkeletonRows />
        ) : filteredCustomers.length === 0 ? (
          <div className="customers-empty">
            <div className="customers-empty-icon">
              <Users size={28} />
            </div>
            <h3>No customers found</h3>
            <p>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Get started by adding your first customer.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, idx) => (
                  <tr
                    key={customer._id || idx}
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {getInitials(customer.name)}
                        </div>
                        <div className="customer-info">
                          <span className="customer-name">{customer.name}</span>
                          <span className="customer-email">{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{customer.company || '—'}</td>
                    <td>{customer.phone || '—'}</td>
                    <td>
                      <span
                        className={`badge ${STATUS_BADGE[customer.status] || 'badge-neutral'}`}
                      >
                        {customer.status || 'unknown'}
                      </span>
                    </td>
                    <td>{customer.assignedTo?.name || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() => openEditModal(customer)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn-icon action-danger"
                          title="Delete"
                          onClick={() => handleDelete(customer)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : editingCustomer
                  ? 'Update Customer'
                  : 'Create Customer'}
            </button>
          </>
        }
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-row">
            <div className="input-group">
              <label htmlFor="cust-name">Name</label>
              <input
                id="cust-name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="cust-email">Email</label>
              <input
                id="cust-email"
                type="email"
                name="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="input-group">
              <label htmlFor="cust-phone">Phone</label>
              <input
                id="cust-phone"
                type="text"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="cust-company">Company</label>
              <input
                id="cust-company"
                type="text"
                name="company"
                placeholder="Acme Inc."
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="cust-status">Status</label>
            <select
              id="cust-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="cust-notes">Notes</label>
            <textarea
              id="cust-notes"
              name="notes"
              placeholder="Additional notes about this customer…"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
