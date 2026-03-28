import { useState } from 'react';
import { Mail, CheckCircle, Trash2, Archive, Loader2 } from 'lucide-react';
import { useMessages, type Message } from '../hooks/queries/useMessages';

export default function Messages() {
    const { messages, isLoading, updateStatus, isUpdating, deleteMessage, isDeleting, deleteMessages, isDeletingBulk } = useMessages();
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked && messages) {
            setSelectedIds(messages.map(m => m.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedIds.length} message(s) ?`)) {
            deleteMessages(selectedIds, {
                onSuccess: () => {
                    setSelectedIds([]);
                    if (selectedMessage && selectedIds.includes(selectedMessage.id)) {
                        setSelectedMessage(null);
                    }
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const unreadCount = messages?.filter(m => m.status === 'UNREAD').length || 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Mail className="w-6 h-6" />
                        Messages
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-indigo-100 text-indigo-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Gérez les messages envoyés depuis votre portfolio et autres sites.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Messages List */}
                <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                checked={messages && messages.length > 0 && selectedIds.length === messages.length}
                                onChange={handleSelectAll}
                                title="Tout cocher"
                            />
                            <h2 className="text-sm font-semibold text-slate-700">Boîte de réception</h2>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeletingBulk}
                                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                            >
                                {isDeletingBulk ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Supprimer ({selectedIds.length})
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {messages?.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Mail className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                                <p>Aucun message</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {messages?.map((msg) => (
                                    <li
                                        key={msg.id}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${selectedMessage?.id === msg.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'
                                            } ${msg.status === 'UNREAD' ? 'bg-white' : 'bg-slate-50/50'}`}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (msg.status === 'UNREAD') {
                                                updateStatus({ id: msg.id, status: 'READ' });
                                            }
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                    checked={selectedIds.includes(msg.id)}
                                                    onChange={(e) => handleSelectOne(e, msg.id)}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-medium ${msg.status === 'UNREAD' ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {msg.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-500 truncate mb-2 flex-1">
                                                    {msg.email}
                                                </div>
                                                {msg.site && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                        {msg.site.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Message Detail View */}
                <div className="w-full md:w-2/3 bg-slate-50 flex-1 flex flex-col">
                    {selectedMessage ? (
                        <div className="flex-1 flex flex-col h-full bg-white relative">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedMessage.name}</h3>
                                    <a href={`mailto:${selectedMessage.email}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        {selectedMessage.email}
                                    </a>
                                    <div className="text-xs text-slate-400 mt-2">
                                        Date: {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => updateStatus({ id: selectedMessage.id, status: selectedMessage.status === 'REPLIED' ? 'READ' : 'REPLIED' })}
                                        disabled={isUpdating}
                                        className={`p-2 rounded-lg border transition-colors ${selectedMessage.status === 'REPLIED'
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        title="Marquer comme répondu"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
                                                deleteMessage(selectedMessage.id, {
                                                    onSuccess: () => setSelectedMessage(null)
                                                });
                                            }
                                        }}
                                        disabled={isDeleting}
                                        className="p-2 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                            <Archive className="w-16 h-16 mb-4 opacity-20" />
                            <p>Sélectionnez un message pour le lire</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
