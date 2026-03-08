import { useState, useRef } from 'react';
import { useRoster, useCreateRosterItem, useUpdateRosterItem, useDeleteRosterItem } from '../hooks/queries/useRoster';
import type { RosterItem } from '../hooks/queries/useRoster';
import { useSite } from '../contexts/SiteContext';

export default function Roster() {
    const { activeSite } = useSite();
    const { data: rosterItems, isLoading } = useRoster();
    const createMutation = useCreateRosterItem();
    const updateMutation = useUpdateRosterItem();
    const deleteMutation = useDeleteRosterItem();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RosterItem | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Display this page only if it's the Eclyps site
    if (activeSite?.id !== 2) {
        return (
            <main className="p-8 pb-32">
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
                    <p className="font-bold">Attention</p>
                    <p>Le système Roster n'est disponible que pour le site Eclyps.</p>
                </div>
            </main>
        );
    }

    const resetForm = () => {
        setName('');
        setNumber('');
        setPhotoFile(null);
        setPreviewUrl(null);
        setEditingItem(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenModal = (item?: RosterItem) => {
        resetForm();
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setNumber(item.number || '');
            if (item.photoUrl) setPreviewUrl(item.photoUrl);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        if (number) formData.append('number', number);
        if (photoFile) formData.append('photoFile', photoFile);

        try {
            if (editingItem) {
                await updateMutation.mutateAsync({ id: editingItem.id, payload: formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Submission failed', error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce joueur ?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Delete failed', error);
                alert('Erreur lors de la suppression.');
            }
        }
    };

    return (
        <main className="p-8 pb-32">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Roster / Joueurs</h1>
                    <p className="text-gray-500 mt-1">Gérez l'équipe Eclyps affichée sur le site</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                    + Ajouter un joueur
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">Chargement de l'équipe...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rosterItems?.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
                            <div className="relative aspect-square sm:aspect-video md:aspect-square bg-gray-100 flex items-center justify-center">
                                {item.photoUrl ? (
                                    <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-sm text-gray-400">Aucune photo</div>
                                )}
                                {item.number && (
                                    <div className="absolute top-3 left-3 bg-black text-white text-sm font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10">
                                        #{item.number}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="flex-1 text-center py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex-1 text-center py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {rosterItems?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <p>Aucun joueur dans le roster. Commencez par en ajouter un.</p>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingItem ? 'Modifier le joueur' : 'Ajouter un joueur'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold p-2">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom complet ou Pseudo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                                    placeholder="Ex: John 'Destroyer' Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Numéro de maillot (Optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                                    placeholder="Ex: 7"
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Photo du joueur *</label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="block w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-indigo-50 file:text-indigo-700
                                          hover:file:bg-indigo-100 cursor-pointer"
                                    required={!editingItem && !photoFile}
                                />
                                <p className="text-xs text-gray-500 mt-2">Format préféré : portrait (ratio 3:4 ou 1:1), max 2MB.</p>

                                {previewUrl && (
                                    <div className="mt-4 flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Aperçu :</span>
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border shadow-sm">
                                            <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending
                                        ? 'Enregistrement...'
                                        : editingItem
                                            ? 'Mettre à jour'
                                            : 'Ajouter au roster'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
