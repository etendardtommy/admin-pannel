import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { useArticle, useArticleMutations } from '../hooks/queries/useArticles';
import { RichTextEditor } from '../components/RichTextEditor';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const ArticleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeSite } = useSite();
    const isEditing = Boolean(id);

    const { data: article, isLoading: isFetching } = useArticle(id);
    const { createArticle, updateArticle, isCreating, isUpdating } = useArticleMutations();
    const saving = isCreating || isUpdating;

    const [error, setError] = useState<string | null>(null);

    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        published: false,
        tags: '',
        htmlContent: '',
    });

    useEffect(() => {
        if (!activeSite) {
            navigate('/');
            return;
        }
        if (isEditing && article) {
            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                published: article.published || false,
                tags: article.tags ? article.tags.join(', ') : '',
                htmlContent: article.htmlContent || '',
            });
            if (article.imageUrl) {
                const fullUrl = article.imageUrl.startsWith('/')
                    ? `${SERVER_URL}${article.imageUrl}`
                    : article.imageUrl;
                setImagePreview(fullUrl);
            }
        }
    }, [id, activeSite, navigate, isEditing, article]);

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

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
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleContentChange = (html: string) => {
        setFormData(prev => ({ ...prev, htmlContent: html }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const tagsArray = formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Use FormData to support cover image upload alongside JSON-like fields
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('excerpt', formData.excerpt);
        payload.append('published', String(formData.published));
        payload.append('tags', JSON.stringify(tagsArray));
        payload.append('htmlContent', formData.htmlContent);

        if (activeSite?.id) {
            payload.append('siteId', String(activeSite.id));
        }

        if (coverImageFile) {
            payload.append('coverImage', coverImageFile);
        }

        try {
            if (isEditing && id) {
                await updateArticle({ id, payload });
            } else {
                await createArticle(payload);
            }
            navigate('/articles');
        } catch (err: any) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde');
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
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
                            {isEditing ? 'Modifiez votre article.' : 'Créez un nouvel article.'}
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main content — 3 cols */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Title */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                            Titre de l'article *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 text-lg font-medium"
                            placeholder="Mon super article..."
                        />
                    </div>

                    {/* WYSIWYG Editor */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Contenu de l'article
                        </label>
                        <RichTextEditor
                            content={formData.htmlContent}
                            onChange={handleContentChange}
                            placeholder="Commencez à écrire votre article... Utilisez la barre d'outils pour formater le texte et insérer des images."
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <label htmlFor="excerpt" className="block text-sm font-semibold text-slate-700 mb-2">
                            Résumé (affiché dans la liste des articles)
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            rows={3}
                            value={formData.excerpt}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 resize-none"
                            placeholder="Un bref résumé pour la liste d'articles..."
                        />
                    </div>
                </div>

                {/* Sidebar — 1 col */}
                <div className="space-y-6">
                    {/* Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                        <h3 className="font-semibold text-slate-900">Paramètres</h3>

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

                        <div className="border-t border-slate-100 pt-4">
                            <label htmlFor="tags" className="block text-sm font-semibold text-slate-700 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                                placeholder="tech, blog, tuto"
                            />
                            <p className="text-xs text-slate-400 mt-1">Séparés par des virgules</p>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-4">Image de couverture</h3>

                        <input
                            type="file"
                            id="coverImage"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        {imagePreview ? (
                            <div className="space-y-3">
                                <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                                </div>
                                <label
                                    htmlFor="coverImage"
                                    className="block w-full text-center px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
                                >
                                    Changer l'image
                                </label>
                            </div>
                        ) : (
                            <label
                                htmlFor="coverImage"
                                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-primary-300 transition-all"
                            >
                                <ImageIcon size={32} className="text-slate-300" />
                                <span className="text-sm font-medium text-slate-500">Cliquez pour ajouter</span>
                                <span className="text-xs text-slate-400">PNG, JPG, WEBP</span>
                            </label>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ArticleForm;
