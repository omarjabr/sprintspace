import ProjectCard from "@/components/common/project-card";
import { ProjectModal } from "@/components/modals/project-modal";
import { cn } from "@/lib/utils";
import { Board, Project } from "@/types";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useParams } from "react-router-dom";

const Projects = () => {
  const { id } = useParams();

  if (!id) return null;

  const { data: project_type } = useFrappeGetDoc<Board>("Project Type", id);

  const { data: projects, mutate } = useFrappeGetDocList<Project>("Project", {
    fields: ["name", "project_name", "custom_bg", "status"],
    filters: [
      ["project_type", "=", id],
      ["status", "=", "Open"],
    ],
    orderBy: {
      field: "creation",
      order: "desc",
    },
  });

  if (!project_type) return null;

  return (
    <div
      className="flex flex-1 flex-col gap-4 p-4 h-full"
      style={{
        backgroundColor: project_type?.custom_bg || "",
        backgroundImage: `url(${project_type?.custom_bg})`,
      }}
    >
      {/* section one */}
      <div>
        <h2 className={cn("text-xl", project_type?.custom_bg && "text-white")}>
          {project_type?.name} - Projects
        </h2>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <ProjectModal project_type={project_type.name} mutate={mutate} />
        {projects?.map((project) => (
          <ProjectCard
            key={project.name}
            project={project}
            url={`/projects/${project.name}`}
            mutate={mutate}
          />
        ))}
      </div>
      {/* section two */}
    </div>
  );
};

export default Projects;
