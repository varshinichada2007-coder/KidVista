import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

const PrivacyBadge = () => {
  return (
    <div className="privacy-badge-container">
      <div className="privacy-badge">
        <ShieldAlert size={16} />
        <span>Privacy Protection Activated</span>
      </div>
      <div className="privacy-badge-details">
        <Info size={12} className="info-icon" />
        <span>Only your child's approved tagged photos are visible. Classroom photos of other students are kept strictly private.</span>
      </div>

      <style>{`
        .privacy-badge-container {
          background: rgba(107, 203, 119, 0.08);
          border: 1px solid rgba(107, 203, 119, 0.2);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 1.5rem;
        }

        .privacy-badge {
          background: #2E7D32;
          color: white;
          padding: 0.3rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        .privacy-badge-details {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: #2E7D32;
          font-weight: 500;
          line-height: 1.3;
        }

        .info-icon {
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .privacy-badge-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyBadge;
