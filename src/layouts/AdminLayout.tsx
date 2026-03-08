import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Settings, LogOut, Globe, FileText, Mail, Images } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { useEffect, useMemo } from 'react';
import { useSites } from '../hooks/queries/useSites';

const AdminLayout = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const navigate = useNavigate();
    const { activeSite, setActiveSite, sites, setSites } = useSite();

    const { data: fetchedSites = [] } = useSites();

    useEffect(() => {
        if (token && fetchedSites.length > 0) {
            setSites(fetchedSites);
        }
    }, [token, setSites, fetchedSites]);

    // Basic Auth Guard
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const navItems = useMemo(() => {
        const items = [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Messages', path: '/messages', icon: Mail },
            { label: 'Paramètres', path: '/settings', icon: Settings },
        ];

        // On affiche 'Projets', 'Articles' et 'Parcours' uniquement si le site selectionné s'appelle 'portfolio' ou 'Portfolio'
        if (activeSite && activeSite.name.toLowerCase() === 'portfolio') {
            items.splice(2, 0,
                { label: 'Projets', path: '/projects', icon: FolderKanban },
                { label: 'Articles', path: '/articles', icon: FileText },
                { label: 'Parcours', path: '/experiences', icon: FileText }
            );
        }

        // On affiche 'Galerie' uniquement si le site selectionné s'appelle 'Eclipse Web'
        if (activeSite && activeSite.name.toLowerCase().includes('eclipse')) {
            items.splice(2, 0,
                { label: 'Galerie', path: '/gallery', icon: Images }
            );
        }

        return items;
    }, [activeSite]);

    useEffect(() => {
        if (activeSite && navItems.length > 0) {
            // Vérifie si la page actuelle est dans le menu autorisé pour ce site
            const isAllowed = navItems.some(item =>
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}`))
            );

            // Sécurité: Si la page n'est pas autorisée par le menu du site actif, on redirige au Dashboard
            if (!isAllowed && location.pathname !== '/') {
                navigate('/');
            }
        }
    }, [activeSite, location.pathname, navigate, navItems]);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white tracking-wider">ADMIN</h1>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 cursor-default">
                        {navItems.find(item => item.path === location.pathname)?.label || 'Administration'}
                    </h2>
                    <div className="flex items-center gap-6">
                        {/* Site Selector */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                            <Globe size={16} className="text-slate-500" />
                            <select
                                className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none"
                                value={activeSite?.id || ''}
                                onChange={(e) => {
                                    const site = sites.find(s => s.id === parseInt(e.target.value));
                                    setActiveSite(site || null);
                                    // Recharge la vue principale pour s'assurer que les données neuves sont fetchées
                                    window.dispatchEvent(new Event('site-changed'));
                                }}
                            >
                                {sites.length === 0 ? (
                                    <option value="">Aucun site</option>
                                ) : (
                                    sites.map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
