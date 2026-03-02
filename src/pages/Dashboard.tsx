import { Users, FolderKanban, Activity, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { label: 'Projets Actifs', value: '12', icon: FolderKanban, trend: '+20%', color: 'from-blue-500 to-primary-600' },
        { label: 'Visites ce mois', value: '3,245', icon: Activity, trend: '+12%', color: 'from-emerald-400 to-emerald-600' },
        { label: 'Nouveaux Messages', value: '8', icon: Users, trend: '+4%', color: 'from-amber-400 to-orange-500' },
        { label: 'Taux de conversion', value: '2.4%', icon: TrendingUp, trend: '+1.1%', color: 'from-purple-500 to-fuchsia-600' },
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
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-inner`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {stat.trend}
                                </span>
                                <span className="text-slate-400 ml-2">vs mois précédent</span>
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
        </div>
    );
};

export default Dashboard;
