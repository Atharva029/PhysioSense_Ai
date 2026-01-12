import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Animated background elements */}
      <div className="background-animation">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="landing-navbar">
        <div className="landing-navbar-container">
          <div className="logo-section">
            <div className="logo-icon">AI</div>
            <span className="logo-text">PhysioSense AI</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>Features</a>
            <a href="#how-it-works" className="landing-nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}>How It Works</a>
            <Link to="/login" className="landing-nav-link">Sign In</Link>
            <Link to="/register" className="landing-btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-content">
        <div className="home-hero">
          {/* App Store Buttons */}
          <div className="app-buttons">
            <button className="app-button android-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1349 1.1357L4.8428 5.4835a.4161.4161 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.186.8532 13.0814 0 15.3414h24c-.8535-2.2601-2.6892-4.1553-5.1185-5.02"/>
              </svg>
            </button>
            <button className="app-button ios-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
          </div>

          {/* Main Headline */}
          <h1 className="home-headline">
            One Account.
            <br />
            <span className="headline-highlight">AI + you = PhysioSense AI</span>
            <br />
            Future ready.
          </h1>

          {/* Description */}
          <p className="home-description">
            Access PhysioSense AI with intelligent exercise monitoring. Streamline your recovery 
            with AI-powered real-time feedback and progress tracking.
          </p>

          {/* CTA Button */}
          <Link to="/register" className="home-cta-button">
            Get Started - Free
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>Real-time Monitoring</h3>
              <p>AI-powered computer vision analyzes your exercises in real-time using your webcam</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Form Analysis</h3>
              <p>Detect posture deviations and receive instant feedback on your exercise form</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your recovery progress with detailed analytics and visualizations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>AI Feedback</h3>
              <p>Get personalized feedback and recommendations powered by Google Gemini AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free account and set up your profile</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Select Exercise</h3>
              <p>Choose from our library of physiotherapy exercises</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Start Session</h3>
              <p>Enable your camera and begin your exercise session</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Get Feedback</h3>
              <p>Receive real-time AI analysis and personalized feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Start Your Recovery Journey?</h2>
          <p>Join thousands of users improving their recovery with AI-powered physiotherapy</p>
          <Link to="/register" className="home-cta-button">
            Get Started - Free
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
