import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  ImageIcon,
  X,
  Save,
  Upload,
  ZoomIn
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Gallery.css';

const Gallery = () => {
  const { t } = useTranslation('admin');
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ADD: Single click prevention and upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGallery();
      setGallery(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
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
    setSelectedItem(null);
    setFormData({ name: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    if (isSubmitting) return;
    
    setModalType('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleImageView = (item) => {
    setSelectedItem(item);
    setShowImageModal(true);
  };

  const handleDelete = async (id) => {
    if (isDeleting === id) return;
    
    if (window.confirm(t('gallery.confirmDelete'))) {
      try {
        setIsDeleting(id);
        await adminAPI.deleteGalleryItem(id);
        fetchGallery();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
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

    if (modalType === 'create' && !selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    if (!formData.name.trim()) {
      setSubmitError('Please enter a name for the gallery item');
      return;
    }

    try {
      setIsSubmitting(true);

      if (modalType === 'create') {
        // Step 1: Compress image (25% progress)
        setUploadProgress(25);
        console.log('Compressing image...');
        const compressedFile = await compressImage(selectedFile);
        
        // Step 2: Convert to base64 (50% progress)
        setUploadProgress(50);
        const base64Data = await convertFileToBase64(compressedFile);
        
        const submitData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          imageData: base64Data,
          contentType: 'image/jpeg',
          filename: selectedFile.name,
          size: compressedFile.size
        };

        // Step 3: Upload (75% progress)
        setUploadProgress(75);
        console.log('Uploading compressed gallery item, size:', compressedFile.size);
        await adminAPI.createGalleryItem(submitData);
        setUploadProgress(100);
      } else {
        await adminAPI.updateGalleryItem(selectedItem._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          isActive: true
        });
      }

      // Success delay for user feedback
      setTimeout(() => {
        setShowModal(false);
        setIsSubmitting(false);
        setUploadProgress(0);
        fetchGallery();
        setFormData({ name: '', description: '' });
        setSelectedFile(null);
        setPreviewUrl('');
      }, 500);

    } catch (error) {
      console.error('Error submitting gallery item:', error);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setSubmitError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setSubmitError(error.response?.data?.message || 'Error submitting gallery item');
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
    
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
      
      console.log('File set in state:', file);
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

  const filteredGallery = gallery.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
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

  const getImageUrl = (item) => {
    if (item.image && item.image.data) {
      return item.image.data;
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
    <div className="gallery-container">
      {/* Header */}
      <div className="gallery-header">
        <div>
          <h1 className="page-title">
            {t('gallery.title')}
          </h1>
          <p className="page-subtitle">
            {t('gallery.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-create"
          disabled={isSubmitting}
        >
          <Plus size={20} />
          {t('gallery.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('gallery.search')}
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
              <option value="all">{t('gallery.filter.all')}</option>
              <option value="active">{t('gallery.filter.active')}</option>
              <option value="inactive">{t('gallery.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {filteredGallery.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ImageIcon size={48} />
            </div>
            <h3 className="empty-title">
              {t('gallery.empty.title')}
            </h3>
            <p className="empty-description">
              {t('gallery.empty.description')}
            </p>
            <button
              onClick={handleCreate}
              className="btn-create-empty"
              disabled={isSubmitting}
            >
              <Plus size={20} />
              {t('gallery.create')}
            </button>
          </div>
        ) : (
          filteredGallery.map((item) => (
            <div key={item._id} className="gallery-card">
              {/* Image */}
              <div className="gallery-image-container">
                {getImageUrl(item) ? (
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="gallery-image"
                  />
                ) : (
                  <div className="gallery-image-placeholder">
                    <ImageIcon size={48} />
                  </div>
                )}
                
                {/* Image Overlay */}
                <div className="gallery-image-overlay">
                  <button
                    onClick={() => handleImageView(item)}
                    className="zoom-btn"
                    disabled={isSubmitting}
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="gallery-status-badge">
                  <span className={`status-badge ${item.isActive ? 'status-active' : 'status-inactive'}`}>
                    {item.isActive ? t('gallery.status.active') : t('gallery.status.inactive')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="gallery-card-body">
                <div className="gallery-card-header">
                  <h3 className="gallery-title">{item.name}</h3>
                  <div className="gallery-actions">
                    <button
                      onClick={() => handleView(item)}
                      className="action-btn action-btn-view"
                      disabled={isSubmitting}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="action-btn action-btn-edit"
                      disabled={isSubmitting}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="action-btn action-btn-delete"
                      disabled={isDeleting === item._id}
                    >
                      {isDeleting === item._id ? (
                        <div className="delete-spinner"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="gallery-description">
                    {item.description}
                  </p>
                )}

                <div className="gallery-footer">
                  <p>{t('gallery.createdBy')}: {item.createdBy?.username}</p>
                  <p>{formatDate(item.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FIXED: Scrollable Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Fixed Header */}
            <div className="modal-header">
              <h2 className="modal-title">
                {modalType === 'create' && t('gallery.modal.create')}
                {modalType === 'edit' && t('gallery.modal.edit')}
                {modalType === 'view' && t('gallery.modal.view')}
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
                  {getImageUrl(selectedItem) && (
                    <div className="view-image-container">
                      <img
                        src={getImageUrl(selectedItem)}
                        alt={selectedItem?.name}
                        className="view-image"
                      />
                    </div>
                  )}

                  <div className="view-fields">
                    <div className="view-field">
                      <label className="view-label">
                        {t('gallery.form.name')}
                      </label>
                      <p className="view-value-box">
                        {selectedItem?.name}
                      </p>
                    </div>

                    {selectedItem?.description && (
                      <div className="view-field">
                        <label className="view-label">
                          {t('gallery.form.description')}
                        </label>
                        <p className="view-value-box view-value-description">
                          {selectedItem.description}
                        </p>
                      </div>
                    )}

                    <div className="view-grid">
                      <div className="view-field">
                        <label className="view-label">
                          {t('gallery.form.status')}
                        </label>
                        <span className={`status-badge-large ${selectedItem?.isActive ? 'status-active' : 'status-inactive'}`}>
                          {selectedItem?.isActive ? t('gallery.status.active') : t('gallery.status.inactive')}
                        </span>
                      </div>
                      <div className="view-field">
                        <label className="view-label">
                          {t('gallery.form.created')}
                        </label>
                        <p className="view-value">
                          {formatDate(selectedItem?.createdAt)}
                        </p>
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

                  <div className="form-group">
                    <label className="form-label">
                      {t('gallery.form.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('gallery.form.namePlaceholder')}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t('gallery.form.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={t('gallery.form.descriptionPlaceholder')}
                      rows={3}
                      className="form-textarea"
                      disabled={isSubmitting}
                    />
                  </div>

                  {modalType === 'create' && (
                    <div className="form-group">
                      <label className="form-label">
                        {t('gallery.form.image')} *
                      </label>
                      <div className="file-upload-section">
                        <div className="file-upload-wrapper">
                          <label className={`file-upload-label ${isSubmitting ? 'disabled' : ''}`}>
                            <div className="file-upload-content">
                              <Upload className="upload-icon" />
                              <p className="upload-text">
                                <span className="upload-text-highlight">{t('gallery.form.clickToUpload')}</span>
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
                  {t('gallery.form.cancel')}
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
                      {modalType === 'create' ? t('gallery.form.create') : t('gallery.form.update')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && selectedItem && (
        <div className="image-modal-overlay">
          <div className="image-modal-container">
            <button
              onClick={() => setShowImageModal(false)}
              className="image-modal-close"
            >
              <X size={32} />
            </button>
            
            {getImageUrl(selectedItem) && (
              <img
                src={getImageUrl(selectedItem)}
                alt={selectedItem.name}
                className="image-modal-img"
              />
            )}
            
            <div className="image-modal-info">
              <h3 className="image-modal-title">{selectedItem.name}</h3>
              {selectedItem.description && (
                <p className="image-modal-description">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
