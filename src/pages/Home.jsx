import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = localStorage.getItem('first_name');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const passwordChanged = location.state?.passwordChanged ?? false;
  const shouldShowLoginModal = location.state?.showLoginModal ?? false;

  console.log(passwordChanged);
  useEffect(() => {
    if (passwordChanged || shouldShowLoginModal) {
      setShowLoginModal(true);
      // Clear the state from history to prevent it from showing again
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [passwordChanged, shouldShowLoginModal]);

  const handleGetStarted = () => {
    if (firstName) navigate('/LSM');
    else setShowLoginModal(true);
  };

  const go = (path) => () => {
    if(!firstName){
      setShowLoginModal(true);
      return;
    }
    else {
      navigate(path);
    }
    
  }; 

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="home">
      <header className="home-hero">
        <div className="home-hero__content">
          <h1 className="home-hero__title">AgroHarvest</h1>
          <p className="home-hero__subtitle">
            AI-powered insights for smarter farming decisions: recommend crops, predict yield,
            plan irrigation and optimize fertilizers — all in one place.
          </p>
          <div className="home-hero__actions">
            <button className="btn btn-primary z-10" onClick={handleGetStarted}>Get Started</button>
             {firstName && (
            <button className="btn btn-outline" onClick={go('/mylands')}>View Predictions</button>
             )}
          </div>
          {firstName && (
            <p className="home-hero__welcome">Welcome back, {firstName}!</p>
          )}
        </div>
        <div className="home-hero__bg" aria-hidden="true">
          <svg viewBox="0 0 600 300" preserveAspectRatio="none" className="hero-wave">
            <defs>
              <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <path fill="url(#grad)" d="M0 200 Q 150 120 300 200 T 600 200 L 600 300 L 0 300 Z" />
          </svg>
        </div>
      </header>

      <main className="home-main">
        <section className="features" aria-labelledby="features-title">
          <h2 id="features-title" className="section-title">What You Can Do</h2>
          <div className="features-grid">
            <FeatureCard title="Crop Recommendation" description="Get the best crop suggestions for your land based on soil, weather and season." onClick={go('/crs')}>
              <IconCrop />
            </FeatureCard>
            <FeatureCard title="Yield Prediction" description="Estimate expected yields for different crops to plan investments confidently." onClick={go('/cys')}>
              <IconYield />
            </FeatureCard>
            <FeatureCard title="Fertilizer Optimization" description="Optimize fertilizer type and quantity to maximize output and reduce cost." onClick={go('/fertilizer')}>
              <IconFertilizer />
            </FeatureCard>
            <FeatureCard title="Irrigation Planner" description="Plan irrigation schedules using local weather and crop requirements." onClick={go('/irrigation')}>
              <IconIrrigation />
            </FeatureCard>
            <FeatureCard title="Map Your Land" description="Draw and save your land boundaries to keep predictions precise." onClick={go('/LSM')}>
              <IconMap />
            </FeatureCard>
            <FeatureCard title="Prediction History" description="Review, compare and export all your past predictions in one place." onClick={go('/mylands')}>
              <IconHistory />
            </FeatureCard>
          </div>
        </section>

        <section className="workflow" aria-labelledby="workflow-title">
          <h2 id="workflow-title" className="section-title">How It Works</h2>
          <div className="workflow-steps">
            <StepCard title="Map Your Land" description="Mark your field on the map or select an existing saved land.">
              <IconMap />
            </StepCard>
            <StepCard title="Enter Conditions" description="Provide soil, season and local details or let us auto-fetch weather.">
              <IconInputs />
            </StepCard>
            <StepCard title="Get Predictions" description="Receive crop, yield, irrigation and fertilizer recommendations instantly.">
              <IconLightning />
            </StepCard>
            <StepCard title="Act & Review" description="Export, share and revisit results in your prediction history.">
              <IconHistory />
            </StepCard>
          </div>
        </section>

        <section className="tech" aria-labelledby="tech-title">
          <h2 id="tech-title" className="section-title">Tech Stack</h2>
          <div className="tech-grid" role="list">
            <TechItem title="Backend" detail="Django REST Framework">
              <IconServer />
            </TechItem>
            <TechItem title="Frontend" detail="React + Vite">
              <IconReact />
            </TechItem>
            <TechItem title="Database" detail="PostgreSQL">
              <IconDatabase />
            </TechItem>
            <TechItem title="Auth" detail="Google OAuth">
              <IconShield />
            </TechItem>
            <TechItem title="Machine Learning" detail="Random Forest • 98% AUC">
              <IconML />
            </TechItem>
            <TechItem title="Weather" detail="WeatherAPI">
              <IconCloud />
            </TechItem>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="footer-brand">
            <h3 className="footer-brand__title">AgroHarvest</h3>
            <p className="footer-brand__tagline">AI-powered farming intelligence</p>
          </div>
          <div className="footer-contact">
            <h4 className="footer-contact__title">Get in Touch</h4>
            <div className="footer-contact__items">
              <a href="mailto:vijayanand.15012003@gmail.com" className="footer-contact__link">
                <IconEmail />
                <span>vijayanand.15012003@gmail.com</span>
              </a>
              <a href="tel:9360120524" className="footer-contact__link">
                <IconPhone />
                <span>+91 93601 20524</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} AgroHarvest. Built with passion for agriculture.</p>
          <div className="footer-badge">Made by Vijay Anand</div>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal onClose={handleCloseModals} onSwitchToRegister={handleSwitchToRegister} />
      )}
      {showRegisterModal && (
        <RegisterModal onClose={handleCloseModals} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
};

const FeatureCard = ({ title, description, onClick, children }) => (
  <button className="feature-card" onClick={onClick} aria-label={title}>
    <div className="feature-card__icon" aria-hidden="true">{children}</div>
    <div className="feature-card__content">
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{description}</p>
    </div>
  </button>
);

const StepCard = ({ title, description, children }) => (
  <div className="step-card">
    <div className="step-card__icon" aria-hidden="true">{children}</div>
    <div>
      <h3 className="step-card__title">{title}</h3>
      <p className="step-card__desc">{description}</p>
    </div>
  </div>
);

// Inline SVG icons (no external images)
const IconCrop = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18M7 8c0 5 5 5 5 10M17 8c0 5-5 5-5 10" />
  </svg>
);

