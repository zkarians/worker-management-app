import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/components/Header';
import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { UserProvider } from '@/app/components/UserContext';
import { SidebarProvider } from '@/app/components/SidebarContext';
import { SettingsProvider } from '@/app/components/SettingsContext';
import { MainContent } from '@/app/components/MainContent';



export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // Cast session to User type (simplified)
    const user = {
        id: session.userId as string,
        name: session.name as string,
        role: session.role as string,
        companyId: '', // We might need to fetch this if needed, but for now role is enough
    };

    return (
        <div className="min-h-screen bg-[url('/bg-grid.svg')]">
            <UserProvider initialUser={user}>
                <SettingsProvider>
                    <SidebarProvider>
                        <Sidebar userRole={session.role as string} />
                        <Header userName={session.name as string} />
                        <MainContent>{children}</MainContent>
                    </SidebarProvider>
                </SettingsProvider>
            </UserProvider>
        </div>
    );
}
