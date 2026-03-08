import { Users, FolderKanban, Activity, FileText } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { useProjects } from '../hooks/queries/useProjects';
import { useArticles } from '../hooks/queries/useArticles';
import { useExperiences } from '../hooks/queries/useExperiences';
import { useMessages } from '../hooks/queries/useMessages';
import { useAnalytics } from '../hooks/queries/useAnalytics';

const Dashboard = () => {
    const { activeSite } = useSite();
    const siteId = activeSite?.id?.toString();

    const { data: projects = [] } = useProjects(siteId);
    const { data: articles = [] } = useArticles(siteId);
    const { data: experiences = [] } = useExperiences(siteId);
    const { messages = [] } = useMessages();
    const { data: analytics } = useAnalytics(siteId);

    // Filtrer les messages pour compter seulement les non lus du site (ou globaux si pas de site)
    const unreadMessagesCount = messages.filter(m =>
        m.status === 'UNREAD' && (!activeSite || m.siteId === activeSite.id)
    ).length;

    const stats = [
        { label: 'Projets', value: projects.length.toString(), icon: FolderKanban, color: 'from-blue-500 to-primary-600' },
        { label: 'Articles & Parcours', value: (articles.length + experiences.length).toString(), icon: FileText, color: 'from-emerald-400 to-emerald-600' },
        { label: 'Messages Non Lus', value: unreadMessagesCount.toString(), icon: Users, color: 'from-amber-400 to-orange-500' },
        { label: 'Visites Totales', value: (analytics?.visits || 0).toString(), icon: Activity, color: 'from-purple-500 to-fuchsia-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vue d'ensemble</h1>
                    <p className="text-slate-500 mt-1">Bienvenue sur votre panneau d'administration.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
                                <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg text-white shadow-sm`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</h2>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Activité Récente</h2>
                <div className="flex items-center justify-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 text-sm">Aucune activité récente à afficher pour le moment.</p>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
