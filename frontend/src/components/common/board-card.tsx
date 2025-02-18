import { Board } from "@/types";
import { CARD_BG } from "@/utils/constants";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditBoardModal } from "../modals/edit-board-modal";

interface BoardCardProps {
  board: Board;
  url: string;
  mutate: () => void;
}

function BoardCard({ board, url, mutate }: BoardCardProps) {
  const navigate = useNavigate();

  return (
    <div key={board.name} className="relative group w-full text-white">
      <div
        className="absolute top-2 right-2 flex items-center gap-1
                transition-transform duration-200 ease-in-out transform scale-0 group-hover:scale-100 z-[40]"
      >
        <EditBoardModal id={board.name} mutate={mutate} />
      </div>
      <button
        type="button"
        className="group w-full h-24 rounded-md hover:bg-slate-300 transition-colors ease-in-out duration-200 cursor-pointer overflow-hidden text-left text-white"
        style={{
          backgroundColor: board.custom_bg || CARD_BG[0],
          backgroundImage: `url(${board.custom_bg})`,
        }}
        onClick={() => navigate(url)}
      >
        <div className="relative py-1 px-2 h-full">
          <h3 className="font-bold">{board.name}</h3>
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <Users size={16} />
          </div>
        </div>
      </button>
    </div>
  );
}

export default BoardCard;
