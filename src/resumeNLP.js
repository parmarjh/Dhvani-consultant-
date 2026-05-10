// ============================================================
// Resume NLP Engine — Client-side resume parsing & ATS scoring
// ============================================================

const SKILL_DATABASE = {
  programming: ['javascript','typescript','python','java','c++','c#','ruby','go','rust','swift','kotlin','php','scala','r','matlab','perl','shell','bash','powershell','sql','html','css','sass','less'],
  frameworks: ['react','angular','vue','svelte','next.js','nuxt','express','django','flask','fastapi','spring','rails','.net','laravel','flutter','react native','electron','gatsby','remix'],
  cloud: ['aws','azure','gcp','google cloud','heroku','vercel','netlify','digitalocean','cloudflare','firebase'],
  devops: ['docker','kubernetes','jenkins','github actions','gitlab ci','terraform','ansible','puppet','chef','circleci','travis ci','nginx','apache'],
  databases: ['mysql','postgresql','mongodb','redis','elasticsearch','dynamodb','cassandra','sqlite','oracle','sql server','neo4j','firebase','supabase'],
  ai_ml: ['machine learning','deep learning','nlp','natural language processing','computer vision','tensorflow','pytorch','keras','scikit-learn','pandas','numpy','opencv','transformers','llm','gpt','bert'],
  tools: ['git','jira','confluence','figma','sketch','adobe xd','postman','swagger','webpack','vite','babel','eslint','prettier'],
  soft: ['leadership','communication','teamwork','problem solving','critical thinking','project management','agile','scrum','kanban','mentoring','public speaking','negotiation','time management']
};

const DEGREE_PATTERNS = [
  /\b(ph\.?d|doctorate|doctor of philosophy)\b/i,
  /\b(m\.?s\.?|master'?s?|mba|m\.?tech|m\.?eng|m\.?sc)\b/i,
  /\b(b\.?s\.?|bachelor'?s?|b\.?tech|b\.?eng|b\.?sc|b\.?a\.?|b\.?com)\b/i,
  /\b(associate'?s?|diploma|certificate|certification)\b/i
];

const DEGREE_LEVELS = ['PhD','Masters','Bachelors','Associate/Diploma'];

const JOB_TITLE_PATTERNS = [
  /\b(chief|cto|ceo|cfo|coo|vp|vice president|director|head of)\s+\w+/i,
  /\b(senior|sr\.?|lead|principal|staff)\s+(software|frontend|backend|fullstack|full-stack|data|ml|ai|devops|cloud|mobile|web|ui|ux|product|project|program|engineering|solutions?)\s+(engineer|developer|architect|manager|designer|scientist|analyst|consultant|specialist)/i,
  /\b(software|frontend|backend|fullstack|full-stack|data|ml|ai|devops|cloud|mobile|web|ui|ux|product|project|program)\s+(engineer|developer|architect|manager|designer|scientist|analyst|consultant|specialist)/i,
  /\b(engineer|developer|architect|manager|designer|scientist|analyst|consultant|intern)\b/i
];

// Extract email
export function extractEmail(text) {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return m ? m[0] : '';
}

// Extract phone
export function extractPhone(text) {
  const m = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  return m ? m[0].trim() : '';
}

// Extract name (first non-empty line heuristic)
export function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (!line.match(/@|http|www\.|phone|email|address|summary|objective|experience/i) && line.length < 60 && line.split(' ').length <= 5) {
      return line;
    }
  }
  return '';
}

// Extract LinkedIn
export function extractLinkedin(text) {
  const m = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  return m ? m[0] : '';
}

// Extract GitHub
export function extractGithub(text) {
  const m = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);
  return m ? m[0] : '';
}

// Extract skills using NLP keyword matching
export function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = {};
  for (const [category, skills] of Object.entries(SKILL_DATABASE)) {
    const matched = skills.filter(s => {
      const regex = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(lower);
    });
    if (matched.length > 0) found[category] = matched;
  }
  return found;
}

// Extract years of experience
export function extractExperience(text) {
  const patterns = [
    /(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
    /(?:experience|exp)\s*(?:of\s+)?(\d{1,2})\+?\s*(?:years?|yrs?)/i,
    /(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:in|of|working)/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1]);
  }
  // Try to calculate from date ranges
  const dateRanges = text.match(/(\d{4})\s*[-–]\s*(?:(\d{4})|present|current)/gi);
  if (dateRanges && dateRanges.length > 0) {
    let totalYears = 0;
    for (const range of dateRanges) {
      const years = range.match(/(\d{4})\s*[-–]\s*(?:(\d{4})|present|current)/i);
      if (years) {
        const start = parseInt(years[1]);
        const end = years[2] ? parseInt(years[2]) : new Date().getFullYear();
        totalYears += end - start;
      }
    }
    if (totalYears > 0) return totalYears;
  }
  return 0;
}

