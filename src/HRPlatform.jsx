import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, Clock, Star, 
  Send, Plus, Menu, X, LogOut, LogIn, User, Home, 
  FileText, Building2, CheckCircle, AlertCircle, TrendingUp,
  Target, Globe, Zap
} from 'lucide-react';
import ATSTracker from './components/ATSTracker';
import JobScraper from './components/JobScraper';

const HRPlatform = () => {
  // Authentication State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, signup, company-signup

  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ATS & Auto-fill State
  const [parsedResume, setParsedResume] = useState(null);
  const [autoFillData, setAutoFillData] = useState(null);

  const handleAutoFill = useCallback((fillData) => {
    setAutoFillData(fillData);
  }, []);

  // Job Management State
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      logo: '🚀',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time',
      category: 'Engineering',
      experience: '5+ years',
      postedDate: '2 days ago',
      applications: 45,
      description: 'Looking for an experienced React developer to join our growing team. Work on cutting-edge projects using modern web technologies.',
      requirements: ['React', 'TypeScript', 'Node.js', 'AWS'],
      benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options']
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'StartupHub',
      logo: '⚡',
      location: 'New York, NY',
      salary: '$100k - $140k',
      type: 'Full-time',
      category: 'Product',
      experience: '3+ years',
      postedDate: '5 days ago',
      applications: 28,
      description: 'Lead product strategy and development for our innovative SaaS platform.',
      requirements: ['Product Strategy', 'Analytics', 'User Research', 'SQL'],
      benefits: ['Flexible Hours', 'Equity', 'Professional Development', 'Wellness']
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      logo: '🎨',
      location: 'Austin, TX',
      salary: '$90k - $130k',
      type: 'Full-time',
      category: 'Design',
      experience: '2+ years',
      postedDate: '1 week ago',
      applications: 62,
      description: 'Create beautiful and intuitive user experiences for our design-focused products.',
      requirements: ['Figma', 'User Research', 'Prototyping', 'Web Design'],
      benefits: ['Creative Freedom', 'Remote Work', 'Learning Budget', 'Team Outings']
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'AI Solutions',
      logo: '🤖',
      location: 'Boston, MA',
      salary: '$130k - $180k',
      type: 'Full-time',
      category: 'Data',
      experience: '4+ years',
      postedDate: '3 days ago',
      applications: 35,
      description: 'Work on machine learning models and data analytics to drive business decisions.',
      requirements: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      benefits: ['Research Opportunities', 'GPU Resources', 'Conferences', 'Health Plan']
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudTech',
      logo: '☁️',
      location: 'Remote',
      salary: '$110k - $155k',
      type: 'Full-time',
      category: 'Engineering',
      experience: '3+ years',
      postedDate: '4 days ago',
      applications: 41,
      description: 'Build and maintain our cloud infrastructure, ensuring reliability and performance.',
      requirements: ['Kubernetes', 'Docker', 'AWS/GCP', 'CI/CD'],
      benefits: ['Full Remote', 'DevOps Budget', 'Conference Allowance', 'Flexible Schedule']
    },
    {
      id: 6,
      title: 'Marketing Manager',
      company: 'GrowthCo',
      logo: '📈',
      location: 'Los Angeles, CA',
      salary: '$85k - $120k',
      type: 'Full-time',
      category: 'Marketing',
      experience: '2+ years',
      postedDate: '6 days ago',
      applications: 19,
      description: 'Lead marketing initiatives and campaigns to grow our user base.',
      requirements: ['Content Marketing', 'Analytics', 'Campaign Management', 'Social Media'],
      benefits: ['Marketing Budget', 'Tools', 'Flexible Work', 'Professional Growth']
    }
  ]);

  // Job Filter State
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    salary: '',
    type: '',
    category: ''
  });

  // Selected Job
  const [selectedJob, setSelectedJob] = useState(null);

  // Applications State
  const [applications, setApplications] = useState([]);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    skills: '',
    experience: '',
    resume: '',
    coverLetter: ''
  });

  // Watch autoFillData to pre-populate form
  useEffect(() => {
    if (autoFillData) {
      setApplicationForm(prev => ({
        ...prev,
        fullName: autoFillData.fullName || prev.fullName,
        email: autoFillData.email || prev.email,
        phone: autoFillData.phone || prev.phone,
        linkedin: autoFillData.linkedin || prev.linkedin,
        skills: autoFillData.skills || prev.skills,
        experience: autoFillData.experience || prev.experience,
      }));
    }
  }, [autoFillData]);

  // Search Results
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         job.company.toLowerCase().includes(filters.search.toLowerCase());
      const matchLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchType = !filters.type || job.type === filters.type;
      const matchCategory = !filters.category || job.category === filters.category;
      return matchSearch && matchLocation && matchType && matchCategory;
    });
  }, [jobs, filters]);

  // Apply for Job
  const handleApply = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const application = {
      id: Date.now(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      company: selectedJob.company,
      appliedDate: new Date().toLocaleDateString(),
      status: 'pending',
      ...applicationForm
    };
    setApplications([...applications, application]);
    setApplicationForm({ fullName: '', email: '', phone: '', linkedin: '', skills: '', experience: '', resume: '', coverLetter: '' });
    setSelectedJob(null);
    alert('Application submitted successfully!');
  };

  // Post Job Handler
  const handlePostJob = (e) => {
    e.preventDefault();
    alert('Job posting feature - redirect to job creation form');
  };

  // Login/Signup Handler
  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const role = e.target.role?.value || 'jobseeker';
    setUser({ email, role, name: email.split('@')[0] });
    setShowAuthModal(false);
    setAuthMode('login');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  // Auth Modal Component
  const AuthModal = () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>
            {authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Create Account' : 'Company Registration'}
          </h2>
          <button onClick={() => setShowAuthModal(false)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            color: 'var(--color-text-secondary)'
          }}>✕</button>
        </div>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500 }}>Email</label>
            <input type="email" name="email" placeholder="your@email.com" required style={{
              width: '100%',
              padding: '0.75rem',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} />
          </div>

          {(authMode === 'signup' || authMode === 'company-signup') && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500 }}>Password</label>
              <input type="password" name="password" placeholder="••••••" required style={{
                width: '100%',
                padding: '0.75rem',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }} />
            </div>
          )}

          {(authMode === 'signup' || authMode === 'company-signup') && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500 }}>
                Account Type
              </label>
              <select name="role" style={{
                width: '100%',
                padding: '0.75rem',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}>
                <option value="jobseeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
                <option value="company">Company</option>
              </select>
            </div>
          )}

          <button type="submit" style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '1rem'
          }}>
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setAuthMode('signup')} style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                cursor: 'pointer',
                fontWeight: 500
              }}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                cursor: 'pointer',
                fontWeight: 500
              }}>Log in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Job Card Component
  const JobCard = ({ job }) => (
    <div onClick={() => setSelectedJob(job)} style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '1.25rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      hover: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
    }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          fontSize: '28px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius-md)'
        }}>
          {job.logo}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 500 }}>{job.title}</h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>{job.company}</p>
        </div>
        <span style={{
          background: 'var(--color-background-info)',
          color: 'var(--color-text-info)',
          padding: '4px 12px',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '12px',
          fontWeight: 500,
          whiteSpace: 'nowrap'
        }}>
          {job.type}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <MapPin size={16} /> {job.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <DollarSign size={16} /> {job.salary}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <Briefcase size={16} /> {job.experience}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <Clock size={16} /> {job.postedDate}
        </div>
      </div>

      <div style={{
        borderTop: '0.5px solid var(--color-border-tertiary)',
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {job.applications} applications
        </span>
        <button style={{
          background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
          color: 'white',
          border: 'none',
          padding: '6px 16px',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer'
        }}>
          View Details
        </button>
      </div>
    </div>
  );

  // Job Details Modal Component
  const JobDetailsModal = () => {
    if (!selectedJob) return null;
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '1rem'
      }}>
        <div style={{
          background: 'var(--color-background-primary)',
          borderRadius: 'var(--border-radius-lg)',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '2rem',
            borderBottom: '0.5px solid var(--color-border-tertiary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start'
          }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 500 }}>{selectedJob.title}</h2>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{selectedJob.company}</p>
            </div>
            <button onClick={() => setSelectedJob(null)} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: 'var(--color-text-secondary)'
            }}>✕</button>
          </div>

          <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>KEY DETAILS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Salary Range</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{selectedJob.salary}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Experience</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{selectedJob.experience}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Location</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{selectedJob.location}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Employment Type</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{selectedJob.type}</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>ABOUT THIS ROLE</h3>
              <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>{selectedJob.description}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>REQUIRED SKILLS</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedJob.requirements.map((skill, i) => (
                  <span key={i} style={{
                    background: 'var(--color-background-secondary)',
                    color: 'var(--color-text-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '12px'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>BENEFITS</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-text-primary)' }}>
                {selectedJob.benefits.map((benefit, i) => (
                  <li key={i} style={{ marginBottom: '6px', fontSize: '14px' }}>{benefit}</li>
                ))}
              </ul>
            </div>

            {user ? (
              <div style={{
                background: 'var(--color-background-secondary)',
                padding: '1rem',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: '1rem'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>SUBMIT YOUR APPLICATION</h3>
                {autoFillData && (
                  <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(139,92,246,0.08)', borderRadius: 'var(--border-radius-md)', border: '0.5px solid rgba(139,92,246,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} style={{ color: '#8b5cf6' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>Form Auto-Filled from Resume NLP!</span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Full Name</label>
                    <input type="text" value={applicationForm.fullName} onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})} style={{
                      width: '100%', padding: '8px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box'
                    }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Email Address</label>
                    <input type="email" value={applicationForm.email} onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})} style={{
                      width: '100%', padding: '8px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box'
                    }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Phone Number</label>
                    <input type="text" value={applicationForm.phone} onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})} style={{
                      width: '100%', padding: '8px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box'
                    }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>LinkedIn Profile</label>
                    <input type="text" value={applicationForm.linkedin} onChange={(e) => setApplicationForm({...applicationForm, linkedin: e.target.value})} style={{
                      width: '100%', padding: '8px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box'
                    }} />
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Top Skills</label>
                  <input type="text" value={applicationForm.skills} onChange={(e) => setApplicationForm({...applicationForm, skills: e.target.value})} style={{
                    width: '100%', padding: '8px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box'
                  }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Resume/CV (Upload)</label>
                  <input type="file" onChange={(e) => setApplicationForm({...applicationForm, resume: e.target.value})} style={{
                    width: '100%', padding: '8px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box'
                  }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Cover Letter</label>
                  <textarea value={applicationForm.coverLetter} onChange={(e) => setApplicationForm({...applicationForm, coverLetter: e.target.value})} placeholder="Tell us why you're interested in this role..." style={{
                    width: '100%',
                    padding: '8px',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '12px',
                    minHeight: '100px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }} />
                </div>
              </div>
            ) : null}

            <button onClick={handleApply} style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '1rem'
            }}>
              {user ? 'Submit Application' : 'Sign In to Apply'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Home Page
  const HomePage = () => (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1a1f3a 0%, #16213e 100%)',
        color: 'white',
        padding: '4rem 1rem',
        textAlign: 'center',
        borderRadius: '0 0 var(--border-radius-lg) var(--border-radius-lg)'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 500, margin: '0 0 12px 0' }}>Find Your Next Opportunity</h1>
        <p style={{ fontSize: '16px', color: '#a0aec0', margin: 0, marginBottom: '2rem' }}>Discover amazing job opportunities from companies you love</p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <input
            type="text"
            placeholder="Job title, keyword..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px'
            }}
          />
          <input
            type="text"
            placeholder="City or remote"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px'
            }}
          />
          <button onClick={() => setCurrentPage('jobs')} style={{
            background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Search size={18} /> Search
          </button>
        </div>
      </div>

      <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {[
            { icon: '📊', title: 'Smart Matching', desc: 'AI-powered job recommendations based on your profile' },
            { icon: '🔒', title: 'Secure Platform', desc: 'Your data is protected with enterprise-grade security' },
            { icon: '⚡', title: 'Quick Apply', desc: 'Apply to jobs in seconds with saved profiles' },
            { icon: '📱', title: 'Mobile Ready', desc: 'Browse and apply on the go with our mobile app' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feature.icon}</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500 }}>{feature.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '2rem' }}>Featured Jobs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {jobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
          </div>
          <button onClick={() => setCurrentPage('jobs')} style={{
            background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: '2rem'
          }}>
            View All Jobs
          </button>
        </div>
      </div>
    </div>
  );

  // Jobs Browse Page
  const JobsPage = () => (
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 500, margin: '0 0 1.5rem 0' }}>Browse Jobs</h1>
        
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Search</label>
              <input
                type="text"
                placeholder="Job title, company..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Location</label>
              <input
                type="text"
                placeholder="City or remote"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Job Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Data">Data</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => <JobCard key={job.id} job={job} />)
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>No jobs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  // Company Dashboard
  const CompanyDashboard = () => (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 500, margin: '0 0 1.5rem 0' }}>Company Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--color-background-secondary)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Active Jobs</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 500 }}>{jobs.length}</p>
          </div>
          <div style={{
            background: 'var(--color-background-secondary)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Applications</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 500 }}>{jobs.reduce((a, j) => a + j.applications, 0)}</p>
          </div>
          <div style={{
            background: 'var(--color-background-secondary)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Posted This Month</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 500 }}>6</p>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>Your Job Postings</h2>
          <button onClick={() => setCurrentPage('post-job')} style={{
            background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Plus size={16} /> Post New Job
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Position</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Applications</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Posted</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <td style={{ padding: '12px 0' }}>{job.title}</td>
                  <td style={{ padding: '12px 0' }}>{job.applications}</td>
                  <td style={{ padding: '12px 0' }}>{job.postedDate}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span style={{
                      background: 'var(--color-background-success)',
                      color: 'var(--color-text-success)',
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: '11px'
                    }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Post Job Page
  const PostJobPage = () => (
    <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 500, marginBottom: '2rem' }}>Post a New Job</h1>
      
      <form onSubmit={handlePostJob} style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Job Title</label>
          <input type="text" placeholder="e.g., Senior React Developer" required style={{
            width: '100%',
            padding: '12px',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            boxSizing: 'border-box'
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Job Category</label>
            <select required style={{
              width: '100%',
              padding: '12px',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}>
              <option>Engineering</option>
              <option>Product</option>
              <option>Design</option>
              <option>Data</option>
              <option>Marketing</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Employment Type</label>
            <select required style={{
              width: '100%',
              padding: '12px',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Freelance</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Location</label>
            <input type="text" placeholder="e.g., San Francisco, CA" required style={{
              width: '100%',
              padding: '12px',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Salary Range</label>
            <input type="text" placeholder="e.g., $100k - $150k" required style={{
              width: '100%',
              padding: '12px',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Job Description</label>
          <textarea placeholder="Describe the role, responsibilities, and what you're looking for..." required style={{
            width: '100%',
            padding: '12px',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            minHeight: '150px',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Required Skills</label>
          <input type="text" placeholder="e.g., React, TypeScript, Node.js (comma-separated)" required style={{
            width: '100%',
            padding: '12px',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            boxSizing: 'border-box'
          }} />
        </div>

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer'
        }}>
          Post Job
        </button>
      </form>
    </div>
  );

  // Applications Dashboard
  const ApplicationsPage = () => (
    <div style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 500, marginBottom: '2rem' }}>My Applications</h1>
      
      {applications.length === 0 ? (
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--color-text-secondary)' }} />
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', margin: 0 }}>No applications yet. Start applying to jobs!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {applications.map(app => (
            <div key={app.id} style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 500 }}>{app.jobTitle}</h3>
                <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>Applied on {app.appliedDate}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  background: app.status === 'pending' ? 'var(--color-background-warning)' : 'var(--color-background-success)',
                  color: app.status === 'pending' ? 'var(--color-text-warning)' : 'var(--color-text-success)',
                  padding: '6px 12px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Main Component Render
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)' }}>
      {/* Navigation Bar */}
      <nav style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={() => setCurrentPage('home')} style={{
              background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '20px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}>
              Dhvani Consultant AT
            </button>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              {[
                { id: 'home', label: 'Home', icon: '🏠' },
                { id: 'jobs', label: 'Browse Jobs', icon: '💼' },
                { id: 'ats', label: 'ATS Tracker', icon: '🎯' },
                { id: 'scraper', label: 'Job Scraper', icon: '🌐' },
                { id: 'company', label: 'Dashboard', icon: '🏢' }
              ].map(item => (
                <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: currentPage === item.id ? 500 : 400,
                  color: currentPage === item.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  padding: '6px 12px'
                }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <button onClick={() => setCurrentPage('applications')} style={{
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FileText size={16} /> My Applications
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-background-secondary)'
                }}>
                  <User size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.name}</span>
                </div>
                <button onClick={handleLogout} style={{
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <LogIn size={16} /> Sign In
                </button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{
                  background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <User size={16} /> Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'jobs' && <JobsPage />}
        {currentPage === 'ats' && <ATSTracker onAutoFill={handleAutoFill} jobs={jobs} />}
        {currentPage === 'scraper' && <JobScraper parsedResume={parsedResume} />}
        {currentPage === 'company' && <CompanyDashboard />}
        {currentPage === 'post-job' && <PostJobPage />}
        {currentPage === 'applications' && user && <ApplicationsPage />}
      </div>

      {/* Modals */}
      {showAuthModal && <AuthModal />}
      {selectedJob && <JobDetailsModal />}
    </div>
  );
};

export default HRPlatform;
