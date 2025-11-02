import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Award as AwardIcon,
  X,
  Save,
  Upload,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Awards.css';

const Awards = () => {
  const { t } = useTranslation('admin');
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAward, setSelectedAward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    awardDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');
  
  // ADD: Single click prevention and upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAwards();
      setAwards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreate = () => {
    if (isSubmitting) return;
    
    setModalType('create');
    setSelectedAward(null);
    setFormData({ name: '', description: '', awardDate: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (award) => {
    if (isSubmitting) return;
    
    setModalType('edit');
    setSelectedAward(award);
    setFormData({
      name: award.name,
      description: award.description || '',
      awardDate: award.awardDate ? new Date(award.awardDate).toISOString().split('T')[0] : ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (award) => {
    setModalType('view');
    setSelectedAward(award);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (isDeleting === id) return;
    
    if (window.confirm(t('awards.confirmDelete'))) {
      try {
        setIsDeleting(id);
        await adminAPI.deleteAward(id);
        fetchAwards();
      } catch (error) {
        console.error('Error deleting award:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setSubmitError('');
    setUploadProgress(0);

    // Validation for create mode
    if (modalType === 'create' && !selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    if (!formData.name.trim()) {
      setSubmitError('Please enter a name for the award');
      return;
    }

    try {
      setIsSubmitting(true);

      if (modalType === 'create') {
        // Step 1: Compress image (25% progress)
        setUploadProgress(25);
        const compressedFile = await compressImage(selectedFile);
        
        // Step 2: Convert to base64 (50% progress)
        setUploadProgress(50);
        const base64Data = await convertFileToBase64(compressedFile);
        
        const submitData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          awardDate: formData.awardDate || '',
          imageData: base64Data,
          contentType: 'image/jpeg',
          filename: selectedFile.name,
          size: compressedFile.size
        };

        // Step 3: Upload (75% progress)
        setUploadProgress(75);
        await adminAPI.createAward(submitData);
        setUploadProgress(100);
      } else {
        await adminAPI.updateAward(selectedAward._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          awardDate: formData.awardDate,
          isActive: true
        });
      }

      // Success delay for user feedback
      setTimeout(() => {
        setShowModal(false);
        setIsSubmitting(false);
        setUploadProgress(0);
        fetchAwards();
        setFormData({ name: '', description: '', awardDate: '' });
        setSelectedFile(null);
        setPreviewUrl('');
      }, 500);
      
    } catch (error) {
      console.error('Error submitting award:', error);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setSubmitError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setSubmitError(error.response?.data?.message || 'Error submitting award');
      }
    }
  };

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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

  const removeFile = () => {
    if (isSubmitting) return;
    
    setSelectedFile(null);
    setPreviewUrl('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  const filteredAwards = awards.filter(award => {
    const matchesSearch = award.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (award.description && award.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && award.isActive) ||
      (filterStatus === 'inactive' && !award.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (award) => {
    if (award.image && award.image.data) {
      return award.image.data;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="awards-container">
      {/* Header */}
      <div className="awards-header">
        <div>
          <h1 className="page-title">
            {t('awards.title')}
          </h1>
          <p className="page-subtitle">
            {t('awards.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-create"
          disabled={isSubmitting}
        >
          <Plus size={20} />
          {t('awards.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('awards.search')}
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
              <option value="all">{t('awards.filter.all')}</option>
              <option value="active">{t('awards.filter.active')}</option>
              <option value="inactive">{t('awards.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Awards Grid */}
      <div className="awards-grid">
        {filteredAwards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <AwardIcon size={48} />
            </div>
            <h3 className="empty-title">
              {t('awards.empty.title')}
            </h3>
            <p className="empty-description">
              {t('awards.empty.description')}
            </p>
            <button
              onClick={handleCreate}
              className="btn-create-empty"
              disabled={isSubmitting}
            >
              <Plus size={20} />
              {t('awards.create')}
            </button>
          </div>
        ) : (
          filteredAwards.map((award) => (
            <div key={award._id} className="award-card">
              {/* Image */}
              <div className="award-image-container">
                {getImageUrl(award) ? (
                  <img
                    src={getImageUrl(award)}
                    alt={award.name}
                    className="award-image"
                  />
                ) : (
                  <div className="award-image-placeholder">
                    <AwardIcon size={48} />
                  </div>
                )}
                
                <div className="award-status-badge">
                  <span className={`status-badge ${award.isActive ? 'status-active' : 'status-inactive'}`}>
                    {award.isActive ? t('awards.status.active') : t('awards.status.inactive')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="award-card-body">
                <div className="award-card-header">
                  <h3 className="award-title">{award.name}</h3>
                  <div className="award-actions">
                    <button
                      onClick={() => handleView(award)}
                      className="action-btn action-btn-view"
                      disabled={isSubmitting}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(award)}
                      className="action-btn action-btn-edit"
                      disabled={isSubmitting}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(award._id)}
                      className="action-btn action-btn-delete"
                      disabled={isDeleting === award._id}
                    >
                      {isDeleting === award._id ? (
                        <div className="delete-spinner"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {award.description && (
                  <p className="award-description">
                    {award.description}
                  </p>
                )}

                <div className="award-date">
                  <Calendar size={14} />
                  <span>{t('awards.awardDate')}: {formatDate(award.awardDate)}</span>
                </div>

                <div className="award-footer">
                  <p>{t('awards.createdBy')}: {award.createdBy?.username}</p>
                  <p>{formatDate(award.createdAt)}</p>
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
                {modalType === 'create' && t('awards.modal.create')}
                {modalType === 'edit' && t('awards.modal.edit')}
                {modalType === 'view' && t('awards.modal.view')}
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
                  {getImageUrl(selectedAward) && (
                    <div className="view-image-container">
                      <img
                        src={getImageUrl(selectedAward)}
                        alt={selectedAward?.name}
                        className="view-image"
                      />
                    </div>
                  )}

                  <div className="view-fields">
                    <div className="view-field">
                      <label className="view-label">
                        {t('awards.form.name')}
                      </label>
                      <p className="view-value-box">
                        {selectedAward?.name}
                      </p>
                    </div>

                    {selectedAward?.description && (
                      <div className="view-field">
                        <label className="view-label">
                          {t('awards.form.description')}
                        </label>
                        <p className="view-value-box view-value-description">
                          {selectedAward.description}
                        </p>
                      </div>
                    )}

                    <div className="view-grid">
                      <div className="view-field">
                        <label className="view-label">
                          {t('awards.form.awardDate')}
                        </label>
                        <p className="view-value">
                          {formatDate(selectedAward?.awardDate)}
                        </p>
                      </div>
                      <div className="view-field">
                        <label className="view-label">
                          {t('awards.form.status')}
                        </label>
                        <span className={`status-badge-large ${selectedAward?.isActive ? 'status-active' : 'status-inactive'}`}>
                          {selectedAward?.isActive ? t('awards.status.active') : t('awards.status.inactive')}
                        </span>
                      </div>
                    </div>
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
                      {t('awards.form.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('awards.form.namePlaceholder')}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t('awards.form.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={t('awards.form.descriptionPlaceholder')}
                      rows={3}
                      className="form-textarea"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t('awards.form.awardDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.awardDate}
                      onChange={(e) => setFormData({...formData, awardDate: e.target.value})}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>

                  {modalType === 'create' && (
                    <div className="form-group">
                      <label className="form-label">
                        {t('awards.form.image')} *
                      </label>
                      <div className="file-upload-section">
                        <div className="file-upload-wrapper">
                          <label className={`file-upload-label ${isSubmitting ? 'disabled' : ''}`}>
                            <div className="file-upload-content">
                              <Upload className="upload-icon" />
                              <p className="upload-text">
                                <span className="upload-text-highlight">{t('awards.form.clickToUpload')}</span>
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
                    </div>
                  )}
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
                  {t('awards.form.cancel')}
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
                      {modalType === 'create' ? `Uploading... ${uploadProgress}%` : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {modalType === 'create' ? t('awards.form.create') : t('awards.form.update')}
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

export default Awards;
