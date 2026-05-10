# 🚀 Dhvani Consultant ATS Platform

An advanced Applicant Tracking System (ATS) and remote job aggregation platform built with React and Vite. It features a completely client-side NLP resume parsing engine, live automated job scraping, and instant application form auto-filling.

![ATS Workflow 3D Diagram](./ats_workflow_3d.png)

## 🌟 Key Features

### 1. 🧠 NLP-Powered Resume Parsing (`ATSTracker.jsx`)
- Supports uploading `.pdf`, `.txt`, `.csv`, and `.tex` resumes directly in the browser using `pdfjs-dist`.
- Scrapes and extracts remote resumes from public web links via a CORS bypass proxy.
- Custom regex-based NLP engine (`resumeNLP.js`) extracts Name, Email, Phone, LinkedIn, GitHub, Years of Experience, Education, and categorizes Top Skills.

### 2. 🎯 ATS Compatibility Scoring
- Scores resumes against job requirements on a strict 100-point scale:
  - **40%** Skill Matching
  - **20%** Years of Experience
  - **15%** Education Level (PhD, Masters, etc.)
  - **15%** Keyword Density
  - **10%** Structural Formatting
- Gives visual breakdown of **Matched vs. Missing Skills**.

### 3. 🌐 Live Job Scraper (`JobScraper.jsx`)
- Automates live job fetching by connecting natively to the **Remotive Remote Jobs API**.
- Bypasses mock data by performing real-time searches across global remote job boards based on your resume's parsed skills or manual keyword search.
- Cross-references parsed resume skills to assign a **Match %** to every live job found.

### 4. ⚡ Auto-Fill Applications
- Eliminates manual typing by utilizing the extracted NLP data.
- Clicking "Auto-Fill Applications" permanently caches the parsed data.
- When applying for any job on the platform, the complex submission form dynamically pre-fills with your Name, Email, Phone, LinkedIn, and Skills.

## 🛠️ Step-by-Step Workflow (How it Works)

1. **Upload or Link Resume**: Navigate to the **ATS Tracker** tab. Click "Upload File" to drop in a PDF, or paste a public web link.
2. **Analyze**: Click "Analyze Resume". The client-side parser reads the text, extracts your PII and technical skills, and transitions you to the scoring dashboard.
3. **Review Scores**: View your ATS compatibility scores against existing local job postings. 
4. **Trigger Auto-Fill**: Click the glowing **"Auto-Fill Applications"** button to cache your parsed data.
5. **Scrape Live Jobs**: Head to the **Job Scraper** tab, enter keywords like "React Developer", and click Scrape. The system will pull live jobs from the Remotive API and rank them by your Resume Match percentage.
6. **Apply in One Click**: Click "View Details" on any job, then "Sign In to Apply". Your entire application form will be completely auto-filled. Just attach a cover letter and hit submit!

## 💻 Tech Stack
- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS (`index.css`) & Lucide-React Icons
- **PDF Processing**: `pdfjs-dist` (local worker integration)
- **Live Data**: Remotive API & AllOrigins Proxy
