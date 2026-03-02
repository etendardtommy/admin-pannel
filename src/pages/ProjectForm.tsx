import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../lib/axios';

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        url: '',
        githubUrl: '',
        tags: '',
        published: false,
    });

    useEffect(() => {
        if (isEditing) {
            const fetchProject = async () => {
                try {
                    const response = await api.get(`/portfolio/projects/${id}`);
                    const project = response.data;
                    setFormData({
                        title: project.title || '',
                        description: project.description || '',
                        imageUrl: project.imageUrl || '',
                        url: project.url || '',
                        githubUrl: project.githubUrl || '',
                        tags: project.tags ? project.tags.join(', ') : '',
                        published: project.published || false,
                    });
                } catch (err) {
                    console.error(err);
                    setError('Erreur lors du chargement du projet.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const payload = {
            ...formData,
            tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        };

        try {
            if (isEditing) {
                await api.patch(`/portfolio/projects/${id}`, payload);
            } else {
                await api.post('/portfolio/projects', payload);
            }
            navigate('/projects');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/projects"
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditing ? 'Éditer le projet' : 'Nouveau projet'}
                    </h1>
                    <p className="text-slate-500 mt-1">Remplissez les informations ci-dessous.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du projet *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder="Ex: Mon super e-commerce"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900 resize-none"
                                placeholder="Décrivez votre projet..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Image URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lien Live (URL)</label>
                            <input
                                type="url"
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder="https://mon-projet.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lien GitHub</label>
                            <input
                                type="url"
                                name="githubUrl"
                                value={formData.githubUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder="https://github.com/..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (séparés par des virgules)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder="React, Node.js, Tailwind..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-slate-300 transition-colors"
                                />
                                <span className="text-slate-700 font-medium">Projet publié (visible publiquement)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <Link
                        to="/projects"
                        className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
