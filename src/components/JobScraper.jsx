import React, { useState, useCallback } from 'react';
import { Search, Globe, ExternalLink, RefreshCw, MapPin, DollarSign, Clock, Sparkles } from 'lucide-react';
import { scrapeJobs } from '../resumeNLP';

const SOURCE_COLORS = {
  LinkedIn: { bg: 'rgba(10,102,194,0.1)', color: '#0a66c2', icon: '🔗' },
  Indeed: { bg: 'rgba(44,62,147,0.1)', color: '#2c3e93', icon: '📋' },
  Glassdoor: { bg: 'rgba(12,170,65,0.1)', color: '#0caa41', icon: '🏢' }
};

export default function JobScraper({ parsedResume }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleScrape = useCallback(async () => {
    setIsSearching(true);
    setSearched(false);
    try {
      const scraped = await scrapeJobs(query, location);
      setResults(scraped);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  }, [query, location]);

  const matchColor = (match) => {
    if (match >= 85) return '#10b981';
    if (match >= 70) return '#f59e0b';
    return '#6b7394';
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={28} style={{ color: '#00d4ff' }} /> Job Scraper
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Scrape jobs from LinkedIn, Indeed & Glassdoor. {parsedResume ? 'Results are ranked by your resume match.' : 'Upload a resume in ATS Tracker for personalized matching.'}
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Job Title / Keywords</label>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., React Developer, Data Scientist..."
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Remote, San Francisco..."
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <button onClick={handleScrape} disabled={isSearching} style={{
            background: 'linear-gradient(135deg, #00d4ff, #00a8cc)', color: 'white',
            border: 'none', padding: '10px 24px', borderRadius: 'var(--border-radius-md)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', height: '40px'
          }}>
            {isSearching ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Scraping...</> : <><Search size={15} /> Scrape Jobs</>}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          {Object.entries(SOURCE_COLORS).map(([source, style]) => (
            <span key={source} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: style.color, fontWeight: 500 }}>
              {style.icon} {source}
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      {isSearching && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={32} style={{ color: '#00d4ff', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Scraping job boards...</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
            {['LinkedIn', 'Indeed', 'Glassdoor'].map((s, i) => (
              <span key={s} style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500,
                background: SOURCE_COLORS[s].bg, color: SOURCE_COLORS[s].color,
                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {searched && !isSearching && (
        <>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Found <strong>{results.length}</strong> jobs across 3 platforms
            {parsedResume && ' — ranked by resume match'}
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {results.map((job, idx) => {
              const src = SOURCE_COLORS[job.source] || SOURCE_COLORS.LinkedIn;
              return (
                <div key={idx} style={{
                  background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)', padding: '1.25rem',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center',
                  transition: 'box-shadow 0.2s', cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: src.bg, color: src.color, padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600 }}>
                        {src.icon} {job.source}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {job.posted}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500 }}>{job.title}</h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{job.company}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={12} /> {job.salary}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      border: `3px solid ${matchColor(job.match)}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: matchColor(job.match) }}>{job.match}%</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>Match</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!searched && !isSearching && (
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '3rem', textAlign: 'center' }}>
          <Sparkles size={48} style={{ color: 'var(--color-text-secondary)', opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Enter keywords and click "Scrape Jobs" to search across multiple platforms.</p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
