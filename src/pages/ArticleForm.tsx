import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, FileCode } from 'lucide-react';
import api from '../lib/axios';
import { useSite } from '../contexts/SiteContext';

const ArticleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeSite } = useSite();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Selected files state
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [htmlFile, setHtmlFile] = useState<File | null>(null);
    // Real-time preview for new selected images, or existing imageUrl from DB
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        published: false,
        tags: '',
        // Keep these if we are editing and want to show existing data
        imageUrl: '',
        htmlContent: '',
    });

    useEffect(() => {
        if (!activeSite) {
            navigate('/');
            return;
        }

        if (isEditing) {
            fetchArticle();
        }
    }, [id, activeSite, navigate]);

    // Cleanup object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const fetchArticle = async () => {
        try {
            const response = await api.get(`/articles/${id}`);
            const article = response.data;
            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                published: article.published || false,
                tags: article.tags ? article.tags.join(', ') : '',
                imageUrl: article.imageUrl || '',
                htmlContent: article.htmlContent || '',
            });

            // Set existing image as preview if present
            if (article.imageUrl) {
                // If it's a relative path from the backend uploads
                const fullUrl = article.imageUrl.startsWith('/')
                    ? `http://localhost:3000${article.imageUrl}`
                    : article.imageUrl;
                setImagePreview(fullUrl);
            }
        } catch (err) {
            console.error('Erreur lors du chargement de l\'article:', err);
            setError('Impossible de charger l\'article');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setCoverImageFile(file);

            // Generate a local preview
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setHtmlFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Process tags
        const tagsArray = formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Build FormData
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('excerpt', formData.excerpt);
        payload.append('published', String(formData.published));
        payload.append('tags', JSON.stringify(tagsArray)); // Append as stringified JSON 

        if (activeSite?.id) {
            payload.append('siteId', String(activeSite.id));
        }

        // Append files if they were selected
        if (coverImageFile) {
            payload.append('coverImage', coverImageFile);
        }
        if (htmlFile) {
            payload.append('htmlFile', htmlFile);
        } else if (!isEditing && !htmlFile) {
            // Optional: enforce HTML upload on creation
            setError('Veuillez uploader un fichier HTML pour le contenu de l\'article.');
            setSaving(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (isEditing) {
                await api.patch(`/articles/${id}`, payload, config);
            } else {
                await api.post('/articles', payload, config);
            }
            navigate('/articles');
        } catch (err: any) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/articles')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isEditing ? 'Éditer l\'article' : 'Nouvel article'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isEditing ? 'Modifiez les informations de votre article.' : 'Créez un nouvel article pour votre blog.'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm"
                >
                    <Save size={20} />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Content */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                                Titre de l'article *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                                placeholder="Mon super article"
                            />
                        </div>

                        <div>
                            <label htmlFor="htmlFile" className="block text-sm font-medium text-slate-700 mb-2">
                                Contenu de l'article (Fichier .html) {isEditing ? '' : '*'}
                            </label>

                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="htmlFile" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${htmlFile ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FileCode className={`w-8 h-8 mb-3 ${htmlFile ? 'text-primary-500' : 'text-slate-400'}`} />
                                        <p className="mb-2 text-sm text-slate-500">
                                            {htmlFile ? (
                                                <span className="font-semibold text-primary-600">{htmlFile.name}</span>
                                            ) : (
                                                <><span className="font-semibold">Cliquez pour uploader</span> un fichier HTML</>
                                            )}
                                        </p>
                                        {!htmlFile && <p className="text-xs text-slate-500">HTML uniquement</p>}
                                    </div>
                                    <input
                                        id="htmlFile"
                                        type="file"
                                        accept=".html"
                                        className="hidden"
                                        onChange={handleHtmlFileChange}
                                        required={!isEditing}
                                    />
                                </label>
                            </div>

                            {isEditing && !htmlFile && formData.htmlContent && (
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Un contenu HTML est déjà enregistré. Uploadez un nouveau fichier pour le remplacer.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-1">
                            Résumé (Excerpt)
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            rows={3}
                            value={formData.excerpt}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                            placeholder="Un bref résumé de l'article pour les listes..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Settings Side */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Paramètres</h3>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Publié en ligne</span>
                        </label>

                        <div className="pt-4 border-t border-slate-100">
                            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                                placeholder="tech, blog, actualité"
                            />
                            <p className="text-xs text-slate-500 mt-1">Séparés par des virgules</p>
                        </div>
                    </div>

                    {/* Image Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-4">Image de couverture</h3>

                        <div>
                            <input
                                type="file"
                                id="coverImage"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />

                            <label
                                htmlFor="coverImage"
                                className="block w-full text-center px-4 py-2 mb-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                            >
                                Sélectionner une image
                            </label>

                            {imagePreview ? (
                                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-sm">Aucune image</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ArticleForm;
