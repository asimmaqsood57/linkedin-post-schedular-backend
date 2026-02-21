export const MOCK_JOBS = [
  {
    externalId: 'mock-001',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'London, UK (Hybrid)',
    description:
      'We are looking for a Senior Full Stack Developer to join our growing team. You will work with React, Node.js, TypeScript, and PostgreSQL to build scalable web applications. Experience with AWS and Docker is a plus. You will collaborate with cross-functional teams to deliver high-quality software solutions.',
    url: 'https://example.com/jobs/001',
    salary: '£70k - £90k',
    platform: 'LinkedIn (Mock)',
  },
  {
    externalId: 'mock-002',
    title: 'Backend Engineer (NestJS)',
    company: 'FinTech Innovations Ltd',
    location: 'Manchester, UK (Remote)',
    description:
      'Join our backend team to build robust APIs using NestJS and TypeScript. You will design microservices, work with PostgreSQL and Redis, and ensure high availability. Strong knowledge of REST API design, JWT authentication, and cloud services (AWS/GCP) required.',
    url: 'https://example.com/jobs/002',
    salary: '£60k - £80k',
    platform: 'Indeed (Mock)',
  },
  {
    externalId: 'mock-003',
    title: 'Frontend React Developer',
    company: 'Creative Digital Agency',
    location: 'Birmingham, UK (On-site)',
    description:
      'We need a talented Frontend Developer proficient in React, Next.js, and Tailwind CSS. You will build beautiful, performant user interfaces, work closely with designers, and integrate with RESTful APIs. Experience with Redux or RTK Query is highly desirable.',
    url: 'https://example.com/jobs/003',
    salary: '£50k - £65k',
    platform: 'Glassdoor (Mock)',
  },
  {
    externalId: 'mock-004',
    title: 'DevOps Engineer',
    company: 'CloudFirst Systems',
    location: 'Edinburgh, UK (Hybrid)',
    description:
      'Looking for a DevOps Engineer experienced in AWS, Docker, Kubernetes, and CI/CD pipelines. You will manage infrastructure as code using Terraform, set up monitoring with Prometheus/Grafana, and ensure 99.9% uptime for our production systems.',
    url: 'https://example.com/jobs/004',
    salary: '£65k - £85k',
    platform: 'LinkedIn (Mock)',
  },
  {
    externalId: 'mock-005',
    title: 'AI/ML Engineer',
    company: 'DataDriven AI',
    location: 'Remote, UK',
    description:
      'Exciting opportunity for an AI/ML Engineer to work on cutting-edge language models and recommendation systems. Experience with Python, PyTorch, LLM APIs (OpenAI, Anthropic), and MLOps practices required. You will design and deploy ML pipelines at scale.',
    url: 'https://example.com/jobs/005',
    salary: '£80k - £110k',
    platform: 'Indeed (Mock)',
  },
  {
    externalId: 'mock-006',
    title: 'Product Manager - SaaS',
    company: 'GrowthSaaS Ltd',
    location: 'London, UK (Hybrid)',
    description:
      'We are hiring a Product Manager to own the roadmap for our B2B SaaS platform. You will conduct user research, define product requirements, work with engineering and design teams, and drive growth metrics. 3+ years of PM experience in a tech company required.',
    url: 'https://example.com/jobs/006',
    salary: '£70k - £90k',
    platform: 'Glassdoor (Mock)',
  },
  {
    externalId: 'mock-007',
    title: 'TypeScript Developer',
    company: 'Enterprise Software Co.',
    location: 'Leeds, UK (Remote)',
    description:
      'Join our team as a TypeScript developer building enterprise-grade applications. You will work across frontend (React) and backend (Node.js/NestJS), contribute to architecture decisions, and mentor junior developers. Strong understanding of OOP, design patterns, and testing required.',
    url: 'https://example.com/jobs/007',
    salary: '£55k - £75k',
    platform: 'LinkedIn (Mock)',
  },
  {
    externalId: 'mock-008',
    title: 'Data Engineer',
    company: 'Analytics Corp',
    location: 'Bristol, UK (Hybrid)',
    description:
      'We need a Data Engineer to build and maintain our data pipelines. Experience with Apache Spark, dbt, Airflow, Snowflake or BigQuery required. You will work with data scientists to productionise ML models and ensure data quality across the organisation.',
    url: 'https://example.com/jobs/008',
    salary: '£60k - £80k',
    platform: 'Indeed (Mock)',
  },
];

export function filterMockJobs(keywords: string): typeof MOCK_JOBS {
  if (!keywords.trim()) return MOCK_JOBS;
  const terms = keywords.toLowerCase().split(' ').filter(Boolean);
  return MOCK_JOBS.filter((job) => {
    const text = `${job.title} ${job.company} ${job.description} ${job.platform}`.toLowerCase();
    return terms.some((term) => text.includes(term));
  });
}