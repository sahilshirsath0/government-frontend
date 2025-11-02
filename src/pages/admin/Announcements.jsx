import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  MessageSquare,
  X,
  Save
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Announcements.css';

const Announcements = () => {
  const { t } = useTranslation('admin');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    message: ''
  });
  const [submitError, setSubmitError] = useState('');
  
  // ADD: Single click prevention states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // Track which item is being deleted

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnnouncements();
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // Prevent opening modal if already submitting
    if (isSubmitting) return;
    
    setModalType('create');
    setSelectedAnnouncement(null);
    setFormData({ message: '' });
    setSubmitError('');
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    // Prevent opening modal if already submitting
    if (isSubmitting) return;
    
    setModalType('edit');
    setSelectedAnnouncement(announcement);
    setFormData({
      message: announcement.message
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (announcement) => {
    setModalType('view');
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Prevent multiple delete clicks
    if (isDeleting === id) return;
    
    if (window.confirm(t('announcements.confirmDelete'))) {
      try {
        setIsDeleting(id); // Set deleting state
        await adminAPI.deleteAnnouncement(id);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      } finally {
        setIsDeleting(null); // Clear deleting state
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setSubmitError('');

    if (!formData.message.trim()) {
      setSubmitError('Message is required');
      return;
    }

    try {
      setIsSubmitting(true); // Set submitting state

      const submitData = {
        message: formData.message.trim()
      };

      if (modalType === 'create') {
        await adminAPI.createAnnouncement(submitData);
      } else {
        await adminAPI.updateAnnouncement(selectedAnnouncement._id, {
          message: formData.message.trim(),
          isActive: true
        });
      }

      setShowModal(false);
      fetchAnnouncements();
      setFormData({ message: '' });
    } catch (error) {
      console.error('Error submitting announcement:', error);
      setSubmitError(error.response?.data?.message || 'Error submitting announcement');
    } finally {
      setIsSubmitting(false); // Clear submitting state
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    // Prevent closing modal while submitting
    if (isSubmitting) return;
    setShowModal(false);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && announcement.isActive) ||
      (filterStatus === 'inactive' && !announcement.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateMessage = (message, maxLength = 120) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="announcements-container">
      {/* Header */}
      <div className="announcements-header">
        <div>
          <h1 className="page-title">
            {t('announcements.title')}
          </h1>
          <p className="page-subtitle">
            {t('announcements.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-create"
          disabled={isSubmitting}
        >
          <Plus size={20} />
          {t('announcements.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('announcements.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-wrapper">
            <Filter className="filter-icon" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('announcements.filter.all')}</option>
              <option value="active">{t('announcements.filter.active')}</option>
              <option value="inactive">{t('announcements.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="announcements-grid">
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <MessageSquare size={48} />
            </div>
            <h3 className="empty-title">
              {t('announcements.empty.title')}
            </h3>
            <p className="empty-description">
              {t('announcements.empty.description')}
            </p>
            <button
              onClick={handleCreate}
              className="btn-create-empty"
              disabled={isSubmitting}
            >
              <Plus size={20} />
              {t('announcements.create')}
            </button>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div key={announcement._id} className="announcement-card">
              <div className="announcement-card-body">
                {/* Header */}
                <div className="announcement-card-header">
                  <span className={`status-badge ${announcement.isActive ? 'status-active' : 'status-inactive'}`}>
                    {announcement.isActive ? t('announcements.status.active') : t('announcements.status.inactive')}
                  </span>
                  <div className="announcement-actions">
                    <button
                      onClick={() => handleView(announcement)}
                      className="action-btn action-btn-view"
                      disabled={isSubmitting}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="action-btn action-btn-edit"
                      disabled={isSubmitting}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="action-btn action-btn-delete"
                      disabled={isDeleting === announcement._id}
                    >
                      {isDeleting === announcement._id ? (
                        <div className="delete-spinner"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div className="announcement-message">
                  <p className="message-text">
                    {truncateMessage(announcement.message)}
                  </p>
                </div>

                {/* Footer */}
                <div className="announcement-footer">
                  <span>{t('announcements.createdBy')}: {announcement.createdBy?.username}</span>
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FIXED: Scrollable Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Fixed Header */}
            <div className="modal-header">
              <h2 className="modal-title">
                {modalType === 'create' && t('announcements.modal.create')}
                {modalType === 'edit' && t('announcements.modal.edit')}
                {modalType === 'view' && t('announcements.modal.view')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="modal-close-btn"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scrollable">
              {modalType === 'view' ? (
                <div className="view-content">
                  <div className="view-field">
                    <label className="view-label">
                      {t('announcements.form.message')}
                    </label>
                    <div className="view-value-box">
                      <p className="view-value-text">
                        {selectedAnnouncement?.message}
                      </p>
                    </div>
                  </div>

                  <div className="view-grid">
                    <div className="view-field">
                      <label className="view-label">
                        {t('announcements.form.status')}
                      </label>
                      <span className={`status-badge-large ${selectedAnnouncement?.isActive ? 'status-active' : 'status-inactive'}`}>
                        {selectedAnnouncement?.isActive ? t('announcements.status.active') : t('announcements.status.inactive')}
                      </span>
                    </div>
                    <div className="view-field">
                      <label className="view-label">
                        {t('announcements.form.created')}
                      </label>
                      <p className="view-value">
                        {formatDate(selectedAnnouncement?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="view-field">
                    <label className="view-label">
                      {t('announcements.form.createdBy')}
                    </label>
                    <p className="view-value">
                      {selectedAnnouncement?.createdBy?.username}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="modal-form">
                  {/* Error Message */}
                  {submitError && (
                    <div className="error-message">
                      {submitError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      {t('announcements.form.message')} *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder={t('announcements.form.messagePlaceholder')}
                      rows={8}
                      className="form-textarea"
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Fixed Footer - Only for non-view modals */}
            {modalType !== 'view' && (
              <div className="modal-footer-fixed">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  {t('announcements.form.cancel')}
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="submit-spinner"></div>
                      {modalType === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {modalType === 'create' ? t('announcements.form.create') : t('announcements.form.update')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
