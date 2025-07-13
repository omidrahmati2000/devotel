export abstract class BaseJobTransformer {
    protected normalizeEmploymentType(type: string): string {
        const typeMap: { [key: string]: string } = {
            'full-time': 'Full Time',
            'full time': 'Full Time',
            'part-time': 'Part Time',
            'part time': 'Part Time',
            'contract': 'Contract',
            'temporary': 'Temporary',
            'internship': 'Internship',
            'remote': 'Remote',
            'on-site': 'On-site',
            'hybrid': 'Hybrid',
        };
        return typeMap[type?.toLowerCase()] || type || 'Not Specified';
    }

    protected normalizeExperienceLevel(level: string | number): string {
        // Handle numeric years of experience
        if (typeof level === 'number') {
            if (level === 0) return 'Entry Level';
            if (level <= 2) return 'Junior';
            if (level <= 5) return 'Mid Level';
            if (level <= 8) return 'Senior';
            return 'Principal';
        }

        // Handle string levels
        const levelMap: { [key: string]: string } = {
            'entry': 'Entry Level',
            'junior': 'Junior',
            'mid': 'Mid Level',
            'senior': 'Senior',
            'lead': 'Lead',
            'principal': 'Principal',
            'staff': 'Staff',
            'manager': 'Manager',
        };
        return levelMap[level?.toLowerCase()] || this.inferExperienceFromTitle(level) || 'Not Specified';
    }

    protected inferExperienceFromTitle(title: string): string {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return 'Senior';
        if (lowerTitle.includes('junior') || lowerTitle.includes('jr.')) return 'Junior';
        if (lowerTitle.includes('lead')) return 'Lead';
        if (lowerTitle.includes('principal') || lowerTitle.includes('staff')) return 'Principal';
        if (lowerTitle.includes('manager')) return 'Manager';
        return 'Mid Level';
    }

    protected parseDate(dateString: string): Date | null {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    }

    protected parseArray(input: string | string[] | undefined): string[] {
        if (!input) return [];
        if (Array.isArray(input)) {
            return input.filter(Boolean);
        }
        return input.split(',').map(item => item.trim()).filter(Boolean);
    }

    protected parseSalaryRange(salaryRange: string): {
        min: number | null;
        max: number | null;
        currency: string;
    } {
        // Handle various salary formats: "$62k - $102k", "$62,000 - $102,000", etc.
        const patterns = [
            /\$(\d+)k\s*-\s*\$(\d+)k/i, // $62k - $102k
            /\$(\d+),?(\d+)\s*-\s*\$(\d+),?(\d+)/i, // $62,000 - $102,000
            /(\d+)k\s*-\s*(\d+)k/i, // 62k - 102k
        ];

        for (const pattern of patterns) {
            const match = salaryRange.match(pattern);
            if (match) {
                if (pattern === patterns[0]) {
                    return {
                        min: parseInt(match[1]) * 1000,
                        max: parseInt(match[2]) * 1000,
                        currency: 'USD',
                    };
                } else if (pattern === patterns[1]) {
                    const min = parseInt(match[1] + (match[2] || ''));
                    const max = parseInt(match[3] + (match[4] || ''));
                    return { min, max, currency: 'USD' };
                } else if (pattern === patterns[2]) {
                    return {
                        min: parseInt(match[1]) * 1000,
                        max: parseInt(match[2]) * 1000,
                        currency: 'USD',
                    };
                }
            }
        }

        return { min: null, max: null, currency: 'USD' };
    }
}