import React, { useState } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PrivacyBadge from '../../components/PrivacyBadge';
import { MessageSquare, Star, Send, Heart, AlertCircle, CheckCircle } from 'lucide-react';

const ParentFeedback = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please enter your feedback text.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await API.post('/parent/feedback', {
        feedbackText,
        surveyRating: rating
      });
      setSuccess('Thank you! Your feedback has been securely submitted to the school administration.');
      setFeedbackText('');
      setRating(5);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="School Feedback & Surveys" />
        <div className="content-body">
          <PrivacyBadge />
          
          <div className="feedback-layout">
            <div className="glass-panel feedback-form-panel">
              <div className="form-header">
                <span className="icon-wrap-pink">💬</span>
                <div>
                  <h3>Submit Feedback</h3>
                  <p>Your suggestions help us improve the daycare experience.</p>
                </div>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="success-alert" style={{ background: '#E8F8EE', color: 'var(--color-success)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                  <CheckCircle size={18} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="feedback-form-widget">
                <div className="rating-form-group">
                  <label>How would you rate your child's overall experience this week?</label>
                  <div className="stars-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star-item-picker ${(hoverRating || rating) >= star ? 'selected' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                      >
                        <Star size={32} fill={(hoverRating || rating) >= star ? 'var(--color-secondary)' : 'none'} />
                      </span>
                    ))}
                  </div>
                  <span className="rating-desc-lbl">
                    {rating === 5 && '🌟 Exceptional - Exceeds all expectations'}
                    {rating === 4 && '😊 Great - Happy with daily updates'}
                    {rating === 3 && '😐 Satisfactory - Meets expectations'}
                    {rating === 2 && '😟 Needs Improvement - Some concerns'}
                    {rating === 1 && '🚨 Action Required - Contact me immediately'}
                  </span>
                </div>

                <div className="form-group">
                  <label>Share your suggestions or notes for the teachers/admin</label>
                  <textarea
                    rows="5"
                    className="form-control feedback-textarea"
                    placeholder="E.g., Aarav really loved the colors painting activity today! Can we do more of those?"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Send Feedback'} <Send size={16} />
                </button>
              </form>
            </div>

            <div className="glass-panel school-contact-panel">
              <h3>Direct School Contact</h3>
              <p>For urgent matters, please reach out to the school board directly.</p>

              <div className="contact-channels">
                <div className="channel-item">
                  <span className="channel-icon">📞</span>
                  <div>
                    <h4>Phone Support</h4>
                    <p>+1 (555) 234-5678</p>
                  </div>
                </div>

                <div className="channel-item">
                  <span className="channel-icon">✉️</span>
                  <div>
                    <h4>Admin Email</h4>
                    <p>support@kidvista.com</p>
                  </div>
                </div>

                <div className="channel-item">
                  <span className="channel-icon">🏫</span>
                  <div>
                    <h4>Office Hours</h4>
                    <p>Mon - Fri: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="quick-tip-card">
                <Heart size={18} color="var(--color-primary)" fill="var(--color-primary)" />
                <p>All photos and tags are protected under our Strict Privacy Rules.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .feedback-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2rem;
          text-align: left;
        }

        .icon-wrap-pink {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          background: #E3F2FD;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .form-header h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0;
        }

        .form-header p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .rating-form-group {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rating-form-group label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .stars-picker {
          display: flex;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }

        .star-item-picker {
          cursor: pointer;
          color: #CBD5E1;
          transition: transform 0.2s;
        }

        .star-item-picker.selected {
          color: var(--color-secondary);
        }

        .star-item-picker:hover {
          transform: scale(1.15);
        }

        .rating-desc-lbl {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .feedback-textarea {
          resize: vertical;
          border-radius: 12px;
          padding: 1rem;
        }

        .submit-btn {
          width: 100%;
          border-radius: 12px;
          padding: 0.85rem;
          font-weight: 700;
          margin-top: 1rem;
        }

        .school-contact-panel h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }

        .school-contact-panel p {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .contact-channels {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .channel-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #F8FAFC;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.01);
        }

        .channel-icon {
          font-size: 1.5rem;
        }

        .channel-item h4 {
          font-size: 0.88rem;
          font-weight: 700;
          margin: 0;
        }

        .channel-item p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0.1rem 0 0 0;
        }

        .quick-tip-card {
          background: #E8F2FE;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: #334155;
          line-height: 1.4;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .feedback-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentFeedback;
