import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useRef, useState, useCallback } from 'react';
import api from '../lib/axios';
import './RichTextEditor.css';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Uploads a File to the backend, returns the full public URL
async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/articles/upload-image', formData);
    return `${SERVER_URL}${response.data.url}`;
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

const MenuBar = ({ editor, uploading }: { editor: any; uploading: boolean }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = await uploadImageFile(file);
            editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
            console.error('Erreur upload image:', err);
            alert('Impossible d\'uploader l\'image. Vérifiez la console.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL du lien :', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const btn = (action: () => void, active: boolean, title: string, children: React.ReactNode) => (
        <button type="button" onClick={action} className={`rte-btn ${active ? 'rte-btn--active' : ''}`} title={title}>
            {children}
        </button>
    );

    return (
        <div className="rte-menubar">
            {/* Heading */}
            <div className="rte-group">
                {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'Titre 1', 'H1')}
                {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Titre 2', 'H2')}
                {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Titre 3', 'H3')}
            </div>

            <div className="rte-divider" />

            {/* Text format */}
            <div className="rte-group">
                {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Gras (Ctrl+B)', <strong>B</strong>)}
                {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italique (Ctrl+I)', <em>I</em>)}
                {btn(() => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Souligné (Ctrl+U)', <span style={{ textDecoration: 'underline' }}>U</span>)}
                {btn(() => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), 'Barré', <s>S</s>)}
                {btn(() => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Code inline', <code>{'<>'}</code>)}
            </div>

            <div className="rte-divider" />

            {/* Alignment */}
            <div className="rte-group">
                {btn(() => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }), 'Aligner à gauche', '⬅')}
                {btn(() => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }), 'Centrer', '↔')}
                {btn(() => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }), 'Aligner à droite', '➡')}
            </div>

            <div className="rte-divider" />

            {/* Lists & blocks */}
            <div className="rte-group">
                {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Liste à puces', '• —')}
                {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Liste numérotée', '1.')}
                {btn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Citation', '"')}
                {btn(() => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), 'Bloc de code', '{ }')}
            </div>

            <div className="rte-divider" />

            {/* Link & Image */}
            <div className="rte-group">
                {btn(setLink, editor.isActive('link'), 'Insérer un lien', '🔗')}
                <button
                    type="button"
                    className={`rte-btn ${uploading ? 'rte-btn--uploading' : ''}`}
                    title="Insérer une image (ou coller avec Ctrl+V / glisser-déposer)"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? '⏳' : '🖼️'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="rte-file-input"
                    onChange={handleImageUpload}
                />
            </div>

            <div className="rte-divider" />

            {/* History */}
            <div className="rte-group">
                {btn(() => editor.chain().focus().undo().run(), false, 'Annuler (Ctrl+Z)', '↩')}
                {btn(() => editor.chain().focus().redo().run(), false, 'Refaire (Ctrl+Y)', '↪')}
            </div>

            <div className="rte-divider" />

            <div className="rte-group">
                {btn(() => editor.chain().focus().setHorizontalRule().run(), false, 'Ligne de séparation', '—')}
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const RichTextEditor = ({ content, onChange, placeholder = 'Commencez à écrire...\n\nAstuce : Collez une capture d\'écran directement avec Ctrl+V, ou glissez une image depuis votre bureau.' }: RichTextEditorProps) => {
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const editorRef = useRef<any>(null);

    // Upload helper that shows loading state
    const handleUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) return false;
        const currentEditor = editorRef.current;
        if (!currentEditor) return false;
        setUploading(true);
        try {
            const url = await uploadImageFile(file);
            currentEditor.chain().focus().setImage({ src: url }).run();
            return true;
        } catch (err: any) {
            console.error('Erreur upload image:', err);
            const msg = err?.response?.data?.message || err.message || 'Erreur inconnue';
            alert(`Impossible d'uploader l'image.\nRaisons possibles : backend non démarré, Token expiré, ou fichier non supporté.\nErreur: ${msg}`);
            return false;
        } finally {
            setUploading(false);
        }
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // To avoid duplicate extensions warning if they are already in StarterKit v3
                dropcursor: false,
            }),
            Underline,
            Image.configure({
                inline: false,
                allowBase64: false, // Prevent TipTap from converting pasted images to huge base64 strings
                HTMLAttributes: { class: 'rte-image' },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'rte-link', target: '_blank', rel: 'noopener noreferrer' },
            }),
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
        onCreate({ editor }) {
            editorRef.current = editor;
        },
        onDestroy() {
            editorRef.current = null;
        },
        editorProps: {
            // Handle paste events (Ctrl+V screenshots)
            handlePaste(_view, event) {
                const items = Array.from(event.clipboardData?.items || []);
                const imageItem = items.find(item => item.type.startsWith('image/'));
                if (!imageItem) return false;

                event.preventDefault();
                let file = imageItem.getAsFile();
                if (!file || !editorRef.current) return false;

                // Ensure file has a name for Multer
                if (!file.name) {
                    file = new File([file], 'pasted-image.png', { type: file.type });
                }

                handleUpload(file);
                return true;
            },
            // Handle drag & drop of image files
            handleDrop(_view, event) {
                const files = Array.from(event.dataTransfer?.files || []);
                const imageFile = files.find(f => f.type.startsWith('image/'));
                if (!imageFile) return false;

                event.preventDefault();
                if (!editorRef.current) return false;
                handleUpload(imageFile);
                return true;
            },
        },
    });

    // Drag & drop visual feedback on wrapper
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = () => setIsDragOver(false);
    const handleDrop = (e: React.DragEvent) => {
        setIsDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            e.preventDefault();
            handleUpload(file);
        }
    };

    return (
        <div
            className={`rte-wrapper ${isDragOver ? 'rte-wrapper--drag' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <MenuBar editor={editor} uploading={uploading} />

            {uploading && (
                <div className="rte-upload-overlay">
                    <div className="rte-upload-spinner" />
                    <span>Upload en cours...</span>
                </div>
            )}

            {isDragOver && (
                <div className="rte-drop-hint">
                    🖼️ Relâchez pour insérer l'image
                </div>
            )}

            <EditorContent editor={editor} className="rte-content" />

            <div className="rte-hint">
                💡 Collez une capture avec <kbd>Ctrl+V</kbd> · Glissez une image · ou cliquez sur 🖼️
            </div>
        </div>
    );
};
