import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Briefcase, GraduationCap } from 'lucide-react';
import { useExperience, useExperienceMutations } from '../hooks/queries/useExperiences';

const ExperienceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const { data: exp, isLoading: isFetching } = useExperience(id);
    const { createExperience, updateExperience, isCreating, isUpdating } = useExperienceMutations();
    const saving = isCreating || isUpdating;

    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: 'work',
        date: '',
        title: '',
        subtitle: '',
        description: '',
        skills: '',
        published: false,
    });

    useEffect(() => {
        if (isEditing && exp) {
            setFormData({
                type: exp.type || 'work',
                date: exp.date || '',
                title: exp.title || '',
                subtitle: exp.subtitle || '',
                description: exp.description || '',
                skills: exp.skills || '',
                published: exp.published || false,
            });
        }
    }, [id, isEditing, exp]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isEditing && id) {
                await updateExperience({ id, payload: formData });
            } else {
                await createExperience(formData);
            }
            navigate('/experiences');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue lors de l'enregistrement.");
        }
    };

    if (isFetching) {
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
                    to="/experiences"
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditing ? "Éditer l'expérience" : "Nouvelle expérience"}
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

                        <div className="sm:col-span-2 flex gap-6">
                            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.type === 'work' ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="type" value="work" checked={formData.type === 'work'} onChange={handleChange} className="hidden" />
                                <Briefcase size={20} />
                                Expérience Professionnelle
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.type === 'education' ? 'bg-purple-50 border-purple-500 text-purple-700 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="type" value="education" checked={formData.type === 'education'} onChange={handleChange} className="hidden" />
                                <GraduationCap size={20} />
                                Formation / Diplôme
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Période *</label>
                            <input
                                type="text"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder="Ex: 2021 - 2023 ou 2023 - Présent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder={formData.type === 'work' ? "Ex: Développeur Fullstack" : "Ex: Master Informatique"}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sous-titre (Entreprise / École) *</label>
                            <input
                                type="text"
                                name="subtitle"
                                required
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder={formData.type === 'work' ? "Ex: Google, Paris" : "Ex: Université de Technologie"}
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
                                placeholder="Décrivez vos missions, réalisations ou ce que vous y avez appris..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Compétences (séparées par des virgules)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900"
                                placeholder="React, Node.js, Gestion de projet..."
                            />
                            <p className="mt-2 text-xs text-slate-500">Ces tags apparaîtront sous la forme de petits badges en dessous de la description.</p>
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
                                <span className="text-slate-700 font-medium">Rendre cette expérience publique sur le portfolio</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <Link
                        to="/experiences"
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

export default ExperienceForm;
