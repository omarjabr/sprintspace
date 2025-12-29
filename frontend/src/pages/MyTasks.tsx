import CalendarView from "@/components/calendar-view";
import { TaskFilters } from "@/components/filter-dialog";
import ListContainer from "@/components/list-container";
import ListView from "@/components/list-view";
import ProjectNavbar from "@/components/project-navbar";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { toast } from "@/components/ui/toast";
import { Project, Task } from "@/types";
import { UserContext } from "@/utils/auth/UserProvider";
import { useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk";
import React, { useEffect, useState } from "react";

type ViewMode = "kanban" | "calendar" | "list";

const MyTasks = () => {
  const { currentUser } = React.useContext(UserContext);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const [filters, setFilters] = useState<TaskFilters>(() => {
    // Load filters from localStorage on initial mount
    const savedFilters = localStorage.getItem(`sprintspace-filters-my-tasks`);
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

  // Get user details
  const { data: user } = useFrappeGetDoc<{
    full_name: string;
    email: string;
    user_image: string;
  }>("User", currentUser);

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

  // Fetch tasks whenever filters change - only for current user
  useEffect(() => {
    if (!currentUser) return;

    const fetchTasks = async () => {
      try {
        // Add current user to filters to only fetch their tasks
        const userFilters = {
          ...filters,
          assignedTo: [currentUser],
        };

        const response = await getTasks({
          project: "My Tasks",
          filters: JSON.stringify(userFilters),
        });
        setBoard(response);
      } catch (error) {
        toast.error("Failed to load tasks");
        console.error(error);
      }
    };

    fetchTasks();
  }, [filters, getTasks, currentUser]);

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    // Persist filters to localStorage
    localStorage.setItem(
      `sprintspace-filters-my-tasks`,
      JSON.stringify(newFilters)
    );
  };

  const mutateTasks = () => {
    // Refetch tasks with current filters - only for current user
    if (currentUser) {
      // Add current user to filters to only fetch their tasks
      const userFilters = {
        ...filters,
        assignedTo: [currentUser],
      };

      getTasks({
        project: "My Tasks",
        filters: JSON.stringify(userFilters),
      })
        .then(setBoard)
        .catch((error) => {
          toast.error("Failed to refresh tasks");
          console.error(error);
        });
    }
  };

  if (isTasksLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading...</p>
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
    <div className="flex flex-1 flex-col pt-0 h-full">
      <ProjectNavbar
        project={
          {
            name: "My Tasks",
            project_name: "My Tasks",
            users: [user],
            owner: currentUser,
            creation: new Date().toISOString(),
            modified: new Date().toISOString(),
            modified_by: currentUser,
            custom_bg: "",
          } as unknown as Project
        }
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

export default MyTasks;
