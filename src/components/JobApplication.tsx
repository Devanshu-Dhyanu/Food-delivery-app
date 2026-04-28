import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe2,
  Instagram,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Mail,
  Plus,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const experienceOptions = ['Fresher', '1-2', '3-5', '5-10', '10+'] as const;
const statusOptions = ['Student', 'Employed', 'Freelancer', 'Open to Work'] as const;
const workPreferences = ['Remote', 'On-site', 'Hybrid'] as const;
const currencyOptions = ['INR', 'USD', 'EUR', 'GBP', 'AED'] as const;
const maxReasonWords = 200;
const maxResumeSizeBytes = 5 * 1024 * 1024;
const applicationStorageKey = 'vajra_job_applications_submitted';
const draftStorageKey = 'vajra_job_application_draft';
const supportEmail = 'support@vajracognixia.in';
const companyWebsiteUrl = 'https://www.vajracognixia.in/';
const companyInstagramUrl = 'https://www.instagram.com/vajracognixia.in/';
const openRoles = [
  {
    title: 'Operations Associate',
    area: 'Operations',
    location: 'On-site / Hybrid',
    description: 'Field coordination, dispatch support, and daily execution.',
    responsibilities: ['Coordinate field updates and daily dispatch flow.', 'Track operational issues and help teams close them faster.', 'Support city-level execution and reporting.'],
    requirements: ['Good communication skills.', 'Comfortable with fast-moving daily operations.', 'Basic spreadsheet and coordination skills.'],
    keywords: ['operations', 'dispatch', 'field', 'city', 'delivery', 'on-site', 'hybrid'],
  },
  {
    title: 'Frontend Developer',
    area: 'Technology',
    location: 'Remote / Hybrid',
    description: 'Build customer-facing web experiences for The Vajra.',
    responsibilities: ['Build responsive React interfaces.', 'Improve user flows across customer and careers pages.', 'Work with Supabase-backed product features.'],
    requirements: ['React and TypeScript basics.', 'Good eye for clean UI implementation.', 'Comfort with APIs and Git workflow.'],
    keywords: ['frontend', 'react', 'typescript', 'technology', 'developer', 'remote', 'hybrid'],
  },
  {
    title: 'Backend Developer',
    area: 'Technology',
    location: 'Remote / Hybrid',
    description: 'Work on APIs, data flows, and platform reliability.',
    responsibilities: ['Build and maintain backend workflows.', 'Work on database-backed product features.', 'Improve reliability, validation, and operational tooling.'],
    requirements: ['Backend or API development experience.', 'Database fundamentals.', 'Comfort debugging production-style issues.'],
    keywords: ['backend', 'api', 'supabase', 'database', 'node', 'technology', 'remote'],
  },
  {
    title: 'Growth & Partnerships',
    area: 'Growth',
    location: 'Hybrid',
    description: 'Help with partnerships, outreach, and local market growth.',
    responsibilities: ['Identify partnership opportunities.', 'Support outreach, campaigns, and local activation.', 'Track leads, conversations, and outcomes.'],
    requirements: ['Strong communication skills.', 'Interest in startups, growth, and local markets.', 'Organized follow-up habits.'],
    keywords: ['growth', 'partnerships', 'marketing', 'sales', 'community', 'hybrid'],
  },
  {
    title: 'Customer Support Executive',
    area: 'Support',
    location: 'Remote / On-site',
    description: 'Support customers, track issues, and improve service quality.',
    responsibilities: ['Respond to customer queries with clarity.', 'Track order and service issues.', 'Share recurring feedback with the product and operations team.'],
    requirements: ['Patient communication style.', 'Problem-solving mindset.', 'Comfort with basic tools and documentation.'],
    keywords: ['support', 'customer', 'service', 'communication', 'remote', 'on-site'],
  },
  {
    title: 'Research Associate',
    area: 'Research',
    location: 'Remote / Hybrid',
    description: 'Research delivery trends, customer needs, market signals, and operational improvements.',
    responsibilities: ['Study delivery, logistics, and customer behavior trends.', 'Prepare clear research notes and summaries for the team.', 'Find practical insights that can improve product and operations decisions.'],
    requirements: ['Strong curiosity and research mindset.', 'Good writing and summarization skills.', 'Comfort using online sources, spreadsheets, and structured notes.'],
    keywords: ['research', 'market research', 'analysis', 'customer research', 'logistics', 'strategy', 'remote', 'hybrid'],
  },
] as const;
const departmentFilters = ['All', ...Array.from(new Set(openRoles.map((role) => role.area)))] as const;
const hiringSteps = [
  ['Apply', 'Submit your details, resume, links, and preferred role.'],
  ['Profile Review', 'We check your experience, skills, and role fit.'],
  ['Conversation', 'Shortlisted candidates are contacted for the next discussion.'],
  ['Next Step', 'Selected candidates receive role details and joining guidance.'],
] as const;
const careerFaqs = [
  {
    question: 'Do I need to create an account to apply?',
    answer: 'No. You can submit your job application directly from this page without signing in.',
  },
  {
    question: 'What resume format should I upload?',
    answer: 'Please upload your resume or CV as a PDF file only.',
  },
  {
    question: 'Can freshers and students apply?',
    answer: 'Yes. Freshers, students, freelancers, and experienced professionals can apply.',
  },
  {
    question: 'Can I apply for remote work?',
    answer: 'Yes. The form lets you choose Remote, On-site, or Hybrid as your work preference.',
  },
  {
    question: 'When will I hear back after applying?',
    answer: 'If your profile matches an open requirement, our team will contact you using the email or phone number you provided.',
  },
  {
    question: 'Can I include my GitHub, portfolio, or website?',
    answer: 'Yes. Adding work links is recommended, especially for technology, design, growth, and content roles.',
  },
] as const;
const roleRecommendations = [
  ['I like building software', 'Frontend Developer'],
  ['I like systems and APIs', 'Backend Developer'],
  ['I like field execution', 'Operations Associate'],
  ['I like research and analysis', 'Research Associate'],
  ['I like people and support', 'Customer Support Executive'],
  ['I like growth and partnerships', 'Growth & Partnerships'],
] as const;

