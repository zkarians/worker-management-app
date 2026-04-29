export interface WorkerInfo {
    affil: string;
    name: string;
}

export interface TbmData {
    date: string;
    weather: string;
    roster: any; // Keep it simple for now as it's passed from prisma
    absentees: string[];
    absentFontSize: string;
    remarks: string;
    safetyEducation: string[];
    inspection: (WorkerInfo | null)[];
    clamp: (WorkerInfo | null)[];
    fork: (WorkerInfo | null)[];
    support: (WorkerInfo | null)[];
}
