import BoardCard from "@/components/common/board-card";
import { BoardModal } from "@/components/modals/board-modal";
import { Board } from "@/types";
import { useFrappeGetDocList } from "frappe-react-sdk";

const BoardsPage = () => {
  const {
    data: project_types,
    mutate,
    error,
    isLoading,
  } = useFrappeGetDocList<Board>("Project Type", {
    fields: ["name", "custom_bg"],
    orderBy: {
      field: "creation",
      order: "desc",
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* section one */}
      <div>
        <h2 className="text-xl">Boards</h2>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <BoardModal mutate={mutate} />
        {project_types?.map((project_type) => (
          <BoardCard
            key={project_type.name}
            board={project_type}
            url={`/${project_type.name}`}
            mutate={mutate}
          />
        ))}
      </div>
      {/* section two */}
    </div>
  );
};

export default BoardsPage;
