export interface UnifiedJob {
  externalId: string;
  provider: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  postedDate: Date | null;
  applicationDeadline: Date | null;
  applicationUrl: string;
  skills: string[];
  benefits: string[];
  active: boolean;

  industry?: string; // From Provider1
  companyWebsite?: string; // From Provider2
  experienceYears?: number; // From Provider2
  rawData?: any; // Store original data
}
