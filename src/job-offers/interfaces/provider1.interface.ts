export interface Provider1Job {
    job_id: string;
    position_title: string;
    company_name: string;
    job_description: string;
    work_location: string;
    job_type: string;
    seniority_level: string;
    salary_info: {
        min_salary: number;
        max_salary: number;
        salary_currency: string;
    };
    posting_date: string;
    closing_date: string;
    apply_link: string;
    required_skills: string[];
    company_benefits: string[];
    is_active: boolean;
}

export interface Provider1Response {
    success: boolean;
    data: {
        jobs: Provider1Job[];
        total_count: number;
    };
}
