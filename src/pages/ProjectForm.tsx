import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import api from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        liveUrl: '',
        githubUrl: '',
        technologies: '',
        published: false,
    });

    const getFullImageUrl = (url: string | null) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    useEffect(() => {
        if (isEditing) {
            const fetchProject = async () => {
                try {
                    const response = await api.get(`/portfolio/projects/${id}`);
                    const project = response.data;
                    setFormData({
                        title: project.title || '',
                        description: project.description || '',
                        liveUrl: project.liveUrl || '',
                        githubUrl: project.githubUrl || '',
                        technologies: project.technologies ? project.technologies.join(', ') : '',
                        published: project.published || false,
                    });
                    if (project.imageUrl) {
                        setPreviewUrl(getFullImageUrl(project.imageUrl));
                    }
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('description', formData.description);
        if (formData.liveUrl) payload.append('liveUrl', formData.liveUrl);
        if (formData.githubUrl) payload.append('githubUrl', formData.githubUrl);
        payload.append('published', String(formData.published));

        const techArray = formData.technologies.split(',').map((tag) => tag.trim()).filter(Boolean);
        payload.append('technologies', JSON.stringify(techArray));

        if (coverImage) {
            payload.append('coverImage', coverImage);
        }

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
                            <label className="block text-sm font-semibold text-slate-700 mb-4">Image de Couverture</label>

                            <div className="flex flex-col gap-4">
                                {previewUrl && (
                                    <div className="w-full h-48 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group">
                                        <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <ImageIcon size={20} /> Modifier l'image
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                )}

                                {!previewUrl && (
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 text-center">
                                        <Upload className="text-slate-400" size={32} />
                                        <p className="text-slate-600 font-medium">Cliquez pour ajouter une image</p>
                                        <p className="text-sm text-slate-400">PNG, JPG, WEBP (max 5MB)</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
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

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lien Live (URL)</label>
                            <input
                                type="url"
                                name="liveUrl"
                                value={formData.liveUrl}
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
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Technologies (séparées par des virgules)</label>
                            <input
                                type="text"
                                name="technologies"
                                value={formData.technologies}
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