type ExperienceOption = (typeof experienceOptions)[number];
type StatusOption = (typeof statusOptions)[number];
type WorkPreference = (typeof workPreferences)[number];
type CurrencyOption = (typeof currencyOptions)[number];
type OpenRole = (typeof openRoles)[number];
type DepartmentFilter = (typeof departmentFilters)[number];

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCity: string;
  linkedinUrl: string;
  portfolioUrl: string;
  yearsOfExperience: ExperienceOption;
  currentStatus: StatusOption;
  positionApplyingFor: string;
  workPreference: WorkPreference;
  expectedSalary: string;
  salaryCurrency: CurrencyOption;
  availableFrom: string;
  roleReason: string;
  coverNote: string;
};

const initialFormState: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  countryCity: '',
  linkedinUrl: '',
  portfolioUrl: '',
  yearsOfExperience: 'Fresher',
  currentStatus: 'Open to Work',
  positionApplyingFor: '',
  workPreference: 'Remote',
  expectedSalary: '',
  salaryCurrency: 'INR',
  availableFrom: '',
  roleReason: '',
  coverNote: '',
};

type SavedDraft = {
  form: FormState;
  skills: string[];
};

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export default function JobApplication() {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const storedDraft = window.localStorage.getItem(draftStorageKey);
      if (!storedDraft) return initialFormState;

      const parsedDraft = JSON.parse(storedDraft) as Partial<SavedDraft>;
      return { ...initialFormState, ...(parsedDraft.form ?? {}) };
    } catch {
      return initialFormState;
    }
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(() => {
    try {
      const storedDraft = window.localStorage.getItem(draftStorageKey);
      if (!storedDraft) return [];

      const parsedDraft = JSON.parse(storedDraft) as Partial<SavedDraft>;
      return Array.isArray(parsedDraft.skills) ? parsedDraft.skills : [];
    } catch {
      return [];
    }
  });
  const [jobSearch, setJobSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('All');
  const [selectedRole, setSelectedRole] = useState<OpenRole | null>(null);
  const [footerNewsletterEmail, setFooterNewsletterEmail] = useState('');
  const [submittedApplication, setSubmittedApplication] = useState<{ email: string; role: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reasonWordCount = useMemo(() => countWords(form.roleReason), [form.roleReason]);
  const reasonLimitReached = reasonWordCount > maxReasonWords;
  const filteredRoles = useMemo(() => {
    const query = jobSearch.trim().toLowerCase();

    return openRoles.filter((role) => {
      if (departmentFilter !== 'All' && role.area !== departmentFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        role.title,
        role.area,
        role.location,
        role.description,
        ...role.keywords,
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [departmentFilter, jobSearch]);
  const formProgressSteps = [
    {
      label: 'Profile',
      complete: Boolean(form.fullName && form.email && form.phoneNumber && form.countryCity),
    },
    {
      label: 'Experience',
      complete: Boolean(form.positionApplyingFor && form.availableFrom && form.roleReason && !reasonLimitReached),
    },
    {
      label: 'Resume',
      complete: Boolean(resumeFile),
    },
    {
      label: 'Review',
      complete: Boolean(skills.length > 0 && form.linkedinUrl),
    },
  ];
  const completedProgressSteps = formProgressSteps.filter((step) => step.complete).length;
  const hasDraftContent = Boolean(
    form.fullName ||
      form.email ||
      form.phoneNumber ||
      form.countryCity ||
      form.linkedinUrl ||
      form.portfolioUrl ||
      form.positionApplyingFor ||
      form.expectedSalary ||
      form.availableFrom ||
      form.roleReason ||
      form.coverNote ||
      skills.length
  );

  useEffect(() => {
    try {
      if (!hasDraftContent) {
        window.localStorage.removeItem(draftStorageKey);
        return;
      }

      window.localStorage.setItem(draftStorageKey, JSON.stringify({ form, skills }));
    } catch {
      // Draft save is only a convenience; the form should keep working without it.
    }
  }, [form, hasDraftContent, skills]);

  const updateField = <Key extends keyof FormState>(field: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setMessage(null);

    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Please upload resume/CV as a PDF file only.' });
      return;
    }

    if (file.size > maxResumeSizeBytes) {
      setResumeFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Please upload a PDF resume under 5MB.' });
      return;
    }

    setResumeFile(file);
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;

    setSkills((current) => {
      const alreadyAdded = current.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase());
      return alreadyAdded ? current : [...current, nextSkill];
    });
    setSkillInput('');
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }

    if (event.key === 'Backspace' && !skillInput) {
      setSkills((current) => current.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((current) => current.filter((skill) => skill !== skillToRemove));
  };

  const scrollToApplication = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectRole = (roleTitle: string) => {
    updateField('positionApplyingFor', roleTitle);
    setJobSearch(roleTitle);
    setSelectedRole(null);
    scrollToApplication();
  };

  const getSubmittedApplications = () => {
    try {
      const storedValue = window.localStorage.getItem(applicationStorageKey);
      return storedValue ? (JSON.parse(storedValue) as string[]) : [];
    } catch {
      return [];
    }
  };

  const rememberSubmittedApplication = (email: string, role: string) => {
    try {
      const normalizedKey = `${email.trim().toLowerCase()}::${role.trim().toLowerCase()}`;
      const currentItems = getSubmittedApplications();
      const nextItems = currentItems.includes(normalizedKey)
        ? currentItems
        : [...currentItems, normalizedKey].slice(-50);

      window.localStorage.setItem(applicationStorageKey, JSON.stringify(nextItems));
    } catch {
      // Local duplicate protection is a convenience only; submission still succeeds without it.
    }
  };

  const hasSubmittedApplication = (email: string, role: string) => {
    const normalizedKey = `${email.trim().toLowerCase()}::${role.trim().toLowerCase()}`;
    return getSubmittedApplications().includes(normalizedKey);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstMatch = filteredRoles[0];

    if (firstMatch) {
      selectRole(firstMatch.title);
      return;
    }

    if (jobSearch.trim()) {
      updateField('positionApplyingFor', jobSearch.trim());
      scrollToApplication();
    }
  };

  const applyTypedSearch = () => {
    const typedRole = jobSearch.trim();
    if (!typedRole) return;

    updateField('positionApplyingFor', typedRole);
    scrollToApplication();
  };

  const handleFooterNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = footerNewsletterEmail.trim();
    const subject = encodeURIComponent('The Vajra careers updates signup');
    const body = encodeURIComponent(
      cleanEmail
        ? `Please add ${cleanEmail} to The Vajra careers and product updates list.`
        : 'Please add me to The Vajra careers and product updates list.'
    );

    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  const resetForm = () => {
    setForm(initialFormState);
    setResumeFile(null);
    setSkillInput('');
    setSkills([]);
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {
      // Ignore draft cleanup failures.
    }
  };

  const clearForm = () => {
    resetForm();
    setMessage(null);
    setSubmittedApplication(null);
  };

  const startNewApplication = () => {
    setSubmittedApplication(null);
    setMessage(null);
    resetForm();
    scrollToApplication();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const submittedEmail = form.email.trim();
    const submittedRole = form.positionApplyingFor.trim();

    if (!resumeFile) {
      setMessage({ type: 'error', text: 'Please upload your resume/CV PDF before applying.' });
      return;
    }

    if (!form.phoneNumber.trim().startsWith('+')) {
      setMessage({ type: 'error', text: 'Please include your country code in the phone number, for example +91.' });
      return;
    }

    if (!form.linkedinUrl.trim().toLowerCase().includes('linkedin.com/')) {
      setMessage({ type: 'error', text: 'Please enter a valid LinkedIn profile URL.' });
      return;
    }

    if (skills.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one relevant skill before submitting.' });
      return;
    }

    if (reasonLimitReached) {
      setMessage({ type: 'error', text: 'Please keep your role reason within 200 words.' });
      return;
    }

    if (hasSubmittedApplication(submittedEmail, submittedRole)) {
      setMessage({
        type: 'error',
        text: 'You have already submitted an application for this role from this device. Please use a different role if you want to apply again.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const fileName = sanitizeFileName(resumeFile.name) || 'resume.pdf';
      const resumePath = `${Date.now()}-${crypto.randomUUID()}-${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('job-resumes')
        .upload(resumePath, resumeFile, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await supabase.from('job_applications').insert({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone_number: form.phoneNumber.trim(),
        country_city: form.countryCity.trim(),
        linkedin_url: form.linkedinUrl.trim(),
        resume_path: resumePath,
        portfolio_url: form.portfolioUrl.trim() || null,
        years_of_experience: form.yearsOfExperience,
        current_status: form.currentStatus,
        position_applying_for: form.positionApplyingFor.trim(),
        work_preference: form.workPreference,
        expected_salary: form.expectedSalary ? Number(form.expectedSalary) : null,
        salary_currency: form.salaryCurrency,
        available_from: form.availableFrom,
        role_reason: form.roleReason.trim(),
        relevant_skills: skills,
        cover_note: form.coverNote.trim() || null,
      });

      if (insertError) {
        throw insertError;
      }

      rememberSubmittedApplication(submittedEmail, submittedRole);
      setSubmittedApplication({ email: submittedEmail, role: submittedRole });
      resetForm();
      setMessage(null);
    } catch (error) {
      console.error('Error submitting job application:', error);
      setMessage({
        type: 'error',
        text: 'We could not submit your application right now. Please check your details and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef6f4] pb-16 text-slate-950 md:pb-0">
      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <a href="/" className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-950">
            <ArrowLeft size={18} />
            Back to The Vajra
          </a>
          <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            Careers
          </span>
        </div>
      </header>

      <nav className="fixed left-1/2 top-4 z-40 hidden -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/65 px-2 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur lg:flex">
        {[
          ['Roles', '#roles'],
          ['Process', '#process'],
          ['Apply', '#apply'],
          ['FAQ', '#faq'],
        ].map(([label, href]) => (
          <a key={href} href={href} className="rounded-full px-4 py-2 transition hover:bg-white/15">
            {label}
          </a>
        ))}
      </nav>

      <main>
        <section className="relative overflow-hidden bg-[#0f8f80] px-4 pb-36 pt-28 text-white sm:px-6 lg:pb-44">
          <img
            src="/area/vajra-benefits-drone.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-[#0f8f80]/88" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_390px]">
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-teal-100">
                Careers at The Vajra
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Find your next role at The Vajra.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-teal-50 lg:mx-0">
                We are hiring people who want to work on delivery, operations, product, technology, and customer experience. Apply directly and tell us where you fit.
              </p>

              <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-md bg-white p-2 text-slate-900 shadow-2xl shadow-slate-950/20 lg:mx-0">
                <Search className="ml-3 shrink-0 text-teal-700" size={20} />
                <input
                  className="min-w-0 flex-1 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  value={jobSearch}
                  onChange={(event) => setJobSearch(event.target.value)}
                  placeholder="Search by role, skill, or location"
                  aria-label="Search open roles"
                />
                <button type="submit" className="rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
                  Apply
                </button>
              </form>
            </div>

            <div className="hidden rounded-lg bg-white p-5 text-slate-900 shadow-2xl shadow-slate-950/20 lg:block">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Open Areas</p>
                  <h2 className="mt-1 text-xl font-bold">Where you can apply</h2>
                </div>
                <Briefcase className="text-orange-500" size={24} />
              </div>
              <div className="grid gap-3">
                {filteredRoles.length > 0 ? (
                  filteredRoles.slice(0, 4).map((role) => (
                    <button
                      key={role.title}
                      type="button"
                      onClick={() => selectRole(role.title)}
                      className="rounded-md border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-950">{role.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{role.description}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-teal-700">
                          {role.area}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-semibold text-slate-500">{role.location}</p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">No exact match</p>
                    <p className="mt-1 text-sm text-slate-500">You can still apply with your own role title.</p>
                    <button
                      type="button"
                      onClick={applyTypedSearch}
                      className="mt-3 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-white"
                    >
                      Apply anyway
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto -mt-24 w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 rounded-lg bg-white p-5 shadow-2xl shadow-slate-950/10 md:grid-cols-3">
            <div className="flex gap-4 border-b border-slate-100 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="font-bold">Apply without login</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Submit your application directly from this page.</p>
              </div>
            </div>
            <div className="flex gap-4 border-b border-slate-100 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                <Users size={22} />
              </div>
              <div>
                <h3 className="font-bold">All experience levels</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Freshers, students, freelancers, and experienced professionals can apply.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-bold">Flexible work options</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Choose remote, on-site, or hybrid while applying.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Open Positions</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Roles we are hiring for</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Pick a role from below or search for your preferred area. You can still apply even if your exact title is not listed.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {departmentFilters.map((department) => (
              <button
                key={department}
                type="button"
                onClick={() => setDepartmentFilter(department)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  departmentFilter === department
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-700'
                }`}
              >
                {department}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRoles.map((role) => (
              <article key={role.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{role.area}</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-950">{role.title}</h3>
                  </div>
                  <Briefcase className="shrink-0 text-orange-500" size={22} />
                </div>
                <p className="min-h-[48px] text-sm leading-6 text-slate-600">{role.description}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin size={16} />
                  {role.location}
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    onClick={() => selectRole(role.title)}
                    className="inline-flex items-center justify-center rounded-md border border-teal-700 px-4 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-700 hover:text-white"
                  >
                    Apply
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="bg-white py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Hiring Process</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">What happens after you apply</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  We keep the process simple and focused. The goal is to understand your role fit clearly before moving ahead.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {hiringSteps.map(([title, body], index) => (
                  <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-sm font-bold text-white">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-bold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
          {[
            ['Real work from day one', 'Work on practical delivery, operations, and product problems instead of surface-level tasks.'],
            ['Early team advantage', 'Join while the company is still being shaped and take ownership of meaningful responsibilities.'],
            ['Cross-functional learning', 'Understand how technology, logistics, customer support, and growth work together.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg bg-[#0f8f80] p-6 text-white">
              <CheckCircle2 className="mb-5 text-teal-100" size={24} />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-teal-50">{body}</p>
            </article>
          ))}
        </section>

        <section id="faq" className="bg-white py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Life at The Vajra</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Small team energy, serious work</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The Vajra is for people who like ownership, clear communication, and learning by doing. You will work close to real delivery problems and see how decisions affect customers and operations.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Ownership', 'Take responsibility for work that matters and see it move from idea to execution.'],
                ['Learning', 'Build practical skill across product, logistics, growth, support, and research.'],
                ['Clarity', 'Work with direct communication, clear tasks, and visible outcomes.'],
                ['Momentum', 'Join a team that values speed, quality, and thoughtful execution.'],
              ].map(([title, body]) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="rounded-lg bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">Role helper</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Not sure what to apply for?</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Pick the line that sounds most like you. We will fill the role field and take you to the application form.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {roleRecommendations.map(([label, role]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => selectRole(role)}
                    className="rounded-md border border-white/10 bg-white/5 p-4 text-left transition hover:border-teal-300 hover:bg-white/10"
                  >
                    <span className="block text-sm font-bold text-white">{label}</span>
                    <span className="mt-1 block text-xs font-semibold text-teal-200">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="apply" className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:py-16">
          <aside className="self-start">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Application</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Share your profile</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Add your contact details, links, resume, and the role you want to apply for. Keep it clear and specific so we can route your application to the right team.
            </p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
              <p className="font-bold text-slate-950">Before you submit</p>
              <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={16} />Use a PDF resume.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={16} />Add links that show your work.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={16} />Mention the exact role you want.</li>
              </ul>
            </div>
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 lg:hidden">
              <p className="font-bold text-slate-950">Matching roles</p>
              <div className="mt-4 grid gap-3">
                {filteredRoles.slice(0, 3).map((role) => (
                  <button
                    key={role.title}
                    type="button"
                    onClick={() => selectRole(role.title)}
                    className="rounded-md border border-slate-100 bg-slate-50 p-3 text-left"
                  >
                    <p className="font-bold text-slate-950">{role.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{role.location}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

        {submittedApplication ? (
          <div className="rounded-lg border border-green-200 bg-white p-6 shadow-2xl shadow-slate-950/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">Application received</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Thank you for applying. Our team will review your profile and contact you if your application matches the current requirement.
            </p>
            <div className="mt-6 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Role</span>
                <span className="text-right font-bold text-slate-950">{submittedApplication.role}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Email</span>
                <span className="text-right font-bold text-slate-950">{submittedApplication.email}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Next step</span>
                <span className="text-right font-bold text-slate-950">Profile review</span>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Please keep an eye on this email for hiring communication. For any correction or update, contact us at{' '}
              <a className="font-bold text-teal-700 underline" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={startNewApplication}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-teal-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              Submit another application
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10 sm:p-6">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Job Application</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Candidate details</h2>
                {hasDraftContent && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">Draft is saved automatically on this device.</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearForm}
                className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600"
              >
                Clear form
              </button>
            </div>
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <span>Application progress</span>
                <span>{completedProgressSteps}/{formProgressSteps.length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                {formProgressSteps.map((step) => (
                  <div
                    key={step.label}
                    className={`rounded-md border px-3 py-2 text-xs font-bold ${
                      step.complete
                        ? 'border-teal-200 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-md bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Personal Details
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Full Name <span className="text-orange-500">*</span>
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Email Address <span className="text-orange-500">*</span>
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Phone Number <span className="text-orange-500">*</span>
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" type="tel" placeholder="+91 98765 43210" value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} required />
              <span className="text-xs font-normal text-slate-500">Include country code, for example +91.</span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Country / City <span className="text-orange-500">*</span>
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" placeholder="India / Jaipur" value={form.countryCity} onChange={(e) => updateField('countryCity', e.target.value)} required />
            </label>
          </div>

          <div className="mb-4 mt-6 rounded-md bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Links & Resume
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
              LinkedIn Profile URL <span className="text-orange-500">*</span>
              <span className="flex items-center rounded-md border border-slate-200 px-4 py-3 focus-within:border-teal-700">
                <LinkIcon size={18} className="mr-3 text-slate-400" />
                <input className="w-full font-normal outline-none" type="url" placeholder="https://linkedin.com/in/your-profile" value={form.linkedinUrl} onChange={(e) => updateField('linkedinUrl', e.target.value)} required />
              </span>
              <span className="text-xs font-normal text-slate-500">Use your full LinkedIn profile URL.</span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
              Resume/CV Upload <span className="text-orange-500">*</span>
              <span className="flex min-h-[58px] items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                <span className="flex min-w-0 items-center gap-3 font-normal text-slate-600">
                  <FileText size={18} className="shrink-0 text-teal-700" />
                  <span className="truncate">{resumeFile ? resumeFile.name : 'PDF only, max 5MB'}</span>
                </span>
                <input className="max-w-[180px] text-sm" type="file" accept="application/pdf,.pdf" onChange={handleResumeChange} required />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
              Portfolio / GitHub / Website URL <span className="font-normal text-slate-500">(optional)</span>
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" type="url" value={form.portfolioUrl} onChange={(e) => updateField('portfolioUrl', e.target.value)} />
            </label>
          </div>

          <div className="mb-4 mt-6 rounded-md bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Role Preferences
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Years of Experience
              <select className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" value={form.yearsOfExperience} onChange={(e) => updateField('yearsOfExperience', e.target.value as ExperienceOption)}>
                {experienceOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Current Status
              <select className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" value={form.currentStatus} onChange={(e) => updateField('currentStatus', e.target.value as StatusOption)}>
                {statusOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
              Position Applying For <span className="text-orange-500">*</span>
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" value={form.positionApplyingFor} onChange={(e) => updateField('positionApplyingFor', e.target.value)} required />
            </label>
          </div>

          <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
            Work Preference
            <div className="grid grid-cols-3 gap-2">
              {workPreferences.map((preference) => (
                <button
                  key={preference}
                  type="button"
                  onClick={() => updateField('workPreference', preference)}
                  className={`rounded-md border px-3 py-3 text-sm font-bold transition ${
                    form.workPreference === preference
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-700'
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_130px]">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Expected Salary
              <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" type="number" min="0" value={form.expectedSalary} onChange={(e) => updateField('expectedSalary', e.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Currency
              <select className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" value={form.salaryCurrency} onChange={(e) => updateField('salaryCurrency', e.target.value as CurrencyOption)}>
                {currencyOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>

          <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
            Available From <span className="text-orange-500">*</span>
            <input className="rounded-md border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" type="date" value={form.availableFrom} onChange={(e) => updateField('availableFrom', e.target.value)} required />
          </label>

          <div className="mb-4 mt-6 rounded-md bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Skills & Note
          </div>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
            Why do you want this role? <span className="text-orange-500">*</span>
            <textarea className="min-h-[130px] resize-y rounded-md border border-slate-200 px-4 py-3 font-normal leading-6 outline-none focus:border-teal-700" value={form.roleReason} onChange={(e) => updateField('roleReason', e.target.value)} required />
            <span className={`text-right text-xs ${reasonLimitReached ? 'text-red-600' : 'text-slate-500'}`}>
              {reasonWordCount}/{maxReasonWords} words
            </span>
          </label>

          <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
            Relevant Skills
            <div className="flex min-h-[56px] flex-wrap items-center gap-2 rounded-md border border-slate-200 px-3 py-2 focus-within:border-teal-700">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input className="min-w-[180px] flex-1 py-2 font-normal outline-none" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type skill and press Enter" />
              <button type="button" onClick={addSkill} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white" aria-label="Add skill">
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs font-normal text-slate-500">Add at least one skill. Press Enter after typing each skill.</span>
          </div>

          <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
            Brief Cover Note <span className="font-normal text-slate-500">(optional)</span>
            <textarea className="min-h-[110px] resize-y rounded-md border border-slate-200 px-4 py-3 font-normal leading-6 outline-none focus:border-teal-700" value={form.coverNote} onChange={(e) => updateField('coverNote', e.target.value)} />
          </label>

          {message && (
            <div className={`mt-5 rounded-md px-4 py-3 text-sm font-semibold ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
            Your application details will be used only for recruitment communication related to The Vajra.
          </p>

          <button
            type="submit"
            disabled={submitting || reasonLimitReached}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-orange-900/15 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {submitting ? 'Submitting application...' : 'Submit Application'}
          </button>
        </form>
        )}
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Questions candidates ask</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Here are the most common details about applying to The Vajra.
              </p>
            </div>

            <div className="grid gap-3">
              {careerFaqs.map((faq) => (
                <details key={faq.question} className="group rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-950">
                    {faq.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 transition group-open:rotate-45">
                      <Plus size={16} />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#5c5c5a] text-white/80">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                Help & Information
              </h3>
              <nav className="grid gap-2 text-sm leading-5" aria-label="Career footer help links">
                <a className="underline underline-offset-2 hover:text-white" href="/privacy">Privacy Policy</a>
                <a className="underline underline-offset-2 hover:text-white" href="/terms">Terms & Conditions</a>
                <a className="underline underline-offset-2 hover:text-white" href="/refund-cancellation">Refund & Cancellation</a>
                <a className="underline underline-offset-2 hover:text-white" href="/shipping-policy">Shipping Policy</a>
                <a className="underline underline-offset-2 hover:text-white" href={`mailto:${supportEmail}`}>Contact Support</a>
              </nav>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                Explore
              </h3>
              <nav className="grid gap-2 text-sm leading-5" aria-label="Career footer navigation">
                <a className="underline underline-offset-2 hover:text-white" href="/">Home</a>
                <a className="underline underline-offset-2 hover:text-white" href="/founder">Founder</a>
                <a className="underline underline-offset-2 hover:text-white" href="/careers">Careers</a>
                <a className="underline underline-offset-2 hover:text-white" href="#apply">Apply Now</a>
              </nav>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                Careers
              </h3>
              <nav className="grid gap-2 text-sm leading-5" aria-label="Career areas">
                <button type="button" onClick={() => selectRole('Operations Associate')} className="text-left underline underline-offset-2 hover:text-white">Operations</button>
                <button type="button" onClick={() => selectRole('Frontend Developer')} className="text-left underline underline-offset-2 hover:text-white">Technology</button>
                <button type="button" onClick={() => selectRole('Growth & Partnerships')} className="text-left underline underline-offset-2 hover:text-white">Growth</button>
                <button type="button" onClick={() => selectRole('Research Associate')} className="text-left underline underline-offset-2 hover:text-white">Research</button>
                <button type="button" onClick={() => selectRole('Customer Support Executive')} className="text-left underline underline-offset-2 hover:text-white">Support</button>
              </nav>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                Social Media
              </h3>
              <div className="mb-5 flex items-center gap-3">
                <a className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 hover:text-white" href={companyInstagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram size={17} />
                </a>
                <a className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 hover:text-white" href={`mailto:${supportEmail}`} aria-label="Email">
                  <Mail size={17} />
                </a>
                <a className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 hover:text-white" href={companyWebsiteUrl} target="_blank" rel="noreferrer" aria-label="Website">
                  <Globe2 size={17} />
                </a>
              </div>
              <p className="max-w-xs text-xs leading-6 text-white/65">
                Get updates from The Vajra on hiring, launch news, and product announcements.
              </p>
              <form className="mt-4 flex gap-2" onSubmit={handleFooterNewsletterSubmit}>
                <input
                  className="h-11 min-w-0 flex-1 bg-white px-3 text-xs text-slate-900 outline-none"
                  type="email"
                  placeholder="E-Mail Address"
                  aria-label="Email address"
                  value={footerNewsletterEmail}
                  onChange={(event) => setFooterNewsletterEmail(event.target.value)}
                  required
                />
                <button className="h-11 w-20 border border-white/40 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white" type="submit">
                  Send
                </button>
              </form>
            </div>
          </div>

          <div className="mt-11 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4">
              <a className="underline underline-offset-2 hover:text-white" href="/privacy">Privacy</a>
              <a className="underline underline-offset-2 hover:text-white" href="/terms">Terms</a>
              <a className="underline underline-offset-2 hover:text-white" href="/careers">Careers</a>
            </div>
            <div>Copyright {new Date().getFullYear()} The VajraCognixia Technologies Private Limited</div>
          </div>
        </div>
      </footer>

      {selectedRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setSelectedRole(null)}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{selectedRole.area}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{selectedRole.title}</h2>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin size={16} />
                  {selectedRole.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close job details"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">{selectedRole.description}</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-bold text-slate-950">Responsibilities</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                  {selectedRole.responsibilities.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-950">Requirements</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                  {selectedRole.requirements.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-orange-500" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="rounded-md border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => selectRole(selectedRole.title)}
                className="rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Apply for this role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <button
          type="button"
          onClick={scrollToApplication}
          className="inline-flex w-full items-center justify-center rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
