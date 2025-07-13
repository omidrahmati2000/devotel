export interface Provider1Job {
  jobId: string;
  title: string;
  details: {
    location: string;
    type: string;
    salaryRange: string;
  };
  company: {
    name: string;
    industry: string;
  };
  skills: string[];
  postedDate: string;
}

export interface Provider1Response {
  metadata: {
    requestId: string;
    timestamp: string;
  };
  jobs: Provider1Job[];
}
