# Job Platform

**A modern replacement for reference checks.** Instead of phone calls, employers get structured, bias-resistant candidate profiles built from peer, manager and self-assessments. Candidates stay in control of what is shared.

**Live demo:** [job-platform-zsyc.vercel.app](https://job-platform-zsyc.vercel.app)

## Why it exists

Traditional reference checks are slow, subjective and hard to compare. This platform standardizes the feedback so employers can decide faster and candidates are judged more fairly.

## Features

- **Candidate profiles** built from structured skill evidence and feedback from several reviewers
- **Bias reduction** through standardized rating scales and anonymized feedback
- **Identity verification** with Veriff
- **Sign-in** with Google OAuth and LinkedIn
- **Candidate privacy controls** so candidates can see what is shared and manage their reviewers
- **Employer dashboard** for comparing candidates side by side
- **Payments** with Stripe

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI |
| Forms and validation | React Hook Form, Zod |
| Charts | Recharts |
| Payments | Stripe |
| Backend | JavaScript (Node.js), in the job-portal-backend folder |
| Hosting | Vercel |

## Repository structure

```
.
├── job-platform-frontend/   # Next.js app
├── job-portal-backend/      # API server
├── PROJECT.md               # Product vision and roadmap
├── GOOGLE_OAUTH_SETUP.md
├── LINKEDIN_SETUP.md
├── VERIFF_SETUP.md
└── PRIVACY_CONTROLS_EXPLAINED.md
```

## Getting started

```bash
git clone https://github.com/AqsaAltaf1/Job-platform.git
cd Job-platform/job-platform-frontend
npm install
npm run dev
```

The app runs at http://localhost:3000. See [ENVIRONMENT_SETUP.md](job-platform-frontend/ENVIRONMENT_SETUP.md) for the environment variables you need.

### Third-party setup guides

- [Google OAuth](GOOGLE_OAUTH_SETUP.md)
- [LinkedIn](LINKEDIN_SETUP.md)
- [Veriff identity verification](VERIFF_SETUP.md)
- [Privacy controls](PRIVACY_CONTROLS_EXPLAINED.md)

## Roadmap

See [PROJECT.md](PROJECT.md) for the product plan, including ATS integrations and fairness checks.

## Author

**Aqsa Altaf**: [Portfolio](https://aqsaaltaf.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/aqsa-altaf-295416201/)
