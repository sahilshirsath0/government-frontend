// components/admin/Programs.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Award,
  X,
  Save,
  Upload,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Programs.css';

const Programs = () => {
  const { t } = useTranslation('admin');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedProgram, setSelectedProgram] = useState(null);
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
    fetchPrograms();
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

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPrograms();
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (isSubmitting) return;
    
    setModalType('create');
    setSelectedProgram(null);
    setFormData({ name: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (program) => {
    if (isSubmitting) return;
    
    setModalType('edit');
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      description: program.description
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (program) => {
    setModalType('view');
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (isDeleting === id) return;
    
    if (window.confirm(t('programs.confirmDelete'))) {
      try {
        setIsDeleting(id);
        await adminAPI.deleteProgram(id);
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
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

    if (!formData.name.trim()) {
      setSubmitError('Please enter program name');
      return;
    }

    if (!formData.description.trim()) {
      setSubmitError('Please enter program description');
      return;
    }

    if (modalType === 'create' && !selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim()
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
      
      if (modalType === 'create') {
        await adminAPI.createProgram(submitData);
      } else {
        submitData.isActive = true;
        await adminAPI.updateProgram(selectedProgram._id, submitData);
      }
      
      setUploadProgress(100);

      // Success delay for user feedback
      setTimeout(() => {
        setShowModal(false);
        setIsSubmitting(false);
        setUploadProgress(0);
        fetchPrograms();
        setFormData({ name: '', description: '' });
        setSelectedFile(null);
        setPreviewUrl('');
      }, 500);

    } catch (error) {
      console.error('Error submitting program:', error);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setSubmitError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setSubmitError('Error submitting program');
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

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && program.isActive) ||
      (filterStatus === 'inactive' && !program.isActive);
    return matchesSearch && matchesFilter;
  });

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
    <div className="programs-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="header-icon-wrapper">
              <div className="header-icon-container">
                <Award className="header-icon" />
              </div>
              <div>
                <h1 className="page-title">{t('programs.title')}</h1>
                <p className="page-subtitle">{t('programs.subtitle')}</p>
              </div>
            </div>
            <div className="stats-container">
              <div className="stat-badge">
                <span className="stat-value">{programs.length}</span> {t('dashboard.stats.totalPrograms')}
              </div>
              <div className="stat-badge">
                <span className="stat-value">{programs.filter(p => p.isActive).length}</span> {t('programs.status.active')}
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="btn-create-header"
            disabled={isSubmitting}
          >
            <Plus size={20} className="btn-icon-rotate" />
            {t('programs.create')}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={18} />
            {t('programs.search')} & {t('common.filter')}
          </h3>
        </div>
        <div className="card-body">
          <div className="search-filter-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder={t('programs.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-select-wrapper">
              <Filter className="filter-icon" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">{t('programs.filter.all')}</option>
                <option value="active">{t('programs.filter.active')}</option>
                <option value="inactive">{t('programs.filter.inactive')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="programs-grid">
        {filteredPrograms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-icon">
                <Award size={48} />
              </div>
              <h3 className="empty-state-title">{t('programs.empty.title')}</h3>
              <p className="empty-state-description">
                {t('programs.empty.description')}
              </p>
              <button
                onClick={handleCreate}
                className="btn-create-empty"
                disabled={isSubmitting}
              >
                <Plus size={20} />
                {t('programs.create')}
              </button>
            </div>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div key={program._id} className="program-card">
              {/* Image */}
              <div className="program-image-container">
                {program.image?.data ? (
                  <img
                    src={program.image.data}
                    alt={program.name}
                    className="program-image"
                  />
                ) : (
                  <div className="program-image-placeholder">
                    <Award size={48} />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="program-status-badge">
                  <span className={`status-badge ${program.isActive ? 'status-active' : 'status-inactive'}`}>
                    {program.isActive ? t('programs.status.active') : t('programs.status.inactive')}
                  </span>
                </div>
              </div>

              <div className="program-card-body">
                {/* Header */}
                <div className="program-card-header">
                  <h3 className="program-title">
                    {program.name}
                  </h3>
                  <div className="program-actions">
                    <button
                      onClick={() => handleView(program)}
                      className="action-btn action-btn-view"
                      title={t('common.view')}
                      disabled={isSubmitting}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(program)}
                      className="action-btn action-btn-edit"
                      title={t('common.edit')}
                      disabled={isSubmitting}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(program._id)}
                      className="action-btn action-btn-delete"
                      title={t('common.delete')}
                      disabled={isDeleting === program._id}
                    >
                      {isDeleting === program._id ? (
                        <div className="delete-spinner"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="program-description">
                  <p className="description-text">
                    {program.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="program-card-footer">
                  <div className="footer-content">
                    <div className="footer-date">
                      <Calendar className="footer-icon" />
                      <span className="footer-text">
                        {formatDate(program.createdAt)}
                      </span>
                    </div>
                    <span className="footer-author">
                      {program.createdBy?.username || 'Admin'}
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
          <div className="modal-container modal-lg">
            {/* Fixed Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  <div className="modal-icon">
                    {modalType === 'create' && <Plus size={24} />}
                    {modalType === 'edit' && <Edit2 size={24} />}
                    {modalType === 'view' && <Eye size={24} />}
                  </div>
                  {modalType === 'create' && t('programs.modal.create')}
                  {modalType === 'edit' && t('programs.modal.edit')}
                  {modalType === 'view' && t('programs.modal.view')}
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
                  {selectedProgram?.image?.data && (
                    <div className="view-image-container">
                      <img
                        src={selectedProgram.image.data}
                        alt={selectedProgram.name}
                        className="view-image"
                      />
                    </div>
                  )}

                  <div className="view-details">
                    <div className="view-field view-field-blue">
                      <label className="view-label">{t('programs.form.programName')}</label>
                      <p className="view-value view-value-title">{selectedProgram?.name}</p>
                    </div>

                    <div className="view-field view-field-green">
                      <label className="view-label">{t('programs.form.description')}</label>
                      <p className="view-value view-value-description">{selectedProgram?.description}</p>
                    </div>

                    <div className="view-grid">
                      <div className="view-field view-field-purple">
                        <label className="view-label">{t('programs.form.status')}</label>
                        <span className={`view-status-badge ${selectedProgram?.isActive ? 'view-status-active' : 'view-status-inactive'}`}>
                          {selectedProgram?.isActive ? t('programs.status.active') : t('programs.status.inactive')}
                        </span>
                      </div>
                      <div className="view-field view-field-yellow">
                        <label className="view-label">{t('programs.form.created')}</label>
                        <p className="view-date">
                          {formatDate(selectedProgram?.createdAt)}
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

                  {/* Image Upload */}
                  <div className="form-group">
                    <label className="form-label">
                      {t('programs.form.programImage')} {modalType === 'create' && '*'}
                    </label>
                    <div className="file-upload-wrapper">
                      <label className={`file-upload-label ${isSubmitting ? 'disabled' : ''}`}>
                        <div className="file-upload-content">
                          <Upload className="upload-icon" />
                          <p className="upload-text">
                            <span className="upload-text-highlight">{t('programs.form.clickToUpload')}</span>
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

                  {/* Form Fields */}
                  <div className="form-fields">
                    <div className="form-field">
                      <label className="form-label">{t('programs.form.programName')} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={t('programs.form.namePlaceholder')}
                        className="form-input"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{t('programs.form.description')} *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder={t('programs.form.descriptionPlaceholder')}
                        rows={6}
                        className="form-textarea"
                        disabled={isSubmitting}
                      />
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
                  {t('programs.form.cancel')}
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
                      {modalType === 'create' ? t('programs.form.create') : t('programs.form.update')}
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

export default Programs;
