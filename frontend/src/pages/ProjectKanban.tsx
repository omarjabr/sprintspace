import { TaskFilters } from "@/components/filter-dialog";
import ListContainer from "@/components/list-container";
import ProjectNavbar from "@/components/project-navbar";
import { Project, Task } from "@/types";
import { useFrappeGetCall, useFrappeGetDoc } from "frappe-react-sdk";
import { useState } from "react";
import { useParams } from "react-router-dom";

const ProjectKanban = () => {
  const { id } = useParams();
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    type: [],
    assignedTo: [],
    dateRange: {},
  });

  if (!id) return null;

  const { data: project, isLoading: isProjectLoading } =
    useFrappeGetDoc<Project>("Project", id);

  const {
    data: board,
    isLoading: isTasksLoading,
    mutate: mutateTasks,
  } = useFrappeGetCall<{
    message: {
      id: string;
      icon: string;
      cards: Task[];
    }[];
  }>("sprintspace.api.tasks.get_tasks", {
    project: id,
    filters: JSON.stringify(filters),
  });

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    mutateTasks();
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
        <ListContainer data={board.message} mutate={mutateTasks} />
      </div>
    </div>
  );
};

export default ProjectKanban;
