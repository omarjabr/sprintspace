import { cn, getInitials } from "@/lib/utils";
import { Project } from "@/types";
import { CalendarDays, Ellipsis, Kanban, List, Plus, Star } from "lucide-react";
import FilterDialog, { TaskFilters } from "./filter-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type ViewMode = "kanban" | "calendar" | "list";

interface ProjectNavbarProps {
  project: Project;
  onFilterChange: (filters: TaskFilters) => void;
  currentFilters: TaskFilters;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ProjectNavbar = ({
  project,
  onFilterChange,
  currentFilters,
  viewMode,
  onViewModeChange,
}: ProjectNavbarProps) => {
  return (
    <TooltipProvider>
      <div className="h-auto z-0 bg-black/20 backdrop-filter backdrop-blur-sm pb-0 relative">
        <div className="inline-flex relative flex-row flex-1 flex-wrap items-center w-full h-auto px-4 py-3 gap-x-4 text-white">
          {/* left */}
          <div className="flex relative flex-nowrap items-start min-h-[32px] max-w-full gap-x-2">
            <div className="inline-flex relative max-w-full h-[32px] mr-1 mb-0 rounded-[3px] leading-[32px] whitespace-nowrap cursor-default">
              <h1>{project.project_name}</h1>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="nav" size="icon" className="p-[6px]">
                  <Star size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to favorites</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {/* right */}
          <div className="flex relative flex-nowrap items-center min-h-[32px] ml-auto gap-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="nav"
                  size="icon"
                  className={cn(
                    "p-[6px]",
                    viewMode === "kanban" && "bg-white/20"
                  )}
                  onClick={() => onViewModeChange("kanban")}
                >
                  <Kanban size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kanban board</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="nav"
                  size="icon"
                  className={cn(
                    "p-[6px]",
                    viewMode === "calendar" && "bg-white/20"
                  )}
                  onClick={() => onViewModeChange("calendar")}
                >
                  <CalendarDays size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View calendar</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="nav"
                  size="icon"
                  className={cn(
                    "p-[6px]",
                    viewMode === "list" && "bg-white/20"
                  )}
                  onClick={() => onViewModeChange("list")}
                >
                  <List size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View list</p>
              </TooltipContent>
            </Tooltip>

            <FilterDialog
              onFilterChange={onFilterChange}
              currentFilters={currentFilters}
            />

            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-[#ffffff29]"
            />

            <div className="flex relative flex-row justify-center top-[2px] align-baseline max-h-[32px] mr-1 pl-[2px] overflow-visible gap-x-2">
              {project.users.map((user) => (
                <Tooltip key={user.email}>
                  <TooltipTrigger asChild>
                    <Avatar
                      key={user.email}
                      className="w-7 h-7 text-xs font-bold"
                    >
                      <AvatarImage
                        src={user?.image || user?.user_image}
                        alt={user?.full_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-200 text-blue-800">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {user.full_name} ({user.email})
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {project.users.length === 0 && (
                <Avatar className="w-7 h-7 text-xs font-bold">
                  <AvatarFallback className="bg-blue-200 text-blue-800">
                    <Plus size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="nav" size="icon" className="p-[6px]">
                  <Ellipsis size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProjectNavbar;
