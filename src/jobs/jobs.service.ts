// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { ConfigService } from '@nestjs/config';
// import { S3Service } from './s3.service';
// import Groq from 'groq-sdk';
// import axios from 'axios';
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const pdfParse = require('pdf-parse') as (
//   buffer: Buffer,
//   options?: any,
// ) => Promise<{ text: string; numpages: number; info: any }>;
// import { AnalyzeProfileDto } from './dto/analyze-profile.dto';
// import { GenerateEmailDto } from './dto/generate-email.dto';
// import { SaveJobDto } from './dto/save-job.dto';
// import { UpdateCvDto } from './dto/update-cv.dto';
// import { filterMockJobs } from './mock-jobs.data';

// @Injectable()
// export class JobsService {
//   private groq: Groq;

//   private readonly softSkills = new Set([
//     'communication', 'teamwork', 'leadership', 'adaptability',
//     'problem solving', 'creativity', 'time management', 'attention to detail',
//     'critical thinking', 'emotional intelligence', 'public speaking',
//     'digital literacy', 'continuous learning', 'strategic planning',
//     'collaboration', 'organisation', 'organization', 'multitasking',
//     'work ethic', 'interpersonal skills',
//   ]);

//   constructor(
//     private prisma: PrismaService,
//     private configService: ConfigService,
//     private s3Service: S3Service,
//   ) {
//     this.groq = new Groq({
//       apiKey: this.configService.get('GROQ_API_KEY'),
//     });
//   }

//   // ─── CV Upload ─────────────────────────────────────────────

//   async uploadCv(
//     userId: string,
//     fileBuffer: Buffer,
//     fileName: string,
//     mimeType: string,
//   ): Promise<{ key: string; fileName: string; mimeType: string }> {
//     const key = `cvs/${userId}/${Date.now()}-${fileName}`;
//     await this.s3Service.uploadFile(key, fileBuffer, mimeType);
//     console.log(`[uploadCv] Uploaded to S3: ${key}, size=${fileBuffer.length}, mime=${mimeType}`);
//     return { key, fileName, mimeType };
//   }

//   // ─── Delete CV ─────────────────────────────────────────────

//   async deleteCv(userId: string) {
//     const profile = await this.prisma.userProfile.findUnique({
//       where: { userId },
//     });

//     if (!profile?.cvS3Key) {
//       throw new NotFoundException('No CV found to delete');
//     }

//     await this.s3Service.deleteFile(profile.cvS3Key);

//     return this.prisma.userProfile.update({
//       where: { userId },
//       data: {
//         cvS3Key: null,
//         cvFileName: null,
//         cvMimeType: null,
//         cvEditableText: null,
//         cvScore: null,
//         cvFeedback: [],
//       },
//     });
//   }

//   // ─── Extract text from buffer ──────────────────────────────
//   private async extractTextFromBuffer(
//     buffer: Buffer,
//     mimeType: string,
//     fileName: string,
//   ): Promise<string> {
//     const lowerName = fileName.toLowerCase();
//     const isPdf =
//       mimeType === 'application/pdf' ||
//       mimeType === 'application/octet-stream' ||
//       lowerName.endsWith('.pdf');

//     console.log(
//       `[extractText] fileName=${fileName}, mimeType=${mimeType}, isPdf=${isPdf}, bufferSize=${buffer.length}`,
//     );

//     if (isPdf) {
//       // Check PDF magic bytes: %PDF
//       const header = buffer.slice(0, 5).toString('ascii');
//       if (!header.startsWith('%PDF')) {
//         console.warn(`[extractText] Buffer doesn't start with %PDF (got: ${header}). Trying anyway.`);
//       }

//       try {
//         // pdfParse options: disable tests that can cause failures on some PDFs
//         const data = await pdfParse(buffer, {
//           // Disable the internal test files check
//           max: 0,
//         });
//         const text = (data.text || '').trim();
//         console.log(
//           `[extractText] PDF parsed OK. Pages=${data.numpages}, extractedChars=${text.length}`,
//         );
//         if (text.length < 50) {
//           console.warn(`[extractText] Very short PDF text (${text.length} chars) — may be image-based PDF`);
//         }
//         return text;
//       } catch (err: any) {
//         console.error('[extractText] pdf-parse failed:', err?.message || err);

//         // Fallback: try reading as UTF-8 text (some "PDFs" are actually text)
//         const fallback = buffer.toString('utf-8');
//         const printable = fallback.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
//         if (printable.length > 100) {
//           console.log(`[extractText] Fallback text extraction: ${printable.length} chars`);
//           return printable;
//         }
//         return '';
//       }
//     }

//     // Plain text
//     const text = buffer.toString('utf-8').trim();
//     console.log(`[extractText] Plain text: ${text.length} chars`);
//     return text;
//   }

//   // ─── Profile ───────────────────────────────────────────────

//   async getProfile(userId: string) {
//     const profile = await this.prisma.userProfile.findUnique({
//       where: { userId },
//     });

//     if (!profile) return null;

//     let cvDownloadUrl: string | null = null;
//     if (profile.cvS3Key) {
//       try {
//         cvDownloadUrl = await this.s3Service.getSignedDownloadUrl(profile.cvS3Key);
//       } catch {
//         cvDownloadUrl = null;
//       }
//     }

//     return { ...profile, cvDownloadUrl };
//   }

//   async analyzeProfile(dto: AnalyzeProfileDto, userId: string) {
//     const linkedinAccount = await this.prisma.linkedinAccount.findFirst({
//       where: { userId },
//     });

//     const existingProfile = await this.prisma.userProfile.findUnique({
//       where: { userId },
//     });

//     const parts: string[] = [];

//     if (linkedinAccount?.name && !linkedinAccount.name.includes('undefined')) {
//       parts.push(`Name: ${linkedinAccount.name}`);
//     }
//     if (linkedinAccount?.email) {
//       parts.push(`Email: ${linkedinAccount.email}`);
//     }
//     if (dto.linkedinBio?.trim()) {
//       parts.push(`LinkedIn Profile:\n${dto.linkedinBio}`);
//     }

//     // Use newly uploaded key OR fall back to existing profile key
//     const cvKey = dto.cvS3Key || existingProfile?.cvS3Key;
//     const cvFileName = dto.cvFileName || existingProfile?.cvFileName || 'cv.pdf';
//     const cvMimeType = dto.cvMimeType || existingProfile?.cvMimeType || 'application/pdf';

//     let cvText: string | null = null;

//     if (cvKey) {
//       try {
//         console.log(`[analyzeProfile] Fetching CV buffer from S3: ${cvKey}`);
//         const buffer = await this.s3Service.getFileAsBuffer(cvKey);
//         cvText = await this.extractTextFromBuffer(buffer, cvMimeType, cvFileName);

//         if (cvText && cvText.trim().length > 0) {
//           parts.push(`CV / Resume Content:\n${cvText}`);
//           console.log(`[analyzeProfile] CV text ready, ${cvText.length} chars`);
//         } else {
//           console.warn('[analyzeProfile] CV text was empty after extraction');
//           // If we have stored editable text, use that as fallback
//           if (existingProfile?.cvEditableText) {
//             cvText = existingProfile.cvEditableText;
//             parts.push(`CV / Resume Content:\n${cvText}`);
//             console.log('[analyzeProfile] Using stored cvEditableText as fallback');
//           }
//         }
//       } catch (err) {
//         console.error('[analyzeProfile] Failed to fetch/parse CV from S3:', err);
//         // Fallback to stored text
//         if (existingProfile?.cvEditableText) {
//           cvText = existingProfile.cvEditableText;
//           parts.push(`CV / Resume Content:\n${cvText}`);
//           console.log('[analyzeProfile] Using stored cvEditableText after S3 failure');
//         }
//       }
//     }

//     const combinedText = parts.join('\n\n');

//     if (!combinedText.trim()) {
//       throw new NotFoundException(
//         'No profile content found. Please connect LinkedIn or upload a CV.',
//       );
//     }

//     console.log(`[analyzeProfile] Running AI with ${combinedText.length} chars total`);

//     // Run all analyses in parallel
//     const [summaryResult, cvResult, extractedProfile] = await Promise.all([
//       this.generateProfileSummary(combinedText),
//       cvText?.trim() ? this.analyzeCv(cvText) : Promise.resolve(null),
//       cvText?.trim() ? this.extractProfileFromCv(cvText) : Promise.resolve(null),
//     ]);

//     console.log(`[analyzeProfile] cvScore=${cvResult?.score}, tips=${cvResult?.feedback?.length || 0}`);

//     const upsertData: any = {
//       linkedinBio: dto.linkedinBio ?? null,
//       cvS3Key: cvKey ?? null,
//       cvFileName: cvFileName || null,
//       cvMimeType: cvMimeType || null,
//       profileSummary: summaryResult.summary ?? null,
//       skills: summaryResult.skills ?? [],
//       cvScore: cvResult?.score ?? null,
//       cvFeedback: cvResult?.feedback ?? [],
//       fullName:
//         extractedProfile?.fullName ??
//         (linkedinAccount?.name?.includes('undefined') ? null : linkedinAccount?.name) ??
//         null,
//       email: extractedProfile?.email ?? linkedinAccount?.email ?? null,
//       phone: extractedProfile?.phone ?? null,
//       location: extractedProfile?.location ?? null,
//       jobTitle: extractedProfile?.jobTitle ?? null,
//       certifications: extractedProfile?.certifications ?? [],
//       languages: extractedProfile?.languages ?? [],
//     };

//     // Only overwrite experience/education if we actually extracted them
//     if (extractedProfile?.experience && extractedProfile.experience.length > 0) {
//       upsertData.experience = extractedProfile.experience;
//     }
//     if (extractedProfile?.education && extractedProfile.education.length > 0) {
//       upsertData.education = extractedProfile.education;
//     }

//     // Save CV text for display/editing
//     if (cvText?.trim()) {
//       upsertData.cvEditableText = cvText;
//     }

//     return this.prisma.userProfile.upsert({
//       where: { userId },
//       update: upsertData,
//       create: { userId, ...upsertData },
//     });
//   }

//   // ─── AI: Profile Summary + Skills ─────────────────────────
//   private async generateProfileSummary(profileText: string) {
//     const completion = await this.groq.chat.completions.create({
//       messages: [
//         {
//           role: 'user',
//           content: `Analyze this professional profile/CV and extract key information.
// Respond ONLY with valid JSON — no markdown, no backticks, no extra text:

// {
//   "summary": "2-3 sentence professional summary based on actual content",
//   "skills": ["skill1", "skill2", "skill3"]
// }

// Rules:
// - summary must be based on actual content, not generic
// - skills: extract ALL technical skills, tools, frameworks, languages, and soft skills (up to 20)
// - Do not invent skills that aren't mentioned

// Profile/CV:
// ${profileText.slice(0, 4000)}`,
//         },
//       ],
//       model: 'llama-3.3-70b-versatile',
//       max_tokens: 1000,
//     });

//     try {
//       const raw = completion.choices[0].message.content || '{}';
//       const clean = raw.replace(/```json|```/g, '').trim();
//       const parsed = JSON.parse(clean);
//       console.log(`[generateSummary] skills extracted: ${parsed.skills?.length || 0}`);
//       return parsed;
//     } catch (err) {
//       console.error('[generateSummary] Parse failed:', err);
//       return { summary: 'Profile analyzed successfully.', skills: [] };
//     }
//   }

//   // ─── AI: CV Score + Tips ────────────────────────────────────
//   private async analyzeCv(cvText: string) {
//     const completion = await this.groq.chat.completions.create({
//       messages: [
//         {
//           role: 'user',
//           content: `Analyze this CV/resume and provide a score and improvement tips.
// Respond ONLY with valid JSON — no markdown, no backticks, no extra text:

// {
//   "score": 75,
//   "feedback": [
//     "Specific tip 1 based on actual CV content",
//     "Specific tip 2",
//     "Specific tip 3",
//     "Specific tip 4",
//     "Specific tip 5"
//   ]
// }

// Scoring criteria (0-100):
// - Quantified achievements (20pts): Does it use numbers/metrics?
// - Skills completeness (20pts): Are technical skills clearly listed?
// - Structure & formatting (20pts): Clear sections, easy to scan?
// - Professional keywords (20pts): Industry-relevant terms?
// - Completeness (20pts): All key sections present?

// Provide EXACTLY 5 specific, actionable tips based on what you actually see in the CV.

// CV:
// ${cvText.slice(0, 4000)}`,
//         },
//       ],
//       model: 'llama-3.3-70b-versatile',
//       max_tokens: 800,
//     });

//     try {
//       const raw = completion.choices[0].message.content || '{}';
//       const clean = raw.replace(/```json|```/g, '').trim();
//       const parsed = JSON.parse(clean);
//       const score = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 60;
//       const feedback = Array.isArray(parsed.feedback) ? parsed.feedback : [parsed.feedback || 'Review and improve your CV structure'];
//       console.log(`[analyzeCv] score=${score}, tips=${feedback.length}`);
//       return { score, feedback };
//     } catch (err) {
//       console.error('[analyzeCv] Parse failed:', err);
//       return {
//         score: 60,
//         feedback: ['Unable to fully analyze CV. Try re-uploading with a text-based PDF.'],
//       };
//     }
//   }

//   // ─── AI: Extract structured profile data ───────────────────
//   private async extractProfileFromCv(cvText: string) {
//     const completion = await this.groq.chat.completions.create({
//       messages: [
//         {
//           role: 'user',
//           content: `Extract ALL structured information from this CV/resume.
// Respond ONLY with valid JSON — no markdown, no backticks, no extra text.
// Use null for fields not found. Do not invent information.

// {
//   "fullName": "Full name from CV or null",
//   "email": "email address or null",
//   "phone": "phone number or null",
//   "location": "city/country or null",
//   "jobTitle": "most recent or target job title or null",
//   "experience": [
//     {
//       "title": "Job Title",
//       "company": "Company Name",
//       "duration": "Jan 2020 - Dec 2022",
//       "description": "Key responsibilities and achievements"
//     }
//   ],
//   "education": [
//     {
//       "degree": "BSc Computer Science",
//       "institution": "University Name",
//       "year": "2020"
//     }
//   ],
//   "certifications": ["cert1", "cert2"],
//   "languages": ["English", "Urdu"]
// }

// Extract ALL experience entries and ALL education entries found in the CV.

// CV:
// ${cvText.slice(0, 5000)}`,
//         },
//       ],
//       model: 'llama-3.3-70b-versatile',
//       max_tokens: 2000,
//     });

//     try {
//       const raw = completion.choices[0].message.content || '{}';
//       const clean = raw.replace(/```json|```/g, '').trim();
//       const parsed = JSON.parse(clean);
//       console.log(
//         `[extractProfile] name=${parsed.fullName}, exp=${parsed.experience?.length || 0}, edu=${parsed.education?.length || 0}, skills from cert=${parsed.certifications?.length || 0}`,
//       );
//       return parsed;
//     } catch (err) {
//       console.error('[extractProfile] Parse failed:', err);
//       return null;
//     }
//   }

//   // ─── Update CV text (manual edit) ─────────────────────────
//   async updateCvText(dto: UpdateCvDto, userId: string) {
//     return this.prisma.userProfile.update({
//       where: { userId },
//       data: { cvEditableText: dto.cvText },
//     });
//   }

//   // ─── Job Search ────────────────────────────────────────────
//   async searchJobs(userId: string, keywords?: string) {
//     const profile = await this.prisma.userProfile.findUnique({
//       where: { userId },
//     });

//     let searchQuery = keywords?.trim();

//     if (!searchQuery && profile?.skills?.length) {
//       const technicalSkill = profile.skills.find(
//         (s) => !this.softSkills.has(s.toLowerCase()),
//       );
//       searchQuery = technicalSkill || profile.skills[0];
//     }

//     searchQuery = searchQuery || 'software developer';

//     const useMock = this.configService.get('USE_MOCK_JOBS') === 'true';
//     console.log(`[searchJobs] useMock=${useMock}, query="${searchQuery}"`);

//     if (useMock) {
//       return { jobs: filterMockJobs(searchQuery), searchQuery, source: 'mock' };
//     }

//     return this.fetchAdzunaJobs(searchQuery);
//   }

//   private async fetchAdzunaJobs(searchQuery: string) {
//     const appId = this.configService.get('ADZUNA_APP_ID');
//     const appKey = this.configService.get('ADZUNA_APP_KEY');

//     const cleanQuery = searchQuery
//       .replace(/[^a-zA-Z0-9 ]/g, '')
//       .split(' ')
//       .filter(Boolean)
//       .slice(0, 3)
//       .join(' ')
//       .trim() || 'software developer';

//     console.log(`[Adzuna] query="${cleanQuery}", appId=${appId ? 'set' : 'MISSING'}`);

//     try {
//       const response = await axios.get(
//         'https://api.adzuna.com/v1/api/jobs/gb/search/1',
//         {
//           params: {
//             app_id: appId,
//             app_key: appKey,
//             results_per_page: 20,
//             what: cleanQuery,
//           },
//         },
//       );

//       const jobs = response.data.results.map((job: any) => ({
//         externalId: job.id,
//         title: job.title,
//         company: job.company?.display_name || 'Unknown',
//         location: job.location?.display_name || '',
//         description: job.description,
//         url: job.redirect_url,
//         salary:
//           job.salary_min && job.salary_max
//             ? `£${Math.round(job.salary_min / 1000)}k - £${Math.round(job.salary_max / 1000)}k`
//             : null,
//         platform: 'Adzuna',
//       }));

//       console.log(`[Adzuna] ${jobs.length} jobs found`);
//       return { jobs, searchQuery: cleanQuery, source: 'adzuna' };
//     } catch (err: any) {
//       console.error('[Adzuna] Error:', err.response?.status, err.message);
//       throw new Error(`Adzuna API error: ${err.response?.status || err.message}`);
//     }
//   }

//   // ─── Email Generation ──────────────────────────────────────
//   async generateApplicationEmail(dto: GenerateEmailDto, userId: string) {
//     const [profile, linkedinAccount] = await Promise.all([
//       this.prisma.userProfile.findUnique({ where: { userId } }),
//       this.prisma.linkedinAccount.findFirst({ where: { userId } }),
//     ]);

//     const applicantName =
//       profile?.fullName ||
//       (linkedinAccount?.name?.includes('undefined') ? null : linkedinAccount?.name) ||
//       'the applicant';

//     const profileContext = profile?.profileSummary
//       ? `Applicant: ${applicantName}\nProfile: ${profile.profileSummary}\nSkills: ${profile.skills?.join(', ')}`
//       : `Applicant: ${applicantName}`;

//     const completion = await this.groq.chat.completions.create({
//       messages: [
//         {
//           role: 'user',
//           content: `Write a professional job application email.

// Job Title: ${dto.jobTitle}
// Company: ${dto.company}
// Job Description: ${dto.jobDescription.slice(0, 1000)}

// ${profileContext}

// Format:
// - First line: Subject: <compelling subject line>
// - Blank line
// - Email body (3-4 paragraphs)
// - Sign off with the applicant's name

// Do not use placeholder brackets like [Your Name].`,
//         },
//       ],
//       model: 'llama-3.3-70b-versatile',
//     });

//     const emailText = completion.choices[0].message.content || '';
//     const lines = emailText.split('\n');
//     const subjectLine = lines.find((l) => l.startsWith('Subject:')) || '';
//     const subject = subjectLine.replace('Subject:', '').trim();
//     const body = lines.filter((l) => !l.startsWith('Subject:')).join('\n').trim();

//     return { subject, body };
//   }

//   // ─── Saved Jobs ────────────────────────────────────────────
//   async saveJob(dto: SaveJobDto, userId: string) {
//     return this.prisma.savedJob.upsert({
//       where: { userId_externalId: { userId, externalId: dto.externalId } },
//       update: {},
//       create: { ...dto, userId },
//     });
//   }

//   async getSavedJobs(userId: string) {
//     return this.prisma.savedJob.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   async removeSavedJob(externalId: string, userId: string) {
//     await this.prisma.savedJob.deleteMany({ where: { userId, externalId } });
//     return { success: true };
//   }
// }


import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import Groq from 'groq-sdk';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buffer: Buffer,
  options?: any,
) => Promise<{ text: string; numpages: number }>;
import { AnalyzeProfileDto } from './dto/analyze-profile.dto';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { SaveJobDto } from './dto/save-job.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { filterMockJobs } from './mock-jobs.data';

