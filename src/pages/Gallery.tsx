import { useState } from 'react';
import { Plus, Trash2, Edit2, Image, Video, Eye, EyeOff, X, Check } from 'lucide-react';
import { useGallery, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem } from '../hooks/queries/useGallery';
import type { GalleryItem } from '../hooks/queries/useGallery';

const CATEGORIES = ['match', 'training', 'event', 'autre'];

type FormState = {
    type: 'photo' | 'video';
    title: string;
    description: string;
    imageUrl: string; // Fallback pour image existante ou URL externe
    videoUrl: string; // Fallback pour vidéo existante ou Lien YouTube
    imageFile: File | null;
    videoFile: File | null;
    category: string;
    tags: string;
    published: boolean;
};

const emptyForm: FormState = {
    type: 'photo',
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    imageFile: null,
    videoFile: null,
    category: '',
    tags: '',
    published: true,
};

export default function Gallery() {
    const { data: items = [], isLoading } = useGallery();
    const { mutate: createItem } = useCreateGalleryItem();
    const { mutate: updateItem } = useUpdateGalleryItem();
    const { mutate: deleteItem } = useDeleteGalleryItem();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const fd = new FormData();
        fd.append('type', form.type);
        fd.append('title', form.title);
        if (form.description) fd.append('description', form.description);
        if (form.category) fd.append('category', form.category);

        const formattedTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (formattedTags.length > 0) fd.append('tags', formattedTags.join(','));

        fd.append('published', String(form.published));

        // File or URL binding
        if (form.imageFile) fd.append('imageFile', form.imageFile);
        else if (form.imageUrl) fd.append('imageUrl', form.imageUrl);

        if (form.videoFile) fd.append('videoFile', form.videoFile);
        else if (form.videoUrl) fd.append('videoUrl', form.videoUrl);

        if (editingId !== null) updateItem({ id: editingId, data: fd });
        else createItem(fd);

        setForm(emptyForm);
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (item: GalleryItem) => {
        setForm({
            type: item.type as 'photo' | 'video',
            title: item.title,
            description: item.description || '',
            imageUrl: item.imageUrl || '',
            videoUrl: item.videoUrl || '',
            imageFile: null,
            videoFile: null,
            category: item.category || '',
            tags: (item.tags || []).join(', '),
            published: item.published,
        });
        setEditingId(item.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const filteredItems = items.filter(i => filter === 'all' || i.type === filter);

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>Galerie</h1>
                    <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>
                        Gérez les photos et vidéos du site
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                >
                    <Plus size={18} /> Ajouter
                </button>
            </div>

            {/* Form panel */}
            {showForm && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>
                        {editingId !== null ? 'Modifier un élément' : 'Nouvel élément'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Type */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Type *</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value as 'photo' | 'video' })}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#111827' }}
                                >
                                    <option value="photo">📷 Photo</option>
                                    <option value="video">🎬 Vidéo</option>
                                </select>
                            </div>
                            {/* Category */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Catégorie</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#111827' }}
                                >
                                    <option value="">-- Choisir --</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {/* Title */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Titre *</label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="ex: Finale championnat 2025"
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#111827' }}
                                />
                            </div>
                            {/* Image Upload vs URL */}
                            {form.type === 'photo' && (
                                <div style={{ gridColumn: '1 / -1', background: '#e0e7ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Source de l'image</h3>
                                    <div style={{ display: 'flex', gap: '2rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Importer un fichier *</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                                                style={{ width: '100%', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #9ca3af', color: '#111827' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontWeight: 'bold' }}>OU</div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Conserver / Lien externe</label>
                                            <input
                                                value={form.imageUrl}
                                                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                                placeholder={form.imageFile ? "Fichier sélectionné... " : "URL existante ou https://..."}
                                                disabled={!!form.imageFile}
                                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: form.imageFile ? '#f3f4f6' : '#fff', color: form.imageFile ? '#9ca3af' : '#111827' }}
                                            />
                                        </div>
                                    </div>
                                    {form.imageFile && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--brand-primary)' }}>✅ Fichier prêt : {form.imageFile.name}</p>}
                                </div>
                            )}

                            {/* Video Upload vs URL */}
                            {form.type === 'video' && (
                                <div style={{ gridColumn: '1 / -1', background: '#e0e7ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Source de la vidéo</h3>

                                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Importer un .mp4</label>
                                            <input
                                                type="file"
                                                accept="video/mp4"
                                                onChange={e => setForm({ ...form, videoFile: e.target.files?.[0] || null })}
                                                style={{ width: '100%', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #9ca3af', color: '#111827' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontWeight: 'bold' }}>OU</div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Lien YouTube / Externe</label>
                                            <input
                                                value={form.videoUrl}
                                                onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                                                placeholder={form.videoFile ? "Fichier sélectionné... " : "https://youtube.com/watch?v=..."}
                                                disabled={!!form.videoFile}
                                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: form.videoFile ? '#f3f4f6' : '#fff', color: form.videoFile ? '#9ca3af' : '#111827' }}
                                            />
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>Miniature de la vidéo (Optionnel)</h3>
                                    <div style={{ display: 'flex', gap: '2rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Importer une image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                                                style={{ width: '100%', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #9ca3af', color: '#111827' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontWeight: 'bold' }}>OU</div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Conserver / Lien d'image distant</label>
                                            <input
                                                value={form.imageUrl}
                                                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                                placeholder={form.imageFile ? "Fichier sélectionné..." : "URL de la miniature"}
                                                disabled={!!form.imageFile}
                                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: form.imageFile ? '#f3f4f6' : '#fff', color: form.imageFile ? '#9ca3af' : '#111827' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Description */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Description optionnelle..."
                                    rows={3}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#111827', resize: 'vertical' }}
                                />
                            </div>
                            {/* Tags */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Tags (séparés par des virgules)</label>
                                <input
                                    value={form.tags}
                                    onChange={e => setForm({ ...form, tags: e.target.value })}
                                    placeholder="ex: scrim, 2025, team"
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            {/* Published */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={form.published}
                                    onChange={e => setForm({ ...form, published: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="published" style={{ cursor: 'pointer', fontWeight: '600', color: '#111827' }}>Publié (visible sur le site)</label>
                            </div>
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <button type="button" onClick={handleCancel} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#4b5563', fontWeight: '600' }}>
                                <X size={16} /> Annuler
                            </button>
                            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                                <Check size={16} /> {editingId !== null ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['all', 'photo', 'video'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: filter === f ? '700' : '500', background: filter === f ? 'var(--brand-primary)' : '#fff', color: filter === f ? '#fff' : '#374151' }}
                    >
                        {f === 'all' ? 'Tout' : f === 'photo' ? '📷 Photos' : '🎬 Vidéos'}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', color: '#4b5563', fontSize: '0.875rem', alignSelf: 'center', fontWeight: '500' }}>
                    {filteredItems.length} élément(s)
                </span>
            </div>

            {/* Items grid */}
            {isLoading ? (
                <p style={{ color: '#4b5563', fontWeight: '500' }}>Chargement...</p>
            ) : filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5563', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ fontWeight: '500' }}>Aucun élément. Cliquez sur "Ajouter" pour commencer.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {filteredItems.map(item => (
                        <div key={item.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }}>
                            {/* Preview */}
                            <div style={{ height: '160px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                        {item.type === 'video' ? <Video size={40} /> : <Image size={40} />}
                                    </div>
                                )}
                                <span style={{ position: 'absolute', top: '8px', left: '8px', background: item.type === 'video' ? '#7c3aed' : '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                                    {item.type === 'video' ? '🎬 Vidéo' : '📷 Photo'}
                                </span>
                                <span style={{ position: 'absolute', top: '8px', right: '8px', background: item.published ? '#059669' : '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                                    {item.published ? 'Publié' : 'Brouillon'}
                                </span>
                            </div>
                            {/* Info */}
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.95rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h3>
                                {item.category && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>#{item.category}</p>}
                                {item.tags?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.75rem' }}>
                                        {item.tags.map(tag => (
                                            <span key={tag} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', color: '#475569', fontWeight: '600' }}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                    <button
                                        onClick={() => {
                                            const fd = new FormData();
                                            fd.append('published', String(!item.published));
                                            updateItem({ id: item.id, data: fd });
                                        }}
                                        title={item.published ? 'Dépublier' : 'Publier'}
                                        style={{ padding: '0.4rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }}
                                    >
                                        {item.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        title="Modifier"
                                        style={{ flex: 1, padding: '0.4rem', background: '#f1f5f9', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#111827', fontWeight: '600' }}
                                    >
                                        <Edit2 size={14} /> Modifier
                                    </button>
                                    <button
                                        onClick={() => { if (confirm('Supprimer cet élément ?')) deleteItem(item.id); }}
                                        title="Supprimer"
                                        style={{ padding: '0.4rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
