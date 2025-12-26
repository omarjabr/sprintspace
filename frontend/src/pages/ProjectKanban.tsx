import { TaskFilters } from "@/components/filter-dialog";
import ListContainer from "@/components/list-container";
import ProjectNavbar from "@/components/project-navbar";
import { Project, Task } from "@/types";
import { useFrappeEventListener, useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const ProjectKanban = () => {
  const { id } = useParams();
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    type: [],
    assignedTo: [],
    dateRange: {}
  });

  if (!id) return null;

  const { data: project, isLoading: isProjectLoading } =
    useFrappeGetDoc<Project>("Project", id);

  const [board, setBoard] = useState<{
    ok: boolean;
    data?: {
      lists: { id: string; icon: string; color: string; cards: Task[] }[];
      total: number;
    };
    error?: { code: string; message: string };
  } | null>(null);

  const { call: fetchBoard, loading: isTasksLoading } = useFrappePostCall<{
    message: {
      ok: boolean;
      data?: {
        lists: { id: string; icon: string; color: string; cards: Task[] }[];
        total: number;
      };
      error?: { code: string; message: string };
    };
  }>("sprintspace.api.tasks.get_board");

  const mutateTasks = () => {
    fetchBoard({ project: id, filters: JSON.stringify(filters) }).then((resp) => {
      setBoard(resp.message);
    });
  };

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    mutateTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, filterKey]);

  useFrappeEventListener<{ project: string; type: string; task: string }>(
    "sprintspace_board_update",
    (event) => {
      if (event?.project === id) {
        mutateTasks();
      }
    }
  );

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  if (isProjectLoading || isTasksLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-bold text-2xl">Project Not Found</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-bold text-2xl">No Tasks Found</p>
      </div>
    );
  }

  if (board.ok === false) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-bold text-2xl">
          {board.error?.message || "Failed to load board"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col pt-0 h-full"
      style={{
        backgroundColor: project?.custom_bg || "",
        backgroundImage: project?.custom_bg
          ? `url(${project.custom_bg})`
          : "none",
      }}
    >
      <ProjectNavbar
        project={project}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />
      <div className="p-2 h-full">
        <ListContainer
          project={id}
          data={board.data?.lists || []}
          mutate={mutateTasks}
        />
      </div>
    </div>
  );
};

export default ProjectKanban;
