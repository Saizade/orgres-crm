import { useState, useEffect, useCallback } from 'react';
import { taskAPI, customerAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  User,
  ListTodo,
} from 'lucide-react';
import './Tasks.css';

const STATUS_CYCLE = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_BADGE_CLASS = {
  pending: 'badge-neutral',
  in_progress: 'badge-warning',
  completed: 'badge-success',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'pending',
  due_date: '',
  customer_id: '',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Fetch tasks and customers
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, customersRes] = await Promise.all([
        taskAPI.getAll(),
        customerAPI.getAll(),
      ]);
      setTasks(tasksRes.data.data || tasksRes.data || []);
      setCustomers(customersRes.data.data || customersRes.data || []);
    } catch (err) {
      toast.error('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter logic
  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeFilter);

  const getCount = (key) =>
    key === 'all' ? tasks.length : tasks.filter((t) => t.status === key).length;

  // Date helpers
  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Customer name lookup
  const getCustomerName = (customerId) => {
    if (!customerId) return null;
    const customer = customers.find(
      (c) => c._id === customerId || c.id === customerId
    );
    return customer?.name || customer?.company || null;
  };

  // Toggle task status cycle
  const handleStatusToggle = async (task) => {
    const nextStatus = STATUS_CYCLE[task.status] || 'pending';
    try {
      await taskAPI.update(task._id || task.id, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === (task._id || task.id)
            ? { ...t, status: nextStatus }
            : t
        )
      );
      toast.success(`Task marked as ${STATUS_LABELS[nextStatus]}`);
    } catch (err) {
      toast.error('Failed to update task status');
      console.error(err);
    }
  };

  // Open modal for add / edit
  const openAddModal = () => {
    setEditingTask(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      customer_id: task.customer_id || task.customer || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setForm({ ...EMPTY_FORM });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        due_date: form.due_date || null,
        customer_id: form.customer_id || null,
      };

      if (editingTask) {
        await taskAPI.update(editingTask._id || editingTask.id, payload);
        toast.success('Task updated');
      } else {
        await taskAPI.create(payload);
        toast.success('Task created');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Delete task
  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await taskAPI.delete(task._id || task.id);
      setTasks((prev) =>
        prev.filter((t) => (t._id || t.id) !== (task._id || task.id))
      );
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
      console.error(err);
    }
  };

  // Checkbox icon based on status
  const CheckboxIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={22} />;
      case 'in_progress':
        return <Clock size={22} />;
      default:
        return <Circle size={22} />;
    }
  };

  // Loading skeleton
  const renderSkeletons = () => (
    <div className="tasks-loading">
      {[...Array(5)].map((_, i) => (
        <div className="task-skeleton" key={i}>
          <div className="task-skeleton-check skeleton" />
          <div className="task-skeleton-content">
            <div className="task-skeleton-title skeleton" />
            <div className="task-skeleton-desc skeleton" />
            <div className="task-skeleton-meta skeleton" />
          </div>
          <div className="task-skeleton-badge skeleton" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div className="tasks-header-left">
          <h1>Tasks</h1>
          <span className="tasks-count">{tasks.length}</span>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="task-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`task-filter-btn${activeFilter === f.key ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
            <span className="filter-count">{getCount(f.key)}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        renderSkeletons()
      ) : filteredTasks.length === 0 ? (
        <div className="tasks-empty">
          <div className="tasks-empty-icon">
            <ListTodo size={32} />
          </div>
          <h3>
            {activeFilter === 'all'
              ? 'No tasks yet'
              : `No ${STATUS_LABELS[activeFilter] || activeFilter} tasks`}
          </h3>
          <p>
            {activeFilter === 'all'
              ? 'Create your first task to get started.'
              : 'Tasks with this status will appear here.'}
          </p>
          {activeFilter === 'all' && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task) => {
            const overdue = isOverdue(task);
            const customerName = getCustomerName(task.customer_id || task.customer);

            return (
              <div
                key={task._id || task.id}
                className={`task-card${overdue ? ' overdue' : ''}${
                  task.status === 'completed' ? ' completed' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  className={`task-checkbox ${task.status}`}
                  onClick={() => handleStatusToggle(task)}
                  title={`Mark as ${STATUS_LABELS[STATUS_CYCLE[task.status]]}`}
                >
                  <CheckboxIcon status={task.status} />
                </button>

                {/* Content */}
                <div className="task-content">
                  <span className="task-title">{task.title}</span>
                  {task.description && (
                    <span className="task-description">{task.description}</span>
                  )}
                  <div className="task-meta">
                    {task.due_date && (
                      <span
                        className={`task-meta-item${overdue ? ' overdue' : ''}`}
                      >
                        {overdue ? (
                          <AlertCircle size={12} />
                        ) : (
                          <Calendar size={12} />
                        )}
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    {customerName && (
                      <span className="task-customer-badge">
                        <User size={10} />
                        {customerName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="task-status-col">
                  <span className={`badge ${STATUS_BADGE_CLASS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>

                {/* Actions */}
                <div className="task-actions">
                  <button
                    className="task-action-btn"
                    onClick={() => openEditModal(task)}
                    title="Edit task"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="task-action-btn delete"
                    onClick={() => handleDelete(task)}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'New Task'}
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
                : editingTask
                ? 'Update Task'
                : 'Create Task'}
            </button>
          </>
        }
      >
        <form className="task-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="input-group">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Follow up with client"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="input-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Optional details about this task…"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Status & Due Date Row */}
          <div className="task-form-row">
            <div className="input-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Customer */}
          <div className="input-group">
            <label htmlFor="task-customer">Customer (optional)</label>
            <select
              id="task-customer"
              value={form.customer_id}
              onChange={(e) =>
                setForm({ ...form, customer_id: e.target.value })
              }
            >
              <option value="">No customer</option>
              {customers.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name || c.company}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
