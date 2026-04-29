import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Auth Check (Manager only)
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Vercel Stats
        const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
        const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

        if (!VERCEL_TOKEN) {
            return NextResponse.json({ error: 'VERCEL_API_TOKEN is not configured' }, { status: 500 });
        }

        let projectId = VERCEL_PROJECT_ID;

        // Auto-detect project ID if missing
        if (!projectId) {
            const listRes = await fetch('https://api.vercel.com/v9/projects', {
                headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
            });
            if (listRes.ok) {
                const listData = await listRes.json();
                if (listData.projects?.[0]) projectId = listData.projects[0].id;
            }
        }

        if (!projectId) {
            return NextResponse.json({ error: 'VERCEL_PROJECT_ID is missing' }, { status: 500 });
        }

        // Parallel Fetch: Project Details + User Info (to construct dashboard URL)
        const [projectRes, userRes] = await Promise.all([
            fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
            }),
            fetch(`https://api.vercel.com/v2/user`, {
                headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
            })
        ]);

        if (!projectRes.ok) {
            const error = await projectRes.text();
            return NextResponse.json({ error: 'Failed to fetch Vercel project', details: error }, { status: projectRes.status });
        }

        const projectData = await projectRes.json();
        const userData = userRes.ok ? await userRes.json() : null;

        let scopeSlug = userData?.user?.username;

        // Check if project belongs to a team (accountId does not match user ID)
        if (projectData.accountId && userData?.user?.id && projectData.accountId !== userData.user.id) {
            try {
                const teamRes = await fetch(`https://api.vercel.com/v2/teams/${projectData.accountId}`, {
                    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
                });
                if (teamRes.ok) {
                    const teamData = await teamRes.json();
                    if (teamData.slug) {
                        scopeSlug = teamData.slug;
                    }
                }
            } catch (e) {
                console.error('Failed to fetch team slug:', e);
            }
        }

        // Fetch Recent Deployments (available on all plans)
        let deploymentsData = null;
        try {
            const teamId = projectData.accountId !== userData?.user?.id ? projectData.accountId : undefined;

            const deploymentsUrl = teamId
                ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=10`
                : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10`;

            const deploymentsRes = await fetch(deploymentsUrl, {
                headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
            });

            if (deploymentsRes.ok) {
                deploymentsData = await deploymentsRes.json();
            } else {
                const errorText = await deploymentsRes.text();
                console.warn('Failed to fetch deployments:', errorText);
            }
        } catch (e) {
            console.error('Error fetching deployments:', e);
        }

        return NextResponse.json({
            project: projectData,
            user: userData?.user,
            scopeSlug, // Return the correct scope slug for link construction
            deployments: deploymentsData // Add deployments data
        });

    } catch (error: any) {
        console.error('System Monitor Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
