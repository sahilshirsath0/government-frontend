// components/admin/NagrikSeva.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Eye, 
  Search, 
  Filter,
  Users,
  X,
  Save,
  Upload,
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './NagrikSeva.css';

const NagrikSeva = () => {
  const { t } = useTranslation('admin');
  const [headerImage, setHeaderImage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ADD: Single click prevention and upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchNagrikSevaData();
  }, []);

  // Image compression function
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const fetchNagrikSevaData = async () => {
    try {
      setLoading(true);
      const [headerResponse, applicationsResponse] = await Promise.all([
        adminAPI.getNagrikSevaHeader(),
        adminAPI.getNagrikSevaApplications()
      ]);
      setHeaderImage(headerResponse.data.data);
      setApplications(applicationsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching nagrik seva data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = () => {
    if (isSubmitting) return;
    
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setUploadProgress(0);
    setShowImageModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setSubmitError('');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setSubmitError('');
    setUploadProgress(0);

    if (!selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Compress image (25% progress)
      setUploadProgress(25);
      console.log('Compressing image...');
      const compressedFile = await compressImage(selectedFile);
      
      // Step 2: Convert to base64 (50% progress)
      setUploadProgress(50);
      const base64Data = await convertFileToBase64(compressedFile);
      
      const submitData = {
        imageData: base64Data,
        contentType: 'image/jpeg',
        filename: selectedFile.name,
        size: compressedFile.size
      };

      // Step 3: Upload (75% progress)
      setUploadProgress(75);
      await adminAPI.updateNagrikSevaHeader(submitData);
      setUploadProgress(100);
      
      // Success delay for user feedback
      setTimeout(() => {
        setShowImageModal(false);
        setIsSubmitting(false);
        setUploadProgress(0);
        fetchNagrikSevaData();
        setSelectedFile(null);
        setPreviewUrl('');
      }, 500);

    } catch (error) {
      console.error('Error updating header image:', error);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setSubmitError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setSubmitError('Error updating image');
      }
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    if (isUpdatingStatus === applicationId) return;
    
    try {
      setIsUpdatingStatus(applicationId);
      await adminAPI.updateApplicationStatus(applicationId, { status: newStatus });
      fetchNagrikSevaData();
      setShowApplicationModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (isDeleting === applicationId) return;
    
    if (window.confirm(t('nagrikSeva.applications.confirmDelete'))) {
      try {
        setIsDeleting(applicationId);
        await adminAPI.deleteNagrikSevaApplication(applicationId);
        fetchNagrikSevaData();
      } catch (error) {
        console.error('Error deleting application:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleDeleteHeader = async () => {
    if (isDeleting === 'header') return;
    
    if (window.confirm(t('nagrikSeva.headerImage.confirmDelete'))) {
      try {
        setIsDeleting('header');
        await adminAPI.deleteNagrikSevaHeader();
        fetchNagrikSevaData();
      } catch (error) {
        console.error('Error deleting header:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleCloseImageModal = () => {
    if (isSubmitting) return;
    setShowImageModal(false);
  };

  const removeFile = () => {
    if (isSubmitting) return;
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.firstName + ' ' + app.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.whatsappNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="icon-sm" />;
      case 'rejected':
        return <XCircle className="icon-sm" />;
      default:
        return <Clock className="icon-sm" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return t('nagrikSeva.applications.status.approved');
      case 'rejected':
        return t('nagrikSeva.applications.status.rejected');
      default:
        return t('nagrikSeva.applications.status.pending');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner-outer"></div>
          <div className="loading-spinner-inner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="nagrik-seva-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-title-section">
            <div className="header-icon-wrapper">
              <div className="header-icon-container">
                <Users className="header-icon" />
              </div>
              <div>
                <h1 className="page-title">{t('nagrikSeva.title')}</h1>
                <p className="page-subtitle">{t('nagrikSeva.subtitle')}</p>
              </div>
            </div>
            <div className="stats-container">
              <div className="stat-badge">
                <span className="stat-value">{applications.length}</span> {t('nagrikSeva.applications.title')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Image Section */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-header-content">
            <h3 className="card-title">
              <FileText size={18} />
              {t('nagrikSeva.headerImage.title')}
            </h3>
            <div className="card-actions">
              <button
                onClick={handleImageUpdate}
                className="btn btn-primary"
                disabled={isSubmitting || isDeleting === 'header'}
              >
                <Edit2 size={16} />
                {t('nagrikSeva.headerImage.update')}
              </button>
              {headerImage?.image?.data && (
                <button
                  onClick={handleDeleteHeader}
                  className="btn btn-danger"
                  disabled={isDeleting === 'header'}
                >
                  {isDeleting === 'header' ? (
                    <div className="delete-spinner"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {t('common.delete')}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="image-container">
            {headerImage?.image?.data ? (
              <img
                src={headerImage.image.data}
                alt="Nagrik Seva Header"
                className="header-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="image-placeholder-content">
                  <FileText size={48} className="placeholder-icon" />
                  <p className="placeholder-text">{t('nagrikSeva.headerImage.noImage')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="content-card">
        <div className="filters-container">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('nagrikSeva.applications.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <Filter className="filter-icon" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('nagrikSeva.applications.filter.all')}</option>
              <option value="pending">{t('nagrikSeva.applications.filter.pending')}</option>
              <option value="approved">{t('nagrikSeva.applications.filter.approved')}</option>
              <option value="rejected">{t('nagrikSeva.applications.filter.rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="applications-grid">
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-icon">
                <Users size={48} />
              </div>
              <h3 className="empty-state-title">{t('nagrikSeva.applications.empty.title')}</h3>
              <p className="empty-state-description">{t('nagrikSeva.applications.empty.description')}</p>
            </div>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application._id} className="application-card">
              <div className="application-card-body">
                {/* Header */}
                <div className="application-header">
                  <div className="application-user">
                    <div className="user-avatar">
                      <User className="icon-sm" />
                    </div>
                    <div>
                      <h3 className="user-name">{application.firstName} {application.lastName}</h3>
                      <p className="user-subtitle">{application.certificateHolderName}</p>
                    </div>
                  </div>
                  <div className="application-actions">
                    <button
                      onClick={() => handleViewApplication(application)}
                      className="btn-icon"
                      title={t('nagrikSeva.applications.viewDetails')}
                      disabled={isSubmitting || isDeleting === application._id}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(application._id)}
                      className="btn-icon btn-icon-danger"
                      title={t('common.delete')}
                      disabled={isDeleting === application._id}
                    >
                      {isDeleting === application._id ? (
                        <div className="delete-spinner-small"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="status-container">
                  <span className={`status-badge ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    {getStatusText(application.status)}
                  </span>
                </div>

                {/* Details */}
                <div className="application-details">
                  <div className="detail-item">
                    <Phone className="icon-sm detail-icon" />
                    <span className="detail-text">{application.whatsappNumber}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="icon-sm detail-icon" />
                    <span className="detail-text">{application.email}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar className="icon-sm detail-icon" />
                    <span className="detail-text">DOB: {formatDate(application.dateOfBirth)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="application-footer">
                  <div className="application-meta">
                    <span className="meta-badge">
                      {t('nagrikSeva.form.appliedOn')}: {formatDate(application.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FIXED: Scrollable Image Update Modal */}
      {showImageModal && (
        <div className="modal-overlay">
          <div className="modal-container modal-md">
            {/* Fixed Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  <Upload size={24} />
                  {t('nagrikSeva.headerImage.update')}
                </h2>
                <button
                  onClick={handleCloseImageModal}
                  className="modal-close-btn"
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scrollable">
              <form onSubmit={handleImageSubmit} className="modal-form">
                {submitError && (
                  <div className="error-message">
                    {submitError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {t('nagrikSeva.headerImage.title')} *
                  </label>
                  <div className="file-upload-wrapper">
                    <label className={`file-upload-label ${isSubmitting ? 'disabled' : ''}`}>
                      <div className="file-upload-content">
                        <Upload className="upload-icon" />
                        <p className="upload-text">
                          <span className="upload-text-highlight">{t('common.messages.selectFile')}</span>
                        </p>
                        <p className="upload-hint">PNG, JPG, GIF (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="file-input"
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>

                  {previewUrl && (
                    <div className="preview-container">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="preview-remove-btn"
                        disabled={isSubmitting}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="modal-footer-fixed">
              <button
                type="button"
                onClick={handleCloseImageModal}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                onClick={handleImageSubmit}
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="submit-spinner"></div>
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('nagrikSeva.headerImage.update')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Scrollable Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            {/* Fixed Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  <User size={24} />
                  {t('nagrikSeva.applications.viewDetails')}
                </h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="modal-close-btn"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scrollable">
              <div className="details-grid">
                {/* Personal Information */}
                <div className="details-section">
                  <h3 className="section-title">{t('nagrikSeva.form.personalInfo')}</h3>
                  
                  <div className="info-card info-card-blue">
                    <label className="info-label">{t('nagrikSeva.form.fullName')}</label>
                    <p className="info-value">{selectedApplication.firstName} {selectedApplication.middleName} {selectedApplication.lastName}</p>
                  </div>

                  <div className="info-card info-card-green">
                    <label className="info-label">{t('nagrikSeva.form.whatsappNumber')}</label>
                    <p className="info-value">{selectedApplication.whatsappNumber}</p>
                  </div>

                  <div className="info-card info-card-purple">
                    <label className="info-label">{t('nagrikSeva.form.email')}</label>
                    <p className="info-value">{selectedApplication.email}</p>
                  </div>

                  <div className="info-card info-card-yellow">
                    <label className="info-label">{t('nagrikSeva.form.aadhaarNumber')}</label>
                    <p className="info-value">{selectedApplication.aadhaarNumber}</p>
                  </div>
                </div>

                {/* Certificate & Dates */}
                <div className="details-section">
                  <h3 className="section-title">{t('nagrikSeva.form.certificateInfo')}</h3>
                  
                  <div className="info-card info-card-indigo">
                    <label className="info-label">{t('nagrikSeva.form.certificateHolderName')}</label>
                    <p className="info-value">{selectedApplication.certificateHolderName}</p>
                  </div>

                  <div className="info-card info-card-teal">
                    <label className="info-label">{t('nagrikSeva.form.dateOfBirth')}</label>
                    <p className="info-value">{formatDate(selectedApplication.dateOfBirth)}</p>
                  </div>

                  {selectedApplication.dateOfRegistration && (
                    <div className="info-card info-card-rose">
                      <label className="info-label">{t('nagrikSeva.form.dateOfRegistration')}</label>
                      <p className="info-value">{formatDate(selectedApplication.dateOfRegistration)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedApplication.paymentScreenshot?.data && (
                <div className="payment-section">
                  <h3 className="section-title">{t('nagrikSeva.form.paymentScreenshot')}</h3>
                  <div className="payment-image-container">
                    <img
                      src={selectedApplication.paymentScreenshot.data}
                      alt="Payment Screenshot"
                      className="payment-image"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer - Action Buttons */}
            <div className="modal-footer-fixed">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="btn btn-secondary"
              >
                {t('common.close')}
              </button>
              <div className="status-actions">
                <button
                  onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                  className="btn btn-danger"
                  disabled={isUpdatingStatus === selectedApplication._id}
                >
                  {isUpdatingStatus === selectedApplication._id ? (
                    <div className="submit-spinner"></div>
                  ) : (
                    <XCircle size={16} />
                  )}
                  {t('nagrikSeva.applications.actions.reject')}
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                  className="btn btn-success"
                  disabled={isUpdatingStatus === selectedApplication._id}
                >
                  {isUpdatingStatus === selectedApplication._id ? (
                    <div className="submit-spinner"></div>
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {t('nagrikSeva.applications.actions.approve')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NagrikSeva;
