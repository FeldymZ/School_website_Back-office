import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const RichTextEditor = ({ value, onChange }: Props) => {
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
  });

  // 🔁 Synchronisation quand la valeur change depuis l’extérieur (édition)
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value, {
        emitUpdate: false, // ✅ correction officielle
      });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
      </div>

      {/* EDITOR */}
      <EditorContent
        editor={editor}
        className="
          p-4 min-h-[200px]
          prose prose-sm max-w-none
          focus:outline-none
        "
      />
    </div>
  );
};

export default RichTextEditor;

/* ================= BUTTON ================= */

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-2 rounded-lg transition
        ${
          active
            ? "bg-[#00A4E0] text-white"
            : "hover:bg-gray-200"
        }
      `}
    >
      {children}
    </button>
  );
}
