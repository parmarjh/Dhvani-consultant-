import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, X, Menu, Send, Database } from 'lucide-react';

const Github = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
  </svg>
);

const Linkedin = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// Supabase REST API Client
const supabaseClient = {
  async insertSubscriber(email) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: email,
          created_at: new Date().toISOString(),
          status: 'active',
          source: 'product_launch'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to subscribe');
      }
      return await response.json();
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  },

  async getSubscriberCount() {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/subscribers?select=count()`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch count');
      const data = await response.json();
      return data[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
      return 0;
    }
  },

  async checkEmailExists(email) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to check email');
      const data = await response.json();
      return data.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }
};

const ProductLaunchPage = () => {
  // State Management
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Load subscriber count from Supabase on mount
  useEffect(() => {
    const loadCount = async () => {
      const count = await supabaseClient.getSubscriberCount();
      setTotalCount(count);
    };
    loadCount();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const updateCountdown = () => {
      const launchDate = new Date();
      launchDate.setDate(launchDate.getDate() + 30);
      const distance = launchDate.getTime() - new Date().getTime();

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle email signup
  const onSubscribe = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const exists = await supabaseClient.checkEmailExists(email);
      if (exists) {
        setError('This email is already subscribed');
        setLoading(false);
        return;
      }

      await supabaseClient.insertSubscriber(email);
      setTotalCount(totalCount + 1);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navbar
  const Navbar = () => (
    <nav style={{
      background: 'rgba(13, 27, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{
          margin: 0,
          background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '24px',
          fontWeight: 700
        }}>
          Dhvani Consultant AT
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
          background: 'none',
          border: 'none',
          color: '#00d4ff',
          cursor: 'pointer',
          fontSize: '24px'
        }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );

  // Hero Section
  const HeroSection = () => (
    <section style={{
      background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95) 0%, rgba(16, 34, 54, 0.9) 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '4rem 1rem'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '50px',
            padding: '8px 16px',
            marginBottom: '1.5rem',
            fontSize: '12px',
            fontWeight: 600,
            color: '#00d4ff',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            🚀 Coming Soon
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #00d4ff 0%, #00a8cc 50%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            The Future of Talent Matching
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 2rem 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Revolutionary AI-powered hiring platform connecting top talent with innovative companies.
          </p>
        </div>

        {/* Countdown Timer */}
        <div style={{
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          maxWidth: '700px',
          margin: '0 auto 2rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            margin: '0 0 1.5rem 0',
            fontSize: '16px',
            fontWeight: 600,
            color: '#00d4ff',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Launch In
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 168, 204, 0.05) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                padding: '1.5rem 1rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  {String(item.value).padStart(2, '0')}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 500
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Signup Form */}
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <form onSubmit={onSubscribe}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(0, 212, 255, 0.5)' : 'linear-gradient(135deg, #00d4ff, #00a8cc)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.2s',
                  whiteSpace: 'nowrap',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Notify Me
                  </>
                )}
              </button>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '6px',
                color: '#ff6b6b',
                fontSize: '12px',
                marginBottom: '12px'
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {subscribed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '6px',
                color: '#00d4ff',
                fontSize: '12px'
              }}>
                <Check size={16} /> Successfully subscribed!
              </div>
            )}

            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '12px',
              margin: '12px 0 0 0'
            }}>
              <span style={{ color: '#00d4ff', fontWeight: 600 }}>{totalCount}</span> {totalCount === 1 ? 'person' : 'people'} already waiting
            </p>
          </form>
        </div>
      </div>
    </section>
  );

  // Features Section
  const FeaturesSection = () => (
    <section style={{ padding: '4rem 1rem', background: 'var(--color-background-tertiary)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: '0 0 1rem 0',
            color: 'var(--color-text-primary)'
          }}>
            Why Choose Dhvani Consultant AT?
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { icon: '🤖', title: 'AI-Powered Matching', desc: 'Advanced algorithms match candidates perfectly' },
            { icon: '⚡', title: 'Lightning Fast', desc: 'Get hired in days, not months' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade security' },
            { icon: '💼', title: 'Verified Companies', desc: 'Only authenticated opportunities' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your job search performance' },
            { icon: '🌍', title: 'Global Opportunities', desc: 'Jobs worldwide, including remote' }
          ].map((f, i) => (
            <div key={i} style={{
              background: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: '12px',
              padding: '2rem',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: '0 0 0.5rem 0',
                color: 'var(--color-text-primary)'
              }}>
                {f.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Footer
  const Footer = () => (
    <footer style={{
      background: 'rgba(13, 27, 42, 0.8)',
      borderTop: '1px solid rgba(0, 212, 255, 0.1)',
      padding: '3rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{
          background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '18px',
          fontWeight: 700,
          margin: '0 0 1rem 0'
        }}>
          Dhvani Consultant AT
        </h3>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          margin: '0 0 1rem 0'
        }}>
          © 2024 Dhvani Consultant AT. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="https://github.com/parmarjh" target="_blank" rel="noopener noreferrer" style={{
            color: 'rgba(0, 212, 255, 0.6)',
            cursor: 'pointer'
          }}>
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/jhparmar" target="_blank" rel="noopener noreferrer" style={{
            color: 'rgba(0, 212, 255, 0.6)',
            cursor: 'pointer'
          }}>
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );

  return (
    <div style={{ background: 'var(--color-background-tertiary)', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default ProductLaunchPage;
