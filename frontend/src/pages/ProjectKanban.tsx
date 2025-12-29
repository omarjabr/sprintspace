import CalendarView from "@/components/calendar-view";
import { TaskFilters } from "@/components/filter-dialog";
import ListContainer from "@/components/list-container";
import ListView from "@/components/list-view";
import ProjectNavbar from "@/components/project-navbar";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { toast } from "@/components/ui/toast";
import { Project, Task } from "@/types";
import { useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type ViewMode = "kanban" | "calendar" | "list";

const ProjectKanban = () => {
  const { id } = useParams();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  if (!id) return null;

  const [filters, setFilters] = useState<TaskFilters>(() => {
    // Load filters from localStorage on initial mount
    const savedFilters = localStorage.getItem(`sprintspace-filters-${id}`);
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch {
        return {
          status: [],
          priority: [],
          type: [],
          assignedTo: [],
          dateRange: {},
        };
      }
    }
    return {
      status: [],
      priority: [],
      type: [],
      assignedTo: [],
      dateRange: {},
    };
  });

  const { data: project, isLoading: isProjectLoading } =
    useFrappeGetDoc<Project>("Project", id);

  // Use POST call for dynamic queries with filters
  const { call: getTasks, loading: isTasksLoading } = useFrappePostCall<{
    message: {
      id: string;
      icon: string;
      cards: Task[];
    }[];
  }>("sprintspace.api.tasks.get_tasks");

  const [board, setBoard] = useState<{
    message: {
      id: string;
      icon: string;
      cards: Task[];
    }[];
  } | null>(null);

  // Fetch tasks whenever filters or project id changes
  useEffect(() => {
    if (!id) return;

    const fetchTasks = async () => {
      try {
        const response = await getTasks({
          project: id,
          filters: JSON.stringify(filters),
        });
        setBoard(response);
      } catch (error) {
        toast.error("Failed to load tasks");
        console.error(error);
      }
    };

    fetchTasks();
  }, [filters, id, getTasks]);

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    // Persist filters to localStorage
    localStorage.setItem(
      `sprintspace-filters-${id}`,
      JSON.stringify(newFilters)
    );
  };

  const mutateTasks = () => {
    // Refetch tasks with current filters
    if (id) {
      getTasks({
        project: id,
        filters: JSON.stringify(filters),
      })
        .then(setBoard)
        .catch((error) => {
          toast.error("Failed to refresh tasks");
          console.error(error);
        });
    }
  };

  if (isProjectLoading) {
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

  // Flatten all tasks for calendar view
  const allTasks =
    board?.message && Array.isArray(board.message)
      ? board.message.flatMap((column) => column.cards)
      : [];

  if (!board || !board.message || !Array.isArray(board.message)) {
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="p-2 h-full">
        {isTasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-md p-2">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView tasks={allTasks} mutate={mutateTasks} />
        ) : viewMode === "list" ? (
          <ListView tasks={allTasks} mutate={mutateTasks} />
        ) : (
          <ListContainer data={board.message} mutate={mutateTasks} />
        )}
      </div>
    </div>
  );
};

export default ProjectKanban;