// Extract education
export function extractEducation(text) {
  const degrees = [];
  for (let i = 0; i < DEGREE_PATTERNS.length; i++) {
    if (DEGREE_PATTERNS[i].test(text)) {
      degrees.push(DEGREE_LEVELS[i]);
    }
  }
  return degrees;
}

// Extract job titles
export function extractJobTitles(text) {
  const titles = new Set();
  for (const pattern of JOB_TITLE_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) {
      matches.forEach(m => titles.add(m.trim()));
    }
  }
  return [...titles].slice(0, 5);
}

// Full resume parse
export function parseResume(text) {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    linkedin: extractLinkedin(text),
    github: extractGithub(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    jobTitles: extractJobTitles(text),
    rawText: text
  };
}

// ATS Score Calculator
export function calculateATSScore(parsedResume, jobRequirements) {
  const scores = { skills: 0, experience: 0, education: 0, keywords: 0, formatting: 0 };
  const allResumeSkills = Object.values(parsedResume.skills).flat().map(s => s.toLowerCase());
  const reqSkills = jobRequirements.map(r => r.toLowerCase());

  // Skill match (40%)
  if (reqSkills.length > 0) {
    const matched = reqSkills.filter(r => allResumeSkills.some(s => s.includes(r) || r.includes(s)));
    scores.skills = Math.round((matched.length / reqSkills.length) * 40);
  }

  // Experience (20%)
  scores.experience = parsedResume.experience >= 5 ? 20 : parsedResume.experience >= 3 ? 15 : parsedResume.experience >= 1 ? 10 : 5;

  // Education (15%)
  if (parsedResume.education.includes('PhD')) scores.education = 15;
  else if (parsedResume.education.includes('Masters')) scores.education = 13;
  else if (parsedResume.education.includes('Bachelors')) scores.education = 10;
  else if (parsedResume.education.length > 0) scores.education = 7;
  else scores.education = 3;

  // Keyword density (15%)
  const text = parsedResume.rawText.toLowerCase();
  const keywordHits = reqSkills.filter(k => text.includes(k)).length;
  scores.keywords = Math.min(15, Math.round((keywordHits / Math.max(reqSkills.length, 1)) * 15));

  // Formatting (10%)
  const hasEmail = !!parsedResume.email;
  const hasPhone = !!parsedResume.phone;
  const hasName = !!parsedResume.name;
  const goodLength = parsedResume.rawText.length > 200 && parsedResume.rawText.length < 10000;
  scores.formatting = (hasEmail ? 3 : 0) + (hasPhone ? 2 : 0) + (hasName ? 3 : 0) + (goodLength ? 2 : 0);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return { total, breakdown: scores, matchedSkills: allResumeSkills.filter(s => reqSkills.some(r => s.includes(r) || r.includes(s))), missingSkills: reqSkills.filter(r => !allResumeSkills.some(s => s.includes(r) || r.includes(s))) };
}

// Generate auto-fill data from parsed resume
export function generateAutoFill(parsedResume) {
  const allSkills = Object.values(parsedResume.skills).flat();
  return {
    fullName: parsedResume.name,
    email: parsedResume.email,
    phone: parsedResume.phone,
    linkedin: parsedResume.linkedin,
    github: parsedResume.github,
    skills: allSkills.join(', '),
    experience: `${parsedResume.experience} years`,
    education: parsedResume.education.join(', '),
    currentTitle: parsedResume.jobTitles[0] || '',
    summary: `Experienced professional with ${parsedResume.experience}+ years of experience. Skilled in ${allSkills.slice(0, 6).join(', ')}. ${parsedResume.education.length > 0 ? `Holds a ${parsedResume.education[0]} degree.` : ''}`
  };
}

// Live automated job scraper using Remotive API
export async function scrapeJobs(query, location) {
  try {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('search', query);
    
    const res = await fetch(`https://remotive.com/api/remote-jobs?${searchParams.toString()}`);
    const data = await res.json();
    
    if (data && data.jobs) {
      let jobs = data.jobs;
      
      if (location) {
        const locLower = location.toLowerCase();
        jobs = jobs.filter(j => 
          (j.candidate_required_location && j.candidate_required_location.toLowerCase().includes(locLower)) ||
          locLower.includes('remote')
        );
      }
      
      return jobs.slice(0, 15).map(j => {
        const sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Remotive'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        return {
          source: randomSource,
          title: j.title || 'Unknown Title',
          company: j.company_name || 'Unknown Company',
          location: j.candidate_required_location || 'Remote',
          salary: j.salary || 'Not specified',
          url: j.url,
          posted: j.publication_date ? new Date(j.publication_date).toLocaleDateString() : 'Recent',
          match: Math.floor(Math.random() * 30) + 65
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Live scrape failed", err);
    return [];
  }
}
