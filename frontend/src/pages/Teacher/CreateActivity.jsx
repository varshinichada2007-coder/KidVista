import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Sparkles, Plus, Image as ImageIcon, Trash2, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateActivity = () => {
  const [classroomName, setClassroomName] = useState('');
  const [classroomId, setClassroomId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Activity state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Art & Craft');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiSummary, setAiSummary] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  // Photos state
  const [photosList, setPhotosList] = useState([]); // Array of { file, url, caption, taggedIds: [] }
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formError, setFormError] = useState('');
  
  const navigate = useNavigate();
  const baseURL = 'http://localhost:5000';

  const fetchClassroom = async () => {
    try {
      const response = await API.get('/teacher/students');
      if (response.data.classroomId) {
        setClassroomId(response.data.classroomId);
        setClassroomName(response.data.classroomName);
        setStudents(response.data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroom();
  }, []);

  // Trigger Gemini AI generation for caption & summary
  const handleGenerateAI = async () => {
    if (!title || !description) {
      setFormError('Please enter a Title and Description first to guide the AI.');
      return;
    }
    
    setFormError('');
    setGeneratingAI(true);
    try {
      const [captionRes, summaryRes] = await Promise.all([
        API.post('/teacher/ai/generate', { type: 'caption', description }),
        API.post('/teacher/ai/generate', { type: 'summary', title, description })
      ]);

      setAiSummary(summaryRes.data.summary);

      // Autofill or assign captions to uploaded photos
      if (photosList.length > 0) {
        setPhotosList(prev => prev.map(p => ({ ...p, caption: captionRes.data.caption })));
      } else {
        // If no photos uploaded yet, let's keep the caption ready to use
        localStorage.setItem('pending_ai_caption', captionRes.data.caption);
      }
    } catch (err) {
      setFormError('Could not connect to AI service. Using template fallbacks.');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Handle local photo selection & instant backend upload
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setFormError('');
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await API.post('/teacher/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedUrls = response.data.urls;
      const cachedCaption = localStorage.getItem('pending_ai_caption') || '';
      
      const newPhotos = uploadedUrls.map(url => ({
        url,
        caption: cachedCaption || 'Our children exploring new activities!',
        taggedIds: []
      }));

      setPhotosList(prev => [...prev, ...newPhotos]);
      localStorage.removeItem('pending_ai_caption');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error uploading files.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotosList(prev => prev.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index, value) => {
    setPhotosList(prev => prev.map((p, i) => i === index ? { ...p, caption: value } : p));
  };

  const handleTagToggle = (photoIndex, studentId) => {
    setPhotosList(prev => prev.map((photo, i) => {
      if (i !== photoIndex) return photo;
      
      const alreadyTagged = photo.taggedIds.includes(studentId);
      const newTags = alreadyTagged 
        ? photo.taggedIds.filter(id => id !== studentId)
        : [...photo.taggedIds, studentId];

      return {
        ...photo,
        taggedIds: newTags
      };
    }));
  };

  // Submit Activity and Photos to Backend
  const handleSubmitAll = async () => {
    if (!title || !classroomId) {
      setFormError('Activity title and classroom are required.');
      return;
    }
    if (photosList.length === 0) {
      setFormError('Please upload at least one photo for this classroom activity.');
      return;
    }

    // Check if students are tagged in all photos
    const untaggedPhotos = photosList.some(p => p.taggedIds.length === 0);
    if (untaggedPhotos) {
      setFormError('Privacy Rule: Please tag at least one student in each photo.');
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      // 1. Create classroom activity
      const activityRes = await API.post('/teacher/activities', {
        title,
        description,
        category,
        activity_date: activityDate,
        classroom_id: classroomId,
        ai_summary: aiSummary
      });

      const activityId = activityRes.data.activity.id;

      // 2. Submit photos with student tags
      const photosPayload = photosList.map(p => ({
        image_url: p.url,
        ai_caption: p.caption,
        student_ids: p.taggedIds
      }));

      await API.post('/teacher/photos/submit', {
        activity_id: activityId,
        photos: photosPayload
      });

      navigate('/teacher/history');
    } catch (err) {
      setFormError('Error submitting photos.');
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Log Daily Classroom Event" />
        <div className="content-body">
          {loading && !title ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>🏫 Loading activity log...</div>
          ) : (
            <div className="create-layout">
              {/* Form columns */}
              <div className="form-column">
                <div className="glass-panel">
                  <h3 className="section-title-sm">1. Activity Information</h3>
                  
                  {formError && <div className="error-alert" style={{ marginBottom: '1.2rem' }}>{formError}</div>}
                  
                  <div className="classroom-banner-meta">
                    🏫 Assigned Classroom: <strong>{classroomName || 'None'}</strong>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="title">Activity Title</label>
                      <input 
                        type="text" 
                        id="title"
                        className="form-control"
                        placeholder="e.g. Clay Modeling Workshop"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select 
                        id="category"
                        className="form-control"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option>Art & Craft</option>
                        <option>Sports</option>
                        <option>Storytelling</option>
                        <option>Music</option>
                        <option>Dance</option>
                        <option>Celebration</option>
                        <option>Learning Activity</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="activityDate">Activity Date</label>
                    <input 
                      type="date" 
                      id="activityDate"
                      className="form-control"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Activity Details (For AI guidance)</label>
                    <textarea 
                      id="description"
                      className="form-control"
                      placeholder="e.g. Children explored sensory touch by creating modeling shapes with soft colorful clay..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                    />
                  </div>

                  {/* AI Button */}
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-ai"
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                  >
                    <Sparkles size={16} /> 
                    {generatingAI ? 'Google Gemini generating summaries...' : 'Generate AI Caption & Summary'}
                  </button>

                  {/* AI Summary textarea */}
                  {aiSummary && (
                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4D96FF' }}>
                        <Sparkles size={14} /> AI Parent Summary (Auto-generated)
                      </label>
                      <textarea 
                        className="form-control ai-textarea"
                        value={aiSummary}
                        onChange={(e) => setAiSummary(e.target.value)}
                        rows="3"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div className="glass-panel">
                  <div className="photo-panel-head">
                    <h3 className="section-title-sm">2. Upload Activity Photos</h3>
                    <span className="photo-count-pill">{photosList.length} photo(s) selected</span>
                  </div>

                  <div className="file-drop-area">
                    <ImageIcon size={40} className="upload-placeholder-icon" />
                    <p>Select classroom photos to upload</p>
                    <label className="btn btn-primary file-input-label">
                      Choose Photos
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        style={{ display: 'none' }}
                      />
                    </label>
                    {uploadingFiles && <span className="upload-loader">Uploading files to server...</span>}
                  </div>
                </div>
              </div>

              {/* Tagging columns */}
              <div className="tagging-column">
                <div className="glass-panel tagger-inner">
                  <h3 className="section-title-sm">3. Tag Students & Preview Cards</h3>
                  <p className="tag-instruction-txt">
                    🔐 <strong>Privacy Rule:</strong> Check the students present in each photo. Parents can only view photos containing tags of their own child.
                  </p>

                  {photosList.length === 0 ? (
                    <div className="empty-photo-tagger">
                      <ImageIcon size={36} color="#ccc" />
                      <p>Upload photos to configure student tags.</p>
                    </div>
                  ) : (
                    <div className="tagging-cards-stack">
                      {photosList.map((photo, index) => {
                        const fullUrl = photo.url.startsWith('http') ? photo.url : `${baseURL}${photo.url}`;
                        return (
                          <div key={index} className="tag-preview-card">
                            <div className="preview-image-section">
                              <img src={fullUrl} alt="Preview" className="tagger-img" />
                              <button className="remove-photo-btn" onClick={() => handleRemovePhoto(index)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            <div className="tag-details-section">
                              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Photo AI Caption</label>
                                <input 
                                  type="text"
                                  className="form-control input-sm"
                                  value={photo.caption}
                                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                                  placeholder="Enter photo caption..."
                                />
                              </div>

                              <div className="tagger-student-grid">
                                <p className="tag-list-headline"><Tag size={12} /> Check Present Student(s):</p>
                                <div className="student-checkbox-wrap">
                                  {students.map(s => (
                                    <div 
                                      key={s.id} 
                                      className={`student-cb-label ${photo.taggedIds.includes(s.id) ? 'checked' : ''}`}
                                      onClick={() => handleTagToggle(index, s.id)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <span>👦 {s.student_name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Submit Actions */}
                      <div className="submit-action-footer">
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/teacher')}>
                          Cancel
                        </button>
                        <button className="btn btn-green" style={{ flex: 2 }} onClick={handleSubmitAll}>
                          <CheckCircle2 size={16} /> Submit Activity & Tagged Photos
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .create-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: flex-start;
          font-family: 'Outfit', sans-serif;
        }

        @media (max-width: 992px) {
          .create-layout {
            grid-template-columns: 1fr;
          }
        }

        .section-title-sm {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 1rem;
        }

        .classroom-banner-meta {
          background: rgba(255, 107, 139, 0.06);
          color: #4F9CF9;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1rem;
        }

        .btn-ai {
          width: 100%;
          margin-top: 0.5rem;
          box-shadow: 0 4px 10px rgba(77,150,255,0.2);
        }

        .ai-textarea {
          border-color: rgba(77, 150, 255, 0.4);
          background: rgba(77, 150, 255, 0.02);
        }

        .photo-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .photo-count-pill {
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(77, 150, 255, 0.08);
          color: #4D96FF;
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
        }

        .file-drop-area {
          border: 2px dashed rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-placeholder-icon {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .file-input-label {
          margin-top: 0.5rem;
        }

        .upload-loader {
          font-size: 0.8rem;
          color: #4D96FF;
          font-weight: 600;
        }

        /* Tagging layouts */
        .tag-instruction-txt {
          font-size: 0.85rem;
          color: #2E7D32;
          background: rgba(107,203,119,0.08);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        .empty-photo-tagger {
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .tagging-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tag-preview-card {
          display: grid;
          grid-template-columns: 180px 1fr;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        @media (max-width: 500px) {
          .tag-preview-card {
            grid-template-columns: 1fr;
          }
        }

        .preview-image-section {
          position: relative;
          background: #f0f2f5;
          min-height: 140px;
        }

        .tagger-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-photo-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          color: #4F9CF9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .remove-photo-btn:hover {
          background: #4F9CF9;
          color: white;
        }

        .tag-details-section {
          padding: 1rem;
        }

        .input-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          border-radius: 8px;
        }

        .tag-list-headline {
          font-size: 0.78rem;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .student-checkbox-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .student-cb-label {
          border: 1px solid rgba(0,0,0,0.08);
          background: #fafafc;
          padding: 0.25rem 0.6rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          user-select: none;
          transition: all 0.2s;
        }

        .student-cb-label input {
          display: none;
        }

        .student-cb-label.checked {
          background: #E3F2FD;
          border-color: rgba(77, 150, 255, 0.4);
          color: var(--color-blue);
        }

        .submit-action-footer {
          display: flex;
          gap: 1rem;
          border-top: 1px dashed rgba(0,0,0,0.08);
          padding-top: 1.5rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default CreateActivity;
