import { useState } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import api from '../lib/axios';
import { useSite } from '../contexts/SiteContext';

const Sites = () => {
    const { sites, setSites, activeSite, setActiveSite } = useSite();
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: ''
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/sites', formData);
            const newSites = [...sites, response.data];
            setSites(newSites);
            if (!activeSite) {
                setActiveSite(response.data);
            }
            setFormData({ name: '', url: '', description: '' });
            setIsAdding(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du site:', error);
            alert('Erreur lors de l\'ajout du site');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce site ? Tous ses projets seront supprimés.')) {
            try {
                await api.delete(`/sites/${id}`);
                const remainingSites = sites.filter(s => s.id !== id);
                setSites(remainingSites);
                if (activeSite?.id === id) {
                    setActiveSite(remainingSites.length > 0 ? remainingSites[0] : null);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sites (Front-ends)</h1>
                    <p className="text-slate-500 mt-1">Gérez les différents sites web rattachés à ce panel d'administration.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm"
                    >
                        <Plus size={20} />
                        Nouveau Site
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Ajouter un nouveau site</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nom du site *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Ex: Portfolio Tommy"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">URL Publique</label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map(site => (
                    <div key={site.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{site.name}</h3>
                                {site.url && <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-primary-600">{site.url}</a>}
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">ID: {site.id}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDelete(site.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {sites.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <Globe className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-sm font-medium text-slate-900">Aucun site</h3>
                        <p className="mt-1 text-sm text-slate-500">Commencez par ajouter votre premier site/projet rattaché.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-4 text-primary-600 font-medium hover:text-primary-700">
                            + Ajouter un site
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sites;