const IconYield = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M21 21H3" />
  </svg>
);

const TechItem = ({ title, detail, children }) => (
  <div className="tech-item" role="listitem">
    <div className="tech-icon" aria-hidden="true">{children}</div>
    <div className="tech-content">
      <div className="tech-title">{title}</div>
      <div className="tech-detail">{detail}</div>
    </div>
  </div>
);

// Tech icons
const IconServer = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="6" rx="2" />
    <rect x="3" y="14" width="18" height="6" rx="2" />
    <circle cx="8" cy="7" r="1" />
    <circle cx="8" cy="17" r="1" />
  </svg>
);

const IconReact = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="12" r="1.6" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>
  </svg>
);

const IconDatabase = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconML = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const IconCloud = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 17a4 4 0 00-3.5-3.96A5.5 5.5 0 006 13.5 3.5 3.5 0 006 20h12a2 2 0 002-2z" />
  </svg>
);

const IconFertilizer = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="3" width="12" height="18" rx="3" />
    <path d="M9 9h6M9 13h6" />
  </svg>
);

const IconIrrigation = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v6M7 6l5 4 5-4M6 14c2 0 3 1 6 1s4-1 6-1" />
  </svg>
);

const IconMap = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconHistory = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 8v5l3 2" />
    <path d="M21 12a9 9 0 10-18 0 9 9 0 0018 0z" />
  </svg>
);

const IconInputs = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="4" rx="1" />
    <rect x="3" y="11" width="12" height="4" rx="1" />
    <rect x="3" y="17" width="8" height="4" rx="1" />
  </svg>
);

const IconLightning = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 3L4 14h7l-1 7 10-13h-7l0-5z" />
  </svg>
);

const IconEmail = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

export default HomePage;
