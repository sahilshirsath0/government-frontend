import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  Search, 
  Filter,
  MessageSquare,
  X,
  Save,
  Mail,
  Phone,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Feedback.css';


const Feedback = () => {
  const { t } = useTranslation('admin');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    adminNotes: ''
  });


  useEffect(() => {
    fetchFeedback();
  }, []);


  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFeedback();
      setFeedback(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleView = (item) => {
    setSelectedFeedback(item);
    setStatusUpdate({
      status: item.status,
      adminNotes: item.adminNotes || ''
    });
    setShowModal(true);
  };


  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateFeedbackStatus(selectedFeedback._id, statusUpdate);
      setShowModal(false);
      fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm(t('feedback.confirmDelete'))) {
      try {
        await adminAPI.deleteFeedback(id);
        fetchFeedback();
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };


  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
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


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'reviewed':
        return 'status-reviewed';
      case 'resolved':
        return 'status-resolved';
      default:
        return 'status-default';
    }
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }


  return (
    <div className="feedback-container">
      {/* Header */}
      <div className="feedback-header">
        <div>
          <h1 className="page-title">
            {t('feedback.title')}
          </h1>
          <p className="page-subtitle">
            {t('feedback.subtitle')}
          </p>
        </div>
      </div>


      {/* Filters */}
      <div className="filters-card">
        <div className="filters-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('feedback.search')}
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
              <option value="all">{t('feedback.filter.all')}</option>
              <option value="pending">{t('feedback.filter.pending')}</option>
              <option value="reviewed">{t('feedback.filter.reviewed')}</option>
              <option value="resolved">{t('feedback.filter.resolved')}</option>
            </select>
          </div>
        </div>
      </div>


      {/* Feedback List */}
      <div className="feedback-list">
        {filteredFeedback.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <MessageSquare size={48} />
            </div>
            <h3 className="empty-title">
              {t('feedback.empty.title')}
            </h3>
            <p className="empty-description">
              {t('feedback.empty.description')}
            </p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div key={item._id} className="feedback-card">
              <div className="feedback-card-body">
                {/* Header */}
                <div className="feedback-card-header">
                  <div className="feedback-header-content">
                    <div className="feedback-title-row">
                      <h3 className="feedback-subject">{item.subject}</h3>
                      <span className={`status-badge ${getStatusColor(item.status)}`}>
                        {t(`feedback.status.${item.status}`)}
                      </span>
                    </div>
                    <div className="feedback-meta">
                      <div className="meta-item">
                        <User size={14} />
                        <span>{item.name}</span>
                      </div>
                      <div className="meta-item">
                        <Mail size={14} />
                        <span>{item.email}</span>
                      </div>
                      {item.phone && (
                        <div className="meta-item">
                          <Phone size={14} />
                          <span>{item.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="feedback-actions">
                    <button
                      onClick={() => handleView(item)}
                      className="action-btn action-btn-view"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="action-btn action-btn-delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>


                {/* Message Preview */}
                <div className="feedback-message-preview">
                  <p className="message-text">{item.message}</p>
                </div>


                {/* Footer */}
                <div className="feedback-card-footer">
                  <div className="footer-date">
                    <Calendar size={14} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.reviewedBy && (
                    <span className="footer-reviewer">Reviewed by: {item.reviewedBy.username}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>


      {/* View Modal */}
      {showModal && selectedFeedback && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">
                {t('feedback.modal.view')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>


            <div className="modal-body modal-scrollable">
              {/* User Information */}
              <div className="modal-section">
                <h3 className="section-title">
                  {t('feedback.details.userInfo')}
                </h3>
                <div className="info-grid">
                  <div className="info-field">
                    <label className="info-label">
                      {t('feedback.form.name')}
                    </label>
                    <p className="info-value">{selectedFeedback.name}</p>
                  </div>
                  <div className="info-field">
                    <label className="info-label">
                      {t('feedback.form.email')}
                    </label>
                    <p className="info-value">{selectedFeedback.email}</p>
                  </div>
                  {selectedFeedback.phone && (
                    <div className="info-field">
                      <label className="info-label">
                        {t('feedback.form.phone')}
                      </label>
                      <p className="info-value">{selectedFeedback.phone}</p>
                    </div>
                  )}
                  <div className="info-field">
                    <label className="info-label">
                      {t('feedback.form.submitted')}
                    </label>
                    <p className="info-value">{formatDate(selectedFeedback.createdAt)}</p>
                  </div>
                </div>
              </div>


              {/* Feedback Details */}
              <div className="modal-section">
                <h3 className="section-title">
                  {t('feedback.details.feedbackDetails')}
                </h3>
                <div className="details-content">
                  <div className="detail-field">
                    <label className="detail-label">
                      {t('feedback.form.subject')}
                    </label>
                    <p className="detail-value">
                      {selectedFeedback.subject}
                    </p>
                  </div>
                  <div className="detail-field">
                    <label className="detail-label">
                      {t('feedback.form.message')}
                    </label>
                    <div className="message-box">
                      <p className="message-content">
                        {selectedFeedback.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Admin Section */}
              <div className="modal-section">
                <h3 className="section-title">
                  {t('feedback.details.adminSection')}
                </h3>
                <form onSubmit={handleStatusUpdate} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">
                      {t('feedback.form.status')}
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                      className="form-select"
                    >
                      <option value="pending">{t('feedback.status.pending')}</option>
                      <option value="reviewed">{t('feedback.status.reviewed')}</option>
                      <option value="resolved">{t('feedback.status.resolved')}</option>
                    </select>
                  </div>


                  <div className="form-group">
                    <label className="form-label">
                      {t('feedback.form.adminNotes')}
                    </label>
                    <textarea
                      value={statusUpdate.adminNotes}
                      onChange={(e) => setStatusUpdate({...statusUpdate, adminNotes: e.target.value})}
                      placeholder={t('feedback.form.adminNotesPlaceholder')}
                      rows={4}
                      className="form-textarea"
                    />
                  </div>


                  {selectedFeedback.reviewedBy && (
                    <div className="reviewer-grid">
                      <div className="reviewer-field">
                        <label className="reviewer-label">
                          {t('feedback.form.reviewedBy')}
                        </label>
                        <p className="reviewer-value">{selectedFeedback.reviewedBy.username}</p>
                      </div>
                      <div className="reviewer-field">
                        <label className="reviewer-label">
                          {t('feedback.form.reviewedAt')}
                        </label>
                        <p className="reviewer-value">{formatDate(selectedFeedback.reviewedAt)}</p>
                      </div>
                    </div>
                  )}


                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-cancel"
                    >
                      {t('feedback.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                    >
                      <Save size={16} />
                      {t('feedback.form.updateStatus')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Feedback;
