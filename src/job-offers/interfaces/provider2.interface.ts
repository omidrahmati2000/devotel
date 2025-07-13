export interface Provider2Job {
    id: number;
    title: string;
    employer: string;
    details: string;
    city: string;
    employment: {
        type: string;
        experience: string;
    };
    compensation: {
        from: number;
        to: number;
        currency: string;
    };
    dates: {
        posted: string;
        deadline: string;
    };
    applicationUrl: string;
    requirements: {
        skills: string;
        perks: string;
    };
    status: 'open' | 'closed';
}

export interface Provider2Response {
    results: Provider2Job[];
    metadata: {
        count: number;
        page: number;
    };
}
