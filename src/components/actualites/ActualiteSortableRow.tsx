import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { Actualite } from "@/types/actualite";

interface Props {
  actualite: Actualite;
  children: React.ReactNode;
}

const ActualiteSortableRow = ({ actualite, children }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: actualite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`bg-white transition-all ${
        isDragging
          ? "shadow-2xl ring-2 ring-[#00A4E0] rounded-lg z-50"
          : "hover:bg-gray-50"
      }`}
    >
      <td
        {...attributes}
        {...listeners}
        className="px-4 py-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-center">
          <GripVertical
            size={18}
            className="text-[#A6A6A6] hover:text-[#00A4E0] transition-colors"
          />
        </div>
      </td>
      {children}
    </tr>
  );
};

export default ActualiteSortableRow;
