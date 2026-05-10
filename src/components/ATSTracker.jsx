import React, { useState, useCallback } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, TrendingUp, Zap, Target, Award, BarChart3, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { parseResume, calculateATSScore, generateAutoFill } from '../resumeNLP';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

const SAMPLE_RESUME = `John Doe
john.doe@gmail.com | +1-555-123-4567
linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Senior Software Engineer with 6+ years of experience building scalable web applications.
Proficient in React, TypeScript, Node.js, Python, and cloud technologies.

EXPERIENCE
Senior Software Engineer — TechCorp Inc. (2021 - Present)
• Led frontend architecture migration to React and TypeScript
• Built microservices with Node.js and Express on AWS
• Mentored team of 5 junior developers
• Implemented CI/CD pipelines using GitHub Actions and Docker

Software Engineer — StartupHub (2019 - 2021)
• Developed full-stack features using React, Python Django
• Managed PostgreSQL and Redis databases
• Integrated machine learning models for recommendation engine

Junior Developer — WebAgency (2017 - 2019)
• Built responsive websites using HTML, CSS, JavaScript
• Worked with Git, Jira for project management

EDUCATION
M.S. Computer Science — Stanford University (2017)
B.Tech Computer Engineering — IIT Delhi (2015)

SKILLS
React, TypeScript, JavaScript, Python, Node.js, Express, Django,
AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Redis,
Machine Learning, Git, Agile, Scrum, Leadership, Communication`;

