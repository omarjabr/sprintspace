import { Droppable } from "@hello-pangea/dnd";

import { Task } from "@/types";
import { ElementRef, useRef, useState } from "react";
import { CardForm } from "./card-form";
import TaskCard from "./common/task-card";
import ListOptions from "./list-options";

interface ListItemProps {
  title: string;
  icon: string;
  data: Task[];
  mutate: () => void;
}

const ListItem = ({ title, icon, data, mutate }: ListItemProps) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const onAddCard = () => {
    mutate();
  };

  return (
    <li className="shrunk-0 h-full select-none block self-start whitespace-nowrap">
      {/* <div className="w-[272px] rounded-xl bg-[#f1f2f4] shadow-md pb-2"> */}
      <div className="flex relative box-border basis-[272px] flex-col grow-0 shrink-0 self-start justify-between w-[272px] max-h-full pb-2 mx-[6px] rounded-lg bg-[#f1f2f4] shadow-md text-[#44546f] align-top whitespace-normal scroll-margin-8px">
        <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2">
          <div className="w-full text-sm px-2.5 py-1 h-7 font-semibold border-transparent">
            {icon} {title}
          </div>
          <ListOptions onAddCard={onAddCard} />
        </div>
        <div className="overflow-y-auto h-full">
          <Droppable droppableId={title}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-2 grid-cols-1 py-2"
              >
                {data.map((task, index) => (
                  <TaskCard
                    key={task.name}
                    task={task}
                    index={index}
                    mutate={mutate}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        {/* Card */}
        <CardForm
          ref={textareaRef}
          isEditing={isEditing}
          disableEditing={disableEditing}
          enableEditing={enableEditing}
          status={title}
          mutate={mutate}
        />
      </div>
    </li>
  );
};

export default ListItem;
