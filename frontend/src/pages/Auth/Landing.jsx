import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Image, CheckCircle, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-emoji">🏫</span>
          <div>
            <h1>FirstCry Intellitots</h1>
            <p>PRESCHOOL PORTAL</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Enter Portal <ArrowRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Daily Activity <br /><span>Photo Sharing</span> Portal</h1>
          <p>
            Welcome to our secure preschool media portal. We combine daily classroom learning updates with state-of-the-art privacy protection, letting you stay connected to your child's magical early learning milestones.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Log In to Your Account
            </button>
            <a href="#features" className="btn btn-outline btn-lg">Explore Security Features</a>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="graphic-blob">
            <div className="bubble pink">🎨 Art</div>
            <div className="bubble blue">🏃 Sports</div>
            <div className="bubble green">📚 Stories</div>
            <div className="bubble yellow">🎶 Music</div>
            <span className="center-emoji">👶</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Why Parents Trust Our Portal</h2>
        <p className="section-subtitle">Specially designed to keep our tiny learners safe, happy, and connected.</p>
        
        <div className="features-grid">
          <div className="feature-item-card">
            <div className="feat-icon pink">
              <ShieldCheck size={28} />
            </div>
            <h3>Secured Student Tagging</h3>
            <p>Teachers tag students present in photos. Parents can only view photos where their own child is tagged. No student data leaks.</p>
          </div>

          <div className="feature-item-card">
            <div className="feat-icon blue">
              <Sparkles size={28} />
            </div>
            <h3>AI Captioning & Summaries</h3>
            <p>Google Gemini AI generates beautiful preschool captions and details developmental benefits of daily classroom activities.</p>
          </div>

          <div className="feature-item-card">
            <div className="feat-icon green">
              <Image size={28} />
            </div>
            <h3>Classroom Memory Wall</h3>
            <p>View your child's activities in a beautiful polaroid collage format. Download images to keep forever in your family album.</p>
          </div>
        </div>
      </section>

      {/* Trust & Privacy notice */}
      <section className="trust-banner">
        <div className="trust-inner">
          <div className="trust-badge">🔒 ISO Compliant Privacy Security</div>
          <h2>Absolute Student Privacy</h2>
          <p>We believe in safe childhood memories. Other parents cannot view your child's photos, and photos are only published after administrative review and approval.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 FirstCry Intellitots Preschool. All Rights Reserved. Securing Childhood Memories with Love.</p>
      </footer>

      <style>{`
        .landing-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-bottom: 1px dashed rgba(0,0,0,0.08);
        }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .logo-emoji {
          font-size: 2.2rem;
        }

        .landing-logo h1 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #FF6B8B;
          line-height: 1;
        }

        .landing-logo p {
          font-size: 0.7rem;
          font-weight: 700;
          color: #7F8C8D;
          letter-spacing: 1.5px;
        }

        /* Hero styles */
        .hero-ctas {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-lg {
          padding: 0.9rem 1.8rem;
          font-size: 1.05rem;
        }

        .hero-graphic {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 380px;
        }

        .graphic-blob {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 107, 139, 0.1), rgba(77, 150, 255, 0.1));
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: morph 6s ease-in-out infinite;
        }

        .center-emoji {
          font-size: 5rem;
          animation: float 4s ease-in-out infinite;
        }

        .bubble {
          position: absolute;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          background: white;
          animation: bounceBubble 3s ease-in-out infinite;
        }

        .bubble.pink { top: 15%; left: -10%; border: 2px solid var(--color-pink); color: var(--color-pink); animation-delay: 0s; }
        .bubble.blue { top: 60%; left: -15%; border: 2px solid var(--color-blue); color: var(--color-blue); animation-delay: 0.5s; }
        .bubble.green { top: 10%; right: -10%; border: 2px solid var(--color-green); color: var(--color-green); animation-delay: 1s; }
        .bubble.yellow { top: 65%; right: -15%; border: 2px solid var(--color-yellow); color: #B38600; animation-delay: 1.5s; }

        /* Features style */
        .features-section {
          padding: 5rem 0;
          text-align: center;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #2C3E50;
        }

        .section-subtitle {
          color: #7F8C8D;
          font-size: 1.1rem;
          margin-bottom: 3.5rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
        }

        .feature-item-card {
          background: white;
          border-radius: 24px;
          padding: 2.5rem 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.02);
          transition: transform 0.3s;
        }

        .feature-item-card:hover {
          transform: translateY(-5px);
        }

        .feat-icon {
          width: 65px;
          height: 65px;
          border-radius: 20px;
          margin: 0 auto 1.5rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feat-icon.pink { background: rgba(255,107,139,0.1); color: var(--color-pink); }
        .feat-icon.blue { background: rgba(77,150,255,0.1); color: var(--color-blue); }
        .feat-icon.green { background: rgba(107,203,119,0.1); color: var(--color-green); }

        .feature-item-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #2C3E50;
        }

        .feature-item-card p {
          color: #7F8C8D;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        /* Trust banner */
        .trust-banner {
          background: linear-gradient(135deg, var(--color-pink), var(--color-purple));
          border-radius: var(--border-radius-lg);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
          margin-bottom: 5rem;
          box-shadow: 0 15px 35px rgba(255,107,139,0.15);
        }

        .trust-inner {
          max-width: 700px;
          margin: 0 auto;
        }

        .trust-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.3rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }

        .trust-banner h2 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .trust-banner p {
          font-size: 1.05rem;
          line-height: 1.6;
          opacity: 0.9;
        }

        .landing-footer {
          text-align: center;
          padding: 2.5rem 0;
          color: #7F8C8D;
          font-size: 0.85rem;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        /* Animations */
        @keyframes morph {
          0%, 100% { border-radius: 50%; }
          50% { border-radius: 40% 60% 60% 40% / 50% 40% 60% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounceBubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