export default function ATSTracker({ onAutoFill, jobs }) {
  const [resumeText, setResumeText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [atsResults, setAtsResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('paste'); // paste | results | autofill
  const [linkInput, setLinkInput] = useState('');
  const [isScrapingLink, setIsScrapingLink] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = parseResume(resumeText);
      setParsed(result);
      // Score against all available jobs
      const scores = (jobs || []).map(job => ({
        job,
        ...calculateATSScore(result, job.requirements || [])
      }));
      scores.sort((a, b) => b.total - a.total);
      setAtsResults(scores);
      setActiveTab('results');
      setIsAnalyzing(false);
    }, 1200);
  }, [resumeText, jobs]);

  const handleAutoFill = useCallback(() => {
    if (!parsed) return;
    const fillData = generateAutoFill(parsed);
    if (onAutoFill) onAutoFill(fillData);
    setActiveTab('autofill');
  }, [parsed, onAutoFill]);

  const loadSample = () => {
    setResumeText(SAMPLE_RESUME);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        setResumeText(fullText);
      } catch (err) {
        console.error(err);
        alert("Failed to parse PDF.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setResumeText(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleLinkScrape = async () => {
    if (!linkInput.trim()) return;
    setIsScrapingLink(true);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(linkInput)}`);
      const data = await response.json();
      if (data.contents) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data.contents;
        
        ['script', 'style', 'nav', 'footer', 'iframe'].forEach(tag => {
          const els = tempDiv.getElementsByTagName(tag);
          let i = els.length;
          while (i--) { els[i].parentNode.removeChild(els[i]); }
        });
        
        setResumeText(tempDiv.textContent.replace(/\s+/g, ' ').trim() || "");
      } else {
        alert("Failed to scrape link content.");
      }
    } catch (err) {
      console.error(err);
      alert("Error scraping link.");
    } finally {
      setIsScrapingLink(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const scoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Target size={28} style={{ color: '#00d4ff' }} /> ATS Resume Tracker
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Paste your resume below to get ATS compatibility scores, NLP-powered skill extraction, and auto-fill your applications.
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'paste', label: 'Upload Resume', icon: <Upload size={14} /> },
          { id: 'results', label: 'ATS Scores', icon: <BarChart3 size={14} /> },
          { id: 'autofill', label: 'Auto Fill', icon: <Zap size={14} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: 'var(--border-radius-sm)',
            border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            background: activeTab === tab.id ? 'var(--color-background-primary)' : 'transparent',
            color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>Paste Your Resume</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{
                  background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)',
                  border: '0.5px solid var(--color-border-tertiary)', padding: '4px 10px', borderRadius: 'var(--border-radius-sm)',
                  fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Upload size={12} /> Upload File
                  <input type="file" accept=".txt,.pdf,.csv,.tex,.latex" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button onClick={loadSample} style={{
                  background: 'var(--color-background-info)', color: 'var(--color-text-info)',
                  border: 'none', padding: '4px 10px', borderRadius: 'var(--border-radius-sm)',
                  fontSize: '11px', fontWeight: 500, cursor: 'pointer'
                }}>Load Sample</button>
              </div>
            </div>
            
            {/* Link Scrape Input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <LinkIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input 
                  type="text" 
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Or enter a web link to scrape (e.g., personal site, online resume)..."
                  style={{ width: '100%', padding: '10px 10px 10px 32px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
              <button onClick={handleLinkScrape} disabled={!linkInput.trim() || isScrapingLink} style={{
                background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)',
                padding: '0 16px', borderRadius: 'var(--border-radius-md)', fontSize: '12px', fontWeight: 500, cursor: (linkInput.trim() && !isScrapingLink) ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                {isScrapingLink ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Scrape Link'}
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              style={{
                width: '100%', minHeight: '400px', padding: '12px',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)', fontSize: '13px',
                fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
            <button onClick={handleAnalyze} disabled={!resumeText.trim() || isAnalyzing} style={{
              width: '100%', marginTop: '12px', padding: '12px',
              background: resumeText.trim() ? 'linear-gradient(135deg, #00d4ff, #00a8cc)' : '#ccc',
              color: 'white', border: 'none', borderRadius: 'var(--border-radius-md)',
              fontSize: '14px', fontWeight: 500, cursor: resumeText.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {isAnalyzing ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><TrendingUp size={16} /> Analyze Resume</>}
            </button>
          </div>

          {/* Live Preview */}
          <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 500 }}>
              {parsed ? '✅ Parsed Data (NLP)' : '📋 Live Preview'}
            </h3>
            {parsed ? (
              <div style={{ fontSize: '13px' }}>
                <InfoRow label="Name" value={parsed.name || '—'} />
                <InfoRow label="Email" value={parsed.email || '—'} />
                <InfoRow label="Phone" value={parsed.phone || '—'} />
                <InfoRow label="LinkedIn" value={parsed.linkedin || '—'} />
                <InfoRow label="GitHub" value={parsed.github || '—'} />
                <InfoRow label="Experience" value={parsed.experience ? `${parsed.experience} years` : '—'} />
                <InfoRow label="Education" value={parsed.education.join(', ') || '—'} />
                <InfoRow label="Job Titles" value={parsed.jobTitles.join(', ') || '—'} />
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontWeight: 500, marginBottom: '8px' }}>Extracted Skills:</p>
                  {Object.entries(parsed.skills).map(([cat, skills]) => (
                    <div key={cat} style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{cat}</span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {skills.map((s, i) => (
                          <span key={i} style={{
                            background: 'var(--color-background-info)', color: 'var(--color-text-info)',
                            padding: '2px 8px', borderRadius: '999px', fontSize: '11px'
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textAlign: 'center', padding: '3rem 1rem' }}>
                <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                <p>Paste your resume on the left and click "Analyze Resume" to see NLP-extracted data here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATS Results Tab */}
      {activeTab === 'results' && (
        <div>
          {atsResults.length === 0 ? (
            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '3rem', textAlign: 'center' }}>
              <BarChart3 size={48} style={{ color: 'var(--color-text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>No results yet. Upload and analyze your resume first.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                <button onClick={handleAutoFill} style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white',
                  border: 'none', padding: '10px 20px', borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Zap size={15} /> Auto-Fill Applications
                </button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {atsResults.map((r, idx) => (
                  <div key={idx} style={{
                    background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-lg)', padding: '1.25rem',
                    display: 'grid', gridTemplateColumns: '100px 1fr 200px', gap: '1.5rem', alignItems: 'center'
                  }}>
                    {/* Score Circle */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        border: `4px solid ${scoreColor(r.total)}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto'
                      }}>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: scoreColor(r.total) }}>{r.total}</span>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>/100</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: scoreColor(r.total), marginTop: '4px', display: 'block' }}>{scoreLabel(r.total)}</span>
                    </div>
                    {/* Job Info */}
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500 }}>{r.job.title}</h3>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{r.job.company} · {r.job.location}</p>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {r.matchedSkills.map((s, i) => (
                          <span key={i} style={{ background: 'var(--color-background-success)', color: 'var(--color-text-success)', padding: '2px 8px', borderRadius: '999px', fontSize: '10px' }}>✓ {s}</span>
                        ))}
                        {r.missingSkills.map((s, i) => (
                          <span key={`m-${i}`} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '999px', fontSize: '10px' }}>✗ {s}</span>
                        ))}
                      </div>
                    </div>
                    {/* Breakdown */}
                    <div style={{ fontSize: '11px' }}>
                      {Object.entries(r.breakdown).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{k}</span>
                          <span style={{ fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Auto Fill Tab */}
      {activeTab === 'autofill' && (
        <AutoFillPreview parsed={parsed} onAutoFill={onAutoFill} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 400, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function AutoFillPreview({ parsed, onAutoFill }) {
  if (!parsed) {
    return (
      <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '3rem', textAlign: 'center' }}>
        <Zap size={48} style={{ color: 'var(--color-text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Analyze a resume first to preview auto-fill data.</p>
      </div>
    );
  }

  const fillData = generateAutoFill(parsed);

  return (
    <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: '#8b5cf6' }} /> Auto-Fill Preview
        </h3>
        <span style={{ background: 'var(--color-background-success)', color: 'var(--color-text-success)', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500 }}>
          Ready to fill
        </span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        These fields will be auto-populated when you apply to any job. Click "Apply" on any job card to see it in action.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {Object.entries(fillData).map(([key, value]) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
            <div style={{
              padding: '10px 12px', background: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius-md)', fontSize: '13px',
              border: '0.5px solid var(--color-border-tertiary)',
              minHeight: key === 'summary' ? '60px' : 'auto'
            }}>
              {value || <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Not detected</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
