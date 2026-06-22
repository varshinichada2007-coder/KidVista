import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, ShieldCheck, Clock, Heart, BarChart3, 
  Sparkles, ArrowRight, Check 
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handlePortalClick = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="landing-page-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-logo-group" onClick={() => navigate('/')}>
          <div className="fc-logo-badge">FC</div>
          <div className="logo-text-wrapper">
            <span className="logo-title">KidVista</span>
            <span className="logo-sub">FIRSTCRY INTELLITOTS</span>
          </div>
        </div>
        <nav className="nav-menu">
          <a href="#features">Features</a>
          <a href="#portals">For Schools</a>
          <a href="#portals">Analytics</a>
          <a href="#features">Privacy</a>
        </nav>
        <div className="nav-actions">
          <span className="sign-in-link" onClick={() => navigate('/login')}>Sign in</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
            Get started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content-left">
          <div className="trusted-badge">
            <span className="badge-icon">🏷️</span>
            <span>Trusted by 600+ FirstCry Intellitots centres</span>
          </div>
          
          <h1 className="hero-heading">
            See every learning moment, <span className="text-blue">as it happens.</span>
          </h1>
          
          <p className="hero-subtitle">
            KidVista is the secure daily activity portal where teachers share photos, parents follow along, and admins keep it all safe — designed exclusively for preschool.
          </p>

          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Start your school <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>
            <button className="btn btn-outline-gray btn-lg" onClick={() => handlePortalClick('parent')}>
              View parent demo
            </button>
          </div>

          <div className="hero-compliance-checks">
            <div className="check-item">
              <div className="check-circle-icon"><Check size={12} strokeWidth={3} /></div>
              <span>Admin-approved logins</span>
            </div>
            <div className="check-item">
              <div className="check-circle-icon"><Check size={12} strokeWidth={3} /></div>
              <span>Tagged-only photo access</span>
            </div>
            <div className="check-item">
              <div className="check-circle-icon"><Check size={12} strokeWidth={3} /></div>
              <span>COPPA-aware</span>
            </div>
          </div>
        </div>

        <div className="hero-content-right">
          <div className="hero-image-wrapper">
            <img 
              src="/preschool_classroom.png" 
              alt="Preschool kids coloring" 
              className="hero-main-img" 
            />
            {/* Overlapping Floating Status Card */}
            <div className="floating-status-card">
              <div className="status-icon-circle">
                <Camera size={18} color="#4F9CF9" />
              </div>
              <div className="status-text-details">
                <h4>Art & Craft — Nursery</h4>
                <p>12 new photos • Tagged 3 students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <span className="section-pretitle">FEATURES</span>
        <h2 className="section-title">Everything a preschool day needs.</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon-wrapper">
              <Camera size={20} color="#4F9CF9" />
            </div>
            <h3>Daily photo albums</h3>
            <p>Teachers upload, AI suggests captions, and admin approves before parents see anything.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-wrapper">
              <ShieldCheck size={20} color="#4F9CF9" />
            </div>
            <h3>Tagged-only access</h3>
            <p>Parents only see photos where their child is tagged. Privacy is the default.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-wrapper">
              <Clock size={20} color="#4F9CF9" />
            </div>
            <h3>Activity timeline</h3>
            <p>From morning assembly to departure — every moment in a clean visual timeline.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-wrapper">
              <Heart size={20} color="#4F9CF9" />
            </div>
            <h3>Teacher notes</h3>
            <p>Personal notes per child make every parent feel seen and informed.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-wrapper">
              <BarChart3 size={20} color="#4F9CF9" />
            </div>
            <h3>Live analytics</h3>
            <p>Attendance, engagement and uploads update in real time on the admin dashboard.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-wrapper">
              <Sparkles size={20} color="#4F9CF9" />
            </div>
            <h3>AI summaries</h3>
            <p>Daily class summaries written automatically. Teachers tweak and post.</p>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portals" className="portals-section">
        <div className="portals-grid">
          {/* Card 1: Parent Portal */}
          <div className="portal-card">
            <span className="portal-role-pre">FOR PARENTS</span>
            <h3>Parent portal</h3>
            <p>Follow your child's day in one beautiful feed.</p>
            <span className="portal-link-btn" onClick={() => handlePortalClick('parent')}>
              Open demo <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </span>
          </div>

          {/* Card 2: Teacher Portal */}
          <div className="portal-card">
            <span className="portal-role-pre">FOR TEACHERS</span>
            <h3>Teacher portal</h3>
            <p>Upload, tag and share — in under a minute.</p>
            <span className="portal-link-btn" onClick={() => handlePortalClick('teacher')}>
              Open demo <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </span>
          </div>

          {/* Card 3: Admin Portal */}
          <div className="portal-card">
            <span className="portal-role-pre">FOR ADMINS</span>
            <h3>Admin portal</h3>
            <p>Approvals, classrooms and live analytics.</p>
            <span className="portal-link-btn" onClick={() => handlePortalClick('admin')}>
              Open demo <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </span>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-section">
        <h2 className="cta-heading">Built for the moments parents would otherwise miss.</h2>
        <p className="cta-desc">Roll out KidVista across your centres in days. No app to install — just sign in and share.</p>
        <div className="cta-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Create an account</button>
          <button className="btn btn-outline-gray" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </section>

      {/* Embedded CSS Styles */}
      <style>{`
        .landing-page-container {
          background-color: #FFFFFF;
          font-family: 'Outfit', sans-serif;
          color: #1F2937;
          min-height: 100vh;
        }

        /* Nav Header Styles */
        .landing-header {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1.5rem;
          background: #FFFFFF;
        }

        .landing-logo-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .fc-logo-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #4F9CF9;
          color: #FFFFFF;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }

        .logo-text-wrapper {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.025em;
        }

        .logo-sub {
          font-size: 0.55rem;
          font-weight: 600;
          color: #64748B;
          letter-spacing: 0.05em;
        }

        .nav-menu {
          display: flex;
          gap: 2rem;
        }

        .nav-menu a {
          text-decoration: none;
          color: #64748B;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav-menu a:hover {
          color: #0F172A;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .sign-in-link {
          color: #64748B;
          font-weight: 500;
          cursor: pointer;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .sign-in-link:hover {
          color: #0F172A;
        }

        /* Buttons Styling */
        .btn {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background-color: #2563EB;
          color: #FFFFFF;
        }

        .btn-primary:hover {
          background-color: #1D4ED8;
        }

        .btn-outline-gray {
          background-color: #FFFFFF;
          color: #1F2937;
          border: 1px solid #E5E7EB;
        }

        .btn-outline-gray:hover {
          background-color: #F9FAFB;
          border-color: #D1D5DB;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-lg {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }

        /* Hero Section */
        .hero-section {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
          padding: 2.5rem 1.5rem 3rem;
          align-items: center;
          min-height: calc(100vh - 60px);
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            padding: 2rem 1.5rem;
          }
        }

        .hero-content-left {
          display: flex;
          flex-direction: column;
        }

        .trusted-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #F1F5F9;
          padding: 0.3rem 0.7rem;
          border-radius: 9999px;
          align-self: flex-start;
          margin-bottom: 1rem;
        }

        .trusted-badge span {
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }

        .hero-heading {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #0F172A;
          margin-bottom: 1rem;
        }

        .text-blue {
          color: #2563EB;
        }

        .hero-subtitle {
          font-size: 1rem;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 1.5rem;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .hero-compliance-checks {
          display: flex;
          gap: 2rem;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .check-circle-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #E2E8F0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .check-item span {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
        }

        /* Hero Image Layout */
        .hero-content-right {
          display: flex;
          justify-content: center;
        }

        .hero-image-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
        }

        .hero-main-img {
          width: 100%;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          display: block;
        }

        /* Overlapping Floating Status Card */
        .floating-status-card {
          position: absolute;
          bottom: 1.5rem;
          left: -1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 480px) {
          .floating-status-card {
            left: 1rem;
            right: 1rem;
          }
        }

        .status-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: #EFF6FF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-text-details h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .status-text-details p {
          font-size: 0.75rem;
          color: #64748B;
          margin: 0;
          margin-top: 0.15rem;
        }

        /* Features Section */
        .features-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 1.5rem;
          border-top: 1px solid #F1F5F9;
        }

        .section-pretitle {
          font-size: 0.75rem;
          font-weight: 800;
          color: #2563EB;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.75rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.025em;
          margin-bottom: 2.5rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .feat-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #EFF6FF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #475569;
        }

        /* Portals Section */
        .portals-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem 1.5rem;
        }

        .portals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .portals-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .portal-card {
          background-color: #F8FAFC;
          border-radius: 16px;
          padding: 2.5rem 2rem;
          border: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .portal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
        }

        .portal-role-pre {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.075em;
          margin-bottom: 0.5rem;
        }

        .portal-card h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }

        .portal-card p {
          font-size: 0.95rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 2rem;
          flex-grow: 1;
        }

        .portal-link-btn {
          font-size: 0.95rem;
          font-weight: 700;
          color: #2563EB;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          transition: gap 0.2s;
        }

        .portal-link-btn:hover {
          color: #1D4ED8;
          text-decoration: underline;
        }

        /* Bottom CTA Section */
        .bottom-cta-section {
          background-color: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          padding: 4rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cta-heading {
          font-size: 2.15rem;
          font-weight: 800;
          line-height: 1.2;
          color: #0F172A;
          max-width: 600px;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .cta-desc {
          font-size: 1.05rem;
          color: #475569;
          margin-bottom: 2.5rem;
          max-width: 500px;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Landing;
