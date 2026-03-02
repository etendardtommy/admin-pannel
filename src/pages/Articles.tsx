import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ExternalLink, FileText } from 'lucide-react';
import api from '../lib/axios';
import { useSite } from '../contexts/SiteContext';

interface Article {
    id: number;
    title: string;
    excerpt: string;
    imageUrl: string;
    published: boolean;
    tags: string[];
}

const Articles = () => {
    const { activeSite } = useSite();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchArticles = async () => {
        try {
            // Requête vers le module articles récemment créé, en filtrant sur le site actif
            const response = await api.get(`/articles?siteId=${activeSite?.id}`);
            setArticles(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeSite) {
            fetchArticles();
        } else {
            setArticles([]);
            setLoading(false);
        }
    }, [activeSite]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            try {
                await api.delete(`/articles/${id}`);
                setArticles(articles.filter((a) => a.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const filteredArticles = articles.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
                    <p className="text-slate-500 mt-1">Gérez le contenu de votre blog pour ce site.</p>
                </div>
                <Link
                    to="/articles/new"
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    Nouvel Article
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un article..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all text-slate-900"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Article</th>
                                <th className="px-6 py-4 font-semibold">Statut</th>
                                <th className="px-6 py-4 font-semibold">Tags</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Chargement des articles...
                                    </td>
                                </tr>
                            ) : filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Aucun article trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {article.imageUrl ? (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                                                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-400">
                                                        <FileText size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-slate-900 flex items-center gap-2">
                                                        {article.title}
                                                    </div>
                                                    <div className="text-sm text-slate-500 truncate max-w-[250px]">
                                                        {article.excerpt || 'Aucun résumé disponible'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.published
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                    }`}
                                            >
                                                {article.published ? 'Publié' : 'Brouillon'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {article.tags?.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {article.tags?.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                                        +{article.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/articles/${article.id}`}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Éditer"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Articles;
