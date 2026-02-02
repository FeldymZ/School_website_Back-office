import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
  Type,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Commencez à écrire..."
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-6',
      },
    },
  });

  // Synchronisation quand la valeur change depuis l'extérieur
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white animate-pulse">
        <div className="h-12 bg-gray-100" />
        <div className="h-48 bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-2 border-gray-200 rounded-2xl bg-white shadow-sm hover:border-[#00A4E0] transition-all duration-300">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* TOOLBAR */}
      <div className="relative z-10 flex flex-wrap items-center gap-1 p-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        {/* Header Label */}
        <div className="flex items-center gap-2 mr-2 pr-3 border-r-2 border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm">
            <Type size={16} className="text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700 hidden sm:inline">Format</span>
        </div>

        {/* Text Style Group */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            tooltip="Gras (Ctrl+B)"
          >
            <Bold size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            tooltip="Italique (Ctrl+I)"
          >
            <Italic size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            tooltip="Code inline"
          >
            <Code size={16} />
          </ToolbarButton>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" />

        {/* Headings Group */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            tooltip="Titre 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            tooltip="Titre 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            tooltip="Titre 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" />

        {/* Lists Group */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            tooltip="Liste à puces"
          >
            <List size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            tooltip="Liste numérotée"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" />

        {/* Blocks Group */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            tooltip="Citation"
          >
            <Quote size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
            tooltip="Ligne horizontale"
          >
            <Minus size={16} />
          </ToolbarButton>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" />

        {/* History Group */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            disabled={!editor.can().undo()}
            tooltip="Annuler (Ctrl+Z)"
          >
            <Undo size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            disabled={!editor.can().redo()}
            tooltip="Rétablir (Ctrl+Y)"
          >
            <Redo size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* EDITOR */}
      <div className="relative z-10">
        <EditorContent
          editor={editor}
          className="
            prose prose-sm max-w-none
            [&_.ProseMirror]:min-h-[250px]
            [&_.ProseMirror]:p-6
            [&_.ProseMirror]:focus:outline-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_h1]:text-3xl
            [&_.ProseMirror_h1]:font-bold
            [&_.ProseMirror_h1]:text-gray-900
            [&_.ProseMirror_h1]:mb-4
            [&_.ProseMirror_h2]:text-2xl
            [&_.ProseMirror_h2]:font-bold
            [&_.ProseMirror_h2]:text-gray-900
            [&_.ProseMirror_h2]:mb-3
            [&_.ProseMirror_h3]:text-xl
            [&_.ProseMirror_h3]:font-bold
            [&_.ProseMirror_h3]:text-gray-900
            [&_.ProseMirror_h3]:mb-2
            [&_.ProseMirror_p]:text-gray-700
            [&_.ProseMirror_p]:mb-4
            [&_.ProseMirror_ul]:list-disc
            [&_.ProseMirror_ul]:pl-6
            [&_.ProseMirror_ul]:mb-4
            [&_.ProseMirror_ol]:list-decimal
            [&_.ProseMirror_ol]:pl-6
            [&_.ProseMirror_ol]:mb-4
            [&_.ProseMirror_li]:mb-1
            [&_.ProseMirror_blockquote]:border-l-4
            [&_.ProseMirror_blockquote]:border-[#00A4E0]
            [&_.ProseMirror_blockquote]:pl-4
            [&_.ProseMirror_blockquote]:py-2
            [&_.ProseMirror_blockquote]:italic
            [&_.ProseMirror_blockquote]:text-gray-600
            [&_.ProseMirror_blockquote]:bg-blue-50
            [&_.ProseMirror_blockquote]:rounded-r-lg
            [&_.ProseMirror_blockquote]:my-4
            [&_.ProseMirror_code]:bg-gray-100
            [&_.ProseMirror_code]:px-2
            [&_.ProseMirror_code]:py-1
            [&_.ProseMirror_code]:rounded
            [&_.ProseMirror_code]:text-sm
            [&_.ProseMirror_code]:text-pink-600
            [&_.ProseMirror_code]:font-mono
            [&_.ProseMirror_pre]:bg-gray-900
            [&_.ProseMirror_pre]:text-gray-100
            [&_.ProseMirror_pre]:p-4
            [&_.ProseMirror_pre]:rounded-xl
            [&_.ProseMirror_pre]:overflow-x-auto
            [&_.ProseMirror_pre]:mb-4
            [&_.ProseMirror_pre]:font-mono
            [&_.ProseMirror_hr]:border-0
            [&_.ProseMirror_hr]:border-t-2
            [&_.ProseMirror_hr]:border-gray-200
            [&_.ProseMirror_hr]:my-8
            [&_.ProseMirror_strong]:font-bold
            [&_.ProseMirror_strong]:text-gray-900
            [&_.ProseMirror_em]:italic
          "
        />
      </div>

      {/* Bottom Info Bar */}
      <div className="relative z-10 px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Éditeur prêt</span>
          </div>
          <span className="text-[#A6A6A6]">
            Utilisez Markdown ou les boutons de formatage
          </span>
        </div>
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "${placeholder}";
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;

/* ================= TOOLBAR BUTTON ================= */

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  disabled?: boolean;
  tooltip?: string;
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled = false,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative p-2.5 rounded-xl transition-all duration-200
        hover:scale-110 active:scale-95
        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
        ${
          active
            ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-lg"
            : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-[#00A4E0] hover:text-[#00A4E0]"
        }
      `}
      title={tooltip}
    >
      {children}

      {/* Tooltip */}
      {tooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                         bg-gray-900 text-white text-xs rounded-lg opacity-0
                         group-hover:opacity-100 transition-opacity whitespace-nowrap
                         pointer-events-none z-50">
          {tooltip}
        </span>
      )}
    </button>
  );
}
