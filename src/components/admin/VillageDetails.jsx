// components/admin/VillageDetails.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Eye, 
  Save,
  Upload,
  X,
  MapPin,
  Globe,
  FileText,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './VillageDetails.css';

const VillageDetails = () => {
  const { t } = useTranslation('admin');
  const [villageDetails, setVillageDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedVillageDetail, setSelectedVillageDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    title: {
      en: '',
      mr: ''
    },
    description: {
      en: '',
      mr: ''
    }
  });

  // ADD: Single click prevention and upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchVillageDetails();
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

  const fetchVillageDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getVillageDetails();
      console.log('Fetched village details:', response.data.data);
      setVillageDetails(response.data.data || []);
    } catch (error) {
      console.error('Error fetching village details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (isSubmitting) return;
    
    console.log('Create button clicked');
    setModalType('create');
    setSelectedVillageDetail(null);
    setFormData({
      title: { en: '', mr: '' },
      description: { en: '', mr: '' }
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (villageDetail) => {
    if (isSubmitting) return;
    
    console.log('Edit button clicked');
    setModalType('edit');
    setSelectedVillageDetail(villageDetail);
    setFormData({
      title: {
        en: villageDetail?.title?.en || '',
        mr: villageDetail?.title?.mr || ''
      },
      description: {
        en: villageDetail?.description?.en || '',
        mr: villageDetail?.description?.mr || ''
      }
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (villageDetail) => {
    console.log('View button clicked');
    setModalType('view');
    setSelectedVillageDetail(villageDetail);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (isDeleting === id) return;
    
    if (window.confirm(t('villageDetails.confirmDelete'))) {
      try {
        setIsDeleting(id);
        await adminAPI.deleteVillageDetail(id);
        fetchVillageDetails();
      } catch (error) {
        console.error('Error deleting village detail:', error);
      } finally {
        setIsDeleting(null);
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setSubmitError('');
    setUploadProgress(0);

    console.log('Form submitted with data:', formData);

    if (!formData.title.en.trim() || !formData.title.mr.trim()) {
      setSubmitError('Please enter title in both English and Marathi');
      return;
    }

    if (!formData.description.en.trim() || !formData.description.mr.trim()) {
      setSubmitError('Please enter description in both English and Marathi');
      return;
    }

    if (modalType === 'create' && !selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        title: formData.title,
        description: formData.description
      };

      if (selectedFile) {
        // Step 1: Compress image (25% progress)
        setUploadProgress(25);
        console.log('Compressing image...');
        const compressedFile = await compressImage(selectedFile);
        
        // Step 2: Convert to base64 (50% progress)
        setUploadProgress(50);
        const base64Data = await convertFileToBase64(compressedFile);
        
        submitData.imageData = base64Data;
        submitData.contentType = 'image/jpeg';
        submitData.filename = selectedFile.name;
        submitData.size = compressedFile.size;
        
        console.log('Compressed file size:', compressedFile.size);
      }

      // Step 3: Upload (75% progress)
      setUploadProgress(75);
      console.log('Submitting data:', submitData);

      if (modalType === 'create') {
        await adminAPI.createVillageDetail(submitData);
      } else {
        await adminAPI.updateVillageDetail(selectedVillageDetail._id, submitData);
      }
      
      setUploadProgress(100);

      // Success delay for user feedback
      setTimeout(() => {
        setShowModal(false);
        setIsSubmitting(false);
        setUploadProgress(0);
        fetchVillageDetails();
        setFormData({
          title: { en: '', mr: '' },
          description: { en: '', mr: '' }
        });
        setSelectedFile(null);
        setPreviewUrl('');
      }, 500);

    } catch (error) {
      console.error('Error submitting village detail:', error);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setSubmitError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setSubmitError(error.response?.data?.message || 'Error submitting village detail');
      }
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  const removeFile = () => {
    if (isSubmitting) return;
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const filteredVillageDetails = villageDetails.filter(detail => 
    detail.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.title?.mr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.description?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.description?.mr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    <div className="village-details-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="header-icon-wrapper">
              <div className="header-icon-container">
                <MapPin className="header-icon" />
              </div>
              <div>
                <h1 className="page-title">{t('villageDetails.title')}</h1>
                <p className="page-subtitle">{t('villageDetails.subtitle')}</p>
              </div>
            </div>
            <div className="stats-container">
              <div className="stat-badge">
                <span className="stat-value">{villageDetails.length}</span> Total Details
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCreate}
            className="btn-create-header"
            disabled={isSubmitting}
          >
            <Plus size={20} className="btn-icon-rotate" />
            {t('villageDetails.create')}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={18} />
            Search Village Details
          </h3>
        </div>
        <div className="card-body">
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search village details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Village Details Grid */}
      <div className="village-grid">
        {filteredVillageDetails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-icon">
                <MapPin size={48} />
              </div>
              <h3 className="empty-state-title">{t('villageDetails.empty.title')}</h3>
              <p className="empty-state-description">
                {t('villageDetails.empty.description')}
              </p>
              <button
                onClick={handleCreate}
                className="btn-create-empty"
                disabled={isSubmitting}
              >
                <Plus size={20} />
                {t('villageDetails.create')}
              </button>
            </div>
          </div>
        ) : (
          filteredVillageDetails.map((detail) => (
            <div key={detail._id} className="village-card">
              {/* Image */}
              <div className="village-image-container">
                {detail.image?.data ? (
                  <img
                    src={detail.image.data}
                    alt={detail.title?.en}
                    className="village-image"
                  />
                ) : (
                  <div className="village-image-placeholder">
                    <FileText size={48} />
                  </div>
                )}
              </div>

              <div className="village-card-body">
                {/* Header */}
                <div className="village-card-header">
                  <h3 className="village-title">
                    {detail.title?.en}
                  </h3>
                  <div className="village-actions">
                    <button
                      onClick={() => handleView(detail)}
                      className="action-btn action-btn-view"
                      title={t('common.view')}
                      disabled={isSubmitting}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(detail)}
                      className="action-btn action-btn-edit"
                      title={t('common.edit')}
                      disabled={isSubmitting}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(detail._id)}
                      className="action-btn action-btn-delete"
                      title={t('common.delete')}
                      disabled={isDeleting === detail._id}
                    >
                      {isDeleting === detail._id ? (
                        <div className="delete-spinner"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Language Badge */}
                <div className="language-badges">
                  <span className="language-badge badge-english">
                    <Globe size={12} />
                    English
                  </span>
                  <span className="language-badge badge-marathi">
                    <Globe size={12} />
                    मराठी
                  </span>
                </div>

                {/* Description */}
                <div className="village-description">
                  <p className="description-text">
                    {detail.description?.en}
                  </p>
                </div>

                {/* Footer */}
                <div className="village-card-footer">
                  <div className="footer-content">
                    <span className="footer-date">
                      {formatDate(detail.createdAt)}
                    </span>
                    <span className="footer-author">
                      {detail.createdBy?.username || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FIXED: Scrollable Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container modal-xl">
            {/* Fixed Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  <div className="modal-icon">
                    {modalType === 'create' && <Plus size={24} />}
                    {modalType === 'edit' && <Edit2 size={24} />}
                    {modalType === 'view' && <Eye size={24} />}
                  </div>
                  {modalType === 'create' && t('villageDetails.modal.create')}
                  {modalType === 'edit' && t('villageDetails.modal.edit')}
                  {modalType === 'view' && t('villageDetails.modal.view')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="modal-close-btn"
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scrollable">
              {modalType === 'view' ? (
                <div className="view-mode-content">
                  {/* View Mode Content */}
                  {selectedVillageDetail?.image?.data && (
                    <div className="view-image-container">
                      <img
                        src={selectedVillageDetail.image.data}
                        alt="Village"
                        className="view-image"
                      />
                    </div>
                  )}

                  <div className="view-language-grid">
                    {/* English Content */}
                    <div className="language-card language-card-english">
                      <h4 className="language-title language-title-english">
                        <div className="language-flag flag-english"></div>
                        {t('villageDetails.form.englishContent')}
                      </h4>
                      <div className="language-content">
                        <div>
                          <label className="view-label">{t('villageDetails.form.title')}</label>
                          <p className="view-value view-value-title">{selectedVillageDetail?.title?.en}</p>
                        </div>
                        <div>
                          <label className="view-label">{t('villageDetails.form.description')}</label>
                          <p className="view-value view-value-description">{selectedVillageDetail?.description?.en}</p>
                        </div>
                      </div>
                    </div>

                    {/* Marathi Content */}
                    <div className="language-card language-card-marathi">
                      <h4 className="language-title language-title-marathi">
                        <div className="language-flag flag-marathi"></div>
                        {t('villageDetails.form.marathiContent')}
                      </h4>
                      <div className="language-content">
                        <div>
                          <label className="view-label">{t('villageDetails.form.titleMr')}</label>
                          <p className="view-value view-value-title">{selectedVillageDetail?.title?.mr}</p>
                        </div>
                        <div>
                          <label className="view-label">{t('villageDetails.form.descriptionMr')}</label>
                          <p className="view-value view-value-description">{selectedVillageDetail?.description?.mr}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="modal-form">
                  {submitError && (
                    <div className="error-message">
                      {submitError}
                    </div>
                  )}

                  {/* Image Upload */}
                  {modalType === 'create' && (
                    <div className="form-group">
                      <label className="form-label">{t('villageDetails.form.villageImage')} *</label>
                      <div className="file-upload-wrapper">
                        <label className={`file-upload-label ${isSubmitting ? 'disabled' : ''}`}>
                          <div className="file-upload-content">
                            <Upload className="upload-icon" />
                            <p className="upload-text">
                              <span className="upload-text-highlight">{t('villageDetails.form.clickToUpload')}</span>
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
                  )}

                  {modalType === 'edit' && (
                    <div className="form-group">
                      <label className="form-label">{t('villageDetails.form.updateImage')}</label>
                      <div className="file-upload-wrapper">
                        <label className={`file-upload-label file-upload-label-compact ${isSubmitting ? 'disabled' : ''}`}>
                          <div className="file-upload-content file-upload-content-compact">
                            <Upload className="upload-icon-sm" />
                            <p className="upload-text-sm">{t('villageDetails.form.clickToUpload')}</p>
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
                            className="preview-image preview-image-compact"
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
                  )}

                  {/* Multi-language Form */}
                  <div className="form-language-grid">
                    {/* English Form */}
                    <div className="language-card language-card-english">
                      <h4 className="language-title language-title-english">
                        <div className="language-flag flag-english"></div>
                        {t('villageDetails.form.englishContent')}
                      </h4>
                      <div className="language-form-fields">
                        <div className="form-field">
                          <label className="form-label">{t('villageDetails.form.titleEn')} *</label>
                          <input
                            type="text"
                            value={formData.title.en}
                            onChange={(e) => setFormData({
                              ...formData,
                              title: { ...formData.title, en: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.titlePlaceholderEn')}
                            className="form-input"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">{t('villageDetails.form.descriptionEn')} *</label>
                          <textarea
                            value={formData.description.en}
                            onChange={(e) => setFormData({
                              ...formData,
                              description: { ...formData.description, en: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.descriptionPlaceholderEn')}
                            rows={6}
                            className="form-textarea"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Marathi Form */}
                    <div className="language-card language-card-marathi">
                      <h4 className="language-title language-title-marathi">
                        <div className="language-flag flag-marathi"></div>
                        {t('villageDetails.form.marathiContent')}
                      </h4>
                      <div className="language-form-fields">
                        <div className="form-field">
                          <label className="form-label">{t('villageDetails.form.titleMr')} *</label>
                          <input
                            type="text"
                            value={formData.title.mr}
                            onChange={(e) => setFormData({
                              ...formData,
                              title: { ...formData.title, mr: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.titlePlaceholderMr')}
                            className="form-input"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">{t('villageDetails.form.descriptionMr')} *</label>
                          <textarea
                            value={formData.description.mr}
                            onChange={(e) => setFormData({
                              ...formData,
                              description: { ...formData.description, mr: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.descriptionPlaceholderMr')}
                            rows={6}
                            className="form-textarea"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
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
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  {t('villageDetails.form.cancel')}
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="submit-spinner"></div>
                      {modalType === 'create' 
                        ? (selectedFile ? `Uploading... ${uploadProgress}%` : 'Creating...')
                        : (selectedFile ? `Uploading... ${uploadProgress}%` : 'Updating...')
                      }
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {modalType === 'create' ? t('villageDetails.form.create') : t('villageDetails.form.update')}
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

export default VillageDetails;
