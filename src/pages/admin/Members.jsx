import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Users,
  X,
  Save,
  Upload,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Members.css';

const Members = () => {
  const { t } = useTranslation('admin');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    position: '',
    department: '',
    email: '',
    phone: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ADD: Single click prevention and upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMembers();
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
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
    setSelectedMember(null);
    setFormData({
      name: '',
      description: '',
      position: '',
      department: '',
      email: '',
      phone: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (member) => {
    if (isSubmitting) return;
    
    setModalType('edit');
    setSelectedMember(member);
    setFormData({
      name: member.name,
      description: member.description || '',
      position: member.position || '',
      department: member.department || '',
      email: member.email || '',
      phone: member.phone || ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (member) => {
    setModalType('view');
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (isDeleting === id) return;
    
    if (window.confirm(t('members.confirmDelete'))) {
      try {
        setIsDeleting(id);
        await adminAPI.deleteMember(id);
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
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

    if (!formData.name.trim() || !formData.description.trim()) {
      setSubmitError('Name and description are required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (modalType === 'create') {
        let submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          position: formData.position?.trim() || '',
          department: formData.department?.trim() || '',
          email: formData.email?.trim() || '',
          phone: formData.phone?.trim() || ''
        };

        // Add image data if file is selected
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
        await adminAPI.createMember(submitData);
        setUploadProgress(100);
      } else {
        await adminAPI.updateMember(selectedMember._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          position: formData.position?.trim() || '',
          department: formData.department?.trim() || '',
          email: formData.email?.trim() || '',
          phone: formData.phone?.trim() || '',
          isActive: true
        });
      }

      // Success delay for user feedback
      setTimeout(() => {
        setShowModal(false);
        setIsSubmitting(false);
        setUploadProgress(0);
        fetchMembers();
        setFormData({
          name: '',
          description: '',
          position: '',
          department: '',
          email: '',
          phone: ''
        });
        setSelectedFile(null);
        setPreviewUrl('');
      }, 500);

    } catch (error) {
      console.error('Error submitting member:', error);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setSubmitError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setSubmitError(error.response?.data?.message || 'Error submitting member');
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
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
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.description && member.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (member) => {
    if (member.image && member.image.data) {
      return member.image.data; // This is already a data URL
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
    <div className="members-container">
      {/* Header */}
      <div className="members-header">
        <div>
          <h1 className="page-title">
            {t('members.title')}
          </h1>
          <p className="page-subtitle">
            {t('members.subtitle')}
          </p>
        </div>
        <button 
          onClick={handleCreate} 
          className="btn-create"
          disabled={isSubmitting}
        >
          <Plus size={20} />
          {t('members.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-wrapper">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('members.search')}
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
              <option value="all">{t('members.filter.all')}</option>
              <option value="active">{t('members.filter.active')}</option>
              <option value="inactive">{t('members.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="members-grid">
        {filteredMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={48} />
            </div>
            <h3 className="empty-title">
              {t('members.empty.title')}
            </h3>
            <p className="empty-description">
              {t('members.empty.description')}
            </p>
            <button 
              onClick={handleCreate} 
              className="btn-create-empty"
              disabled={isSubmitting}
            >
              <Plus size={20} />
              {t('members.create')}
            </button>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member._id} className="member-card">
              {/* Profile Image */}
              <div className="member-image-container">
                {getImageUrl(member) ? (
                  <img
                    src={getImageUrl(member)}
                    alt={member.name}
                    className="member-image"
                  />
                ) : (
                  <div className="member-placeholder">
                    <Users size={48} />
                  </div>
                )}
                
                <div className="status-badge-container">
                  <span className={`status-badge ${member.isActive ? 'status-active' : 'status-inactive'}`}>
                    {member.isActive ? t('members.status.active') : t('members.status.inactive')}
                  </span>
                </div>

                <div className="member-actions">
                  <button 
                    onClick={() => handleView(member)} 
                    className="action-btn"
                    disabled={isSubmitting}
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={() => handleEdit(member)} 
                    className="action-btn"
                    disabled={isSubmitting}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(member._id)} 
                    className="action-btn action-btn-delete"
                    disabled={isDeleting === member._id}
                  >
                    {isDeleting === member._id ? (
                      <div className="delete-spinner"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="member-content">
                <h3 className="member-name">{member.name}</h3>
                
                {member.position && (
                  <div className="member-position">
                    <Briefcase size={14} className="position-icon" />
                    <span className="position-text">{member.position}</span>
                  </div>
                )}

                {member.description && (
                  <p className="member-description">
                    {member.description}
                  </p>
                )}

                <div className="member-contacts">
                  {member.email && (
                    <div className="contact-item">
                      <Mail size={14} className="contact-icon" />
                      <span className="contact-text">{member.email}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="contact-item">
                      <Phone size={14} className="contact-icon" />
                      <span className="contact-text">{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="member-footer">
                  <p>{t('members.createdBy')}: {member.createdBy?.username}</p>
                  <p>{formatDate(member.createdAt)}</p>
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
                {modalType === 'create' && t('members.modal.create')}
                {modalType === 'edit' && t('members.modal.edit')}
                {modalType === 'view' && t('members.modal.view')}
              </h2>
              <button 
                onClick={handleCloseModal} 
                className="modal-close"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scrollable">
              {modalType === 'view' ? (
                <div className="view-content">
                  {getImageUrl(selectedMember) && (
                    <div className="view-avatar-container">
                      <img
                        src={getImageUrl(selectedMember)}
                        alt={selectedMember?.name}
                        className="view-avatar"
                      />
                    </div>
                  )}

                  <div className="view-fields">
                    <div className="view-field">
                      <label className="view-label">
                        {t('members.form.name')}
                      </label>
                      <p className="view-value">
                        {selectedMember?.name}
                      </p>
                    </div>

                    {selectedMember?.description && (
                      <div className="view-field">
                        <label className="view-label">
                          {t('members.form.description')}
                        </label>
                        <p className="view-value view-description">
                          {selectedMember.description}
                        </p>
                      </div>
                    )}

                    <div className="view-grid">
                      {selectedMember?.position && (
                        <div className="view-field">
                          <label className="view-label">
                            {t('members.form.position')}
                          </label>
                          <p className="view-value-small">
                            {selectedMember.position}
                          </p>
                        </div>
                      )}
                      
                      {selectedMember?.department && (
                        <div className="view-field">
                          <label className="view-label">
                            {t('members.form.department')}
                          </label>
                          <p className="view-value-small">
                            {selectedMember.department}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="view-grid">
                      {selectedMember?.email && (
                        <div className="view-field">
                          <label className="view-label">
                            {t('members.form.email')}
                          </label>
                          <p className="view-value-small">
                            {selectedMember.email}
                          </p>
                        </div>
                      )}
                      
                      {selectedMember?.phone && (
                        <div className="view-field">
                          <label className="view-label">
                            {t('members.form.phone')}
                          </label>
                          <p className="view-value-small">
                            {selectedMember.phone}
                          </p>
                        </div>
                      )}
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
                      {t('members.form.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('members.form.namePlaceholder')}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t('members.form.description')} *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={t('members.form.descriptionPlaceholder')}
                      rows={3}
                      className="form-textarea"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        {t('members.form.position')}
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        placeholder={t('members.form.positionPlaceholder')}
                        className="form-input"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t('members.form.department')}
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        placeholder={t('members.form.departmentPlaceholder')}
                        className="form-input"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        {t('members.form.email')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder={t('members.form.emailPlaceholder')}
                        className="form-input"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t('members.form.phone')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder={t('members.form.phonePlaceholder')}
                        className="form-input"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {modalType === 'create' && (
                    <div className="form-group">
                      <label className="form-label">
                        {t('members.form.image')}
                      </label>
                      <div className="file-upload-section">
                        <div className="file-upload-container">
                          <label className={`file-upload-label ${isSubmitting ? 'disabled' : ''}`}>
                            <div className="file-upload-content">
                              <Upload className="upload-icon" />
                              <p className="upload-text">
                                <span className="upload-highlight">{t('members.form.clickToUpload')}</span>
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
                              className="preview-remove"
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
                  {t('members.form.cancel')}
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
                      {modalType === 'create' 
                        ? (selectedFile ? `Uploading... ${uploadProgress}%` : 'Creating...')
                        : 'Updating...'
                      }
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {modalType === 'create' ? t('members.form.create') : t('members.form.update')}
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

export default Members;