@Injectable()
export class JobsService {
  private groq: Groq;

  private readonly softSkills = new Set([
    'communication', 'teamwork', 'leadership', 'adaptability',
    'problem solving', 'creativity', 'time management', 'attention to detail',
    'critical thinking', 'emotional intelligence', 'public speaking',
    'digital literacy', 'continuous learning', 'strategic planning',
    'collaboration', 'organisation', 'organization', 'multitasking',
    'work ethic', 'interpersonal skills',
  ]);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private s3Service: S3Service,
  ) {
    this.groq = new Groq({ apiKey: this.configService.get('GROQ_API_KEY') });
  }

  // ─── CV Upload ─────────────────────────────────────────────

  async uploadCv(userId: string, fileBuffer: Buffer, fileName: string, mimeType: string) {
    const key = `cvs/${userId}/${Date.now()}-${fileName}`;
    await this.s3Service.uploadFile(key, fileBuffer, mimeType);
    console.log(`[uploadCv] key=${key}, size=${fileBuffer.length}, mime=${mimeType}`);
    return { key, fileName, mimeType };
  }

  async deleteCv(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile?.cvS3Key) throw new NotFoundException('No CV found to delete');
    await this.s3Service.deleteFile(profile.cvS3Key);
    return this.prisma.userProfile.update({
      where: { userId },
      data: { cvS3Key: null, cvFileName: null, cvMimeType: null, cvEditableText: null, cvScore: null, cvFeedback: [] },
    });
  }

  // ─── Text extraction (fallback for existing CVs without stored text) ──

  private async extractTextFromBuffer(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
    const isPdf = mimeType === 'application/pdf' || mimeType === 'application/octet-stream' || fileName.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      try {
        const header = buffer.slice(0, 5).toString('ascii');
        if (!header.startsWith('%PDF')) {
          console.warn(`[extractText] Not a valid PDF header: "${header}"`);
        }
        const data = await pdfParse(buffer, { max: 0 });
        const text = (data.text || '').trim();
        console.log(`[extractText] pdf-parse OK: pages=${data.numpages}, chars=${text.length}`);
        return text;
      } catch (err: any) {
        console.error('[extractText] pdf-parse failed:', err?.message);
        // Try utf-8 fallback
        const fallback = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if (fallback.length > 100) return fallback;
        return '';
      }
    }
    return buffer.toString('utf-8').trim();
  }

  // ─── Profile ───────────────────────────────────────────────

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    let cvDownloadUrl: string | null = null;
    if (profile.cvS3Key) {
      try { cvDownloadUrl = await this.s3Service.getSignedDownloadUrl(profile.cvS3Key); } catch {}
    }
    return { ...profile, cvDownloadUrl };
  }

  async analyzeProfile(dto: AnalyzeProfileDto, userId: string) {
    const [linkedinAccount, existingProfile] = await Promise.all([
      this.prisma.linkedinAccount.findFirst({ where: { userId } }),
      this.prisma.userProfile.findUnique({ where: { userId } }),
    ]);

    const parts: string[] = [];

    if (linkedinAccount?.name && !linkedinAccount.name.includes('undefined')) {
      parts.push(`Name: ${linkedinAccount.name}`);
    }
    if (linkedinAccount?.email) parts.push(`Email: ${linkedinAccount.email}`);
    if (dto.linkedinBio?.trim()) parts.push(`LinkedIn Profile:\n${dto.linkedinBio}`);

    // ── CV text priority ────────────────────────────────────
    // 1. Client-extracted text sent in request (BEST — avoids PDF parsing issues)
    // 2. Previously stored editable text
    // 3. Fetch buffer from S3 and parse (last resort)
    let cvText: string | null = null;

    if (dto.cvText && dto.cvText.trim().length > 50) {
      cvText = dto.cvText;
      console.log(`[analyzeProfile] Using client-extracted text: ${cvText.length} chars`);
    } else if (existingProfile?.cvEditableText && existingProfile.cvEditableText.trim().length > 50) {
      cvText = existingProfile.cvEditableText;
      console.log(`[analyzeProfile] Using stored cvEditableText: ${cvText.length} chars`);
    } else {
      const cvKey = dto.cvS3Key || existingProfile?.cvS3Key;
      if (cvKey) {
        try {
          const buffer = await this.s3Service.getFileAsBuffer(cvKey);
          const fileName = dto.cvFileName || existingProfile?.cvFileName || 'cv.pdf';
          const mimeType = dto.cvMimeType || existingProfile?.cvMimeType || 'application/pdf';
          cvText = await this.extractTextFromBuffer(buffer, mimeType, fileName);
          if (!cvText || cvText.trim().length < 50) {
            console.warn('[analyzeProfile] S3 extraction returned empty text');
            cvText = null;
          }
        } catch (err) {
          console.error('[analyzeProfile] S3 fetch failed:', err);
        }
      }
    }

    if (cvText?.trim()) parts.push(`CV / Resume Content:\n${cvText}`);

    const combinedText = parts.join('\n\n');
    if (!combinedText.trim()) {
      throw new NotFoundException('No profile content found. Please connect LinkedIn or upload a CV.');
    }

    console.log(`[analyzeProfile] AI input: ${combinedText.length} chars`);

    const [summaryResult, cvResult, extractedProfile] = await Promise.all([
      this.generateProfileSummary(combinedText),
      cvText?.trim() ? this.analyzeCv(cvText) : Promise.resolve(null),
      cvText?.trim() ? this.extractProfileFromCv(cvText) : Promise.resolve(null),
    ]);

    const cvKey = dto.cvS3Key || existingProfile?.cvS3Key;
    const upsertData: any = {
      linkedinBio: dto.linkedinBio ?? existingProfile?.linkedinBio ?? null,
      cvS3Key: cvKey ?? null,
      cvFileName: dto.cvFileName || existingProfile?.cvFileName || null,
      cvMimeType: dto.cvMimeType || existingProfile?.cvMimeType || null,
      profileSummary: summaryResult.summary ?? null,
      skills: summaryResult.skills ?? [],
      cvScore: cvResult?.score ?? null,
      cvFeedback: cvResult?.feedback ?? [],
      fullName:
        extractedProfile?.fullName ??
        (linkedinAccount?.name?.includes('undefined') ? null : linkedinAccount?.name) ??
        existingProfile?.fullName ?? null,
      email: extractedProfile?.email ?? linkedinAccount?.email ?? existingProfile?.email ?? null,
      phone: extractedProfile?.phone ?? existingProfile?.phone ?? null,
      location: extractedProfile?.location ?? existingProfile?.location ?? null,
      jobTitle: extractedProfile?.jobTitle ?? existingProfile?.jobTitle ?? null,
      certifications: extractedProfile?.certifications ?? existingProfile?.certifications ?? [],
      languages: extractedProfile?.languages ?? existingProfile?.languages ?? [],
    };
    if (extractedProfile?.experience?.length > 0) upsertData.experience = extractedProfile.experience;
    if (extractedProfile?.education?.length > 0) upsertData.education = extractedProfile.education;
    if (cvText?.trim()) upsertData.cvEditableText = cvText;

    return this.prisma.userProfile.upsert({
      where: { userId },
      update: upsertData,
      create: { userId, ...upsertData },
    });
  }

  // ─── AI: Profile Summary + Skills ─────────────────────────

  private async generateProfileSummary(profileText: string) {
    const completion = await this.groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Analyze this professional profile/CV and extract key information.
Respond ONLY with valid JSON — no markdown, no backticks, no extra text:

{
  "summary": "2-3 sentence professional summary based on actual content",
  "skills": ["skill1", "skill2", "skill3"]
}

Rules:
- summary must reflect actual content
- skills: extract ALL technical skills, tools, frameworks, languages, soft skills (up to 20)
- Do not invent skills

Profile/CV:
${profileText.slice(0, 4000)}`,
      }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
    });

    try {
      const raw = completion.choices[0].message.content || '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      console.log(`[generateSummary] skills: ${parsed.skills?.length || 0}`);
      return parsed;
    } catch {
      return { summary: 'Profile analyzed successfully.', skills: [] };
    }
  }

  // ─── AI: CV Score + Tips ────────────────────────────────────

  private async analyzeCv(cvText: string) {
    const completion = await this.groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Analyze this CV/resume and provide a score and improvement tips.
Respond ONLY with valid JSON — no markdown, no backticks, no extra text:

{
  "score": 75,
  "feedback": [
    "Specific tip 1 based on actual CV content",
    "Specific tip 2",
    "Specific tip 3",
    "Specific tip 4",
    "Specific tip 5"
  ]
}

Scoring criteria (0-100):
- Quantified achievements (20pts)
- Skills completeness (20pts)
- Structure & formatting (20pts)
- Professional keywords (20pts)
- Completeness (20pts)

CV:
${cvText.slice(0, 4000)}`,
      }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
    });

    try {
      const raw = completion.choices[0].message.content || '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      const score = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 60;
      const feedback = Array.isArray(parsed.feedback) ? parsed.feedback : ['Review your CV structure'];
      return { score, feedback };
    } catch {
      return { score: 60, feedback: ['Unable to fully analyze CV. Make sure your PDF contains selectable text.'] };
    }
  }

  // ─── AI: Extract structured profile data ───────────────────

  private async extractProfileFromCv(cvText: string) {
    const completion = await this.groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Extract ALL structured information from this CV/resume.
Respond ONLY with valid JSON — no markdown, no backticks, no extra text.
Use null for fields not found. Do not invent information.

{
  "fullName": "Full name or null",
  "email": "email or null",
  "phone": "phone or null",
  "location": "city/country or null",
  "jobTitle": "most recent job title or null",
  "experience": [
    { "title": "Job Title", "company": "Company", "duration": "Jan 2020 - Dec 2022", "description": "Key responsibilities" }
  ],
  "education": [
    { "degree": "BSc Computer Science", "institution": "University Name", "year": "2020" }
  ],
  "certifications": ["cert1", "cert2"],
  "languages": ["English", "Urdu"]
}

Extract ALL experience and education entries found.

CV:
${cvText.slice(0, 5000)}`,
      }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
    });

    try {
      const raw = completion.choices[0].message.content || '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      console.log(`[extractProfile] name="${parsed.fullName}", exp=${parsed.experience?.length || 0}, edu=${parsed.education?.length || 0}`);
      return parsed;
    } catch (err) {
      console.error('[extractProfile] Parse failed:', err);
      return null;
    }
  }

  // ─── Update CV text (manual edit) ─────────────────────────

  async updateCvText(dto: UpdateCvDto, userId: string) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: { cvEditableText: dto.cvText },
    });
  }

  // ─── Job Search ────────────────────────────────────────────

  async searchJobs(userId: string, keywords?: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    let searchQuery = keywords?.trim();
    if (!searchQuery && profile?.skills?.length) {
      const techSkill = profile.skills.find((s) => !this.softSkills.has(s.toLowerCase()));
      searchQuery = techSkill || profile.skills[0];
    }
    searchQuery = searchQuery || 'software developer';
    const useMock = this.configService.get('USE_MOCK_JOBS') === 'true';
    if (useMock) return { jobs: filterMockJobs(searchQuery), searchQuery, source: 'mock' };
    return this.fetchAdzunaJobs(searchQuery);
  }

  private async fetchAdzunaJobs(searchQuery: string) {
    const appId = this.configService.get('ADZUNA_APP_ID');
    const appKey = this.configService.get('ADZUNA_APP_KEY');
    const cleanQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 3).join(' ').trim() || 'software developer';
    try {
      const response = await axios.get('https://api.adzuna.com/v1/api/jobs/gb/search/1', {
        params: { app_id: appId, app_key: appKey, results_per_page: 20, what: cleanQuery },
      });
      const jobs = response.data.results.map((job: any) => ({
        externalId: job.id,
        title: job.title,
        company: job.company?.display_name || 'Unknown',
        location: job.location?.display_name || '',
        description: job.description,
        url: job.redirect_url,
        salary: job.salary_min && job.salary_max ? `£${Math.round(job.salary_min / 1000)}k - £${Math.round(job.salary_max / 1000)}k` : null,
        platform: 'Adzuna',
      }));
      return { jobs, searchQuery: cleanQuery, source: 'adzuna' };
    } catch (err: any) {
      throw new Error(`Adzuna API error: ${err.response?.status || err.message}`);
    }
  }

  // ─── Email Generation ──────────────────────────────────────

  async generateApplicationEmail(dto: GenerateEmailDto, userId: string) {
    const [profile, linkedinAccount] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.linkedinAccount.findFirst({ where: { userId } }),
    ]);
    const applicantName = profile?.fullName || (linkedinAccount?.name?.includes('undefined') ? null : linkedinAccount?.name) || 'the applicant';
    const profileContext = profile?.profileSummary
      ? `Applicant: ${applicantName}\nProfile: ${profile.profileSummary}\nSkills: ${profile.skills?.join(', ')}`
      : `Applicant: ${applicantName}`;
    const completion = await this.groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Write a professional job application email.\n\nJob Title: ${dto.jobTitle}\nCompany: ${dto.company}\nJob Description: ${dto.jobDescription.slice(0, 1000)}\n\n${profileContext}\n\nFormat:\n- First line: Subject: <subject line>\n- Blank line\n- Email body (3-4 paragraphs)\n- Sign off with applicant's name\nDo not use placeholder brackets.`,
      }],
      model: 'llama-3.3-70b-versatile',
    });
    const emailText = completion.choices[0].message.content || '';
    const lines = emailText.split('\n');
    const subject = (lines.find((l) => l.startsWith('Subject:')) || '').replace('Subject:', '').trim();
    const body = lines.filter((l) => !l.startsWith('Subject:')).join('\n').trim();
    return { subject, body };
  }

  // ─── Saved Jobs ────────────────────────────────────────────

  async saveJob(dto: SaveJobDto, userId: string) {
    return this.prisma.savedJob.upsert({
      where: { userId_externalId: { userId, externalId: dto.externalId } },
      update: {},
      create: { ...dto, userId },
    });
  }

  async getSavedJobs(userId: string) {
    return this.prisma.savedJob.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async removeSavedJob(externalId: string, userId: string) {
    await this.prisma.savedJob.deleteMany({ where: { userId, externalId } });
    return { success: true };
  }
}