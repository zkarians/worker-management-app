import { GlassCard } from '@/app/components/GlassCard';

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <GlassCard key={i} className="p-4 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                            <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                    </GlassCard>
                ))}
            </div>

            {/* Date Navigator Skeleton */}
            <GlassCard className="p-4 flex items-center justify-between">
                <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
            </GlassCard>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Roster Area */}
                <div className="lg:col-span-3 space-y-4">
                    <GlassCard className="h-96 w-full bg-slate-100 animate-pulse">
                        <div className="sr-only">Loading roster</div>
                    </GlassCard>
                </div>

                {/* Side Panel Area */}
                <div className="space-y-4">
                    <GlassCard className="h-40 w-full bg-slate-100 animate-pulse">
                        <div className="sr-only">Loading stats</div>
                    </GlassCard>
                    <GlassCard className="h-40 w-full bg-slate-100 animate-pulse">
                        <div className="sr-only">Loading notes</div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
