import { Task } from "@/types";
import { DragDropContext } from "@hello-pangea/dnd";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import ListItem from "./list-item";

interface ListContainerProps {
  data: {
    id: string;
    icon: string;
    cards: Task[];
  }[];
  mutate: () => void;
  project: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function ListContainer({ data, mutate, project }: ListContainerProps) {
  const [orderedData, setOrderedData] = useState<
    {
      id: string;
      icon: string;
      cards: Task[];
    }[]
  >(data);

  const {
    call: moveCard,
    error,
    loading,
  } = useFrappePostCall("sprintspace.api.tasks.move_card");

  useEffect(() => {
    const sortedData = data.map((list) => ({
      ...list,
      cards: [...list.cards].sort(
        (a, b) =>
          (a.custom_kanban_rank ?? a.custom_kanban_index ?? 0) -
          (b.custom_kanban_rank ?? b.custom_kanban_index ?? 0)
      ),
    }));
    setOrderedData(sortedData);
  }, [data]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const newOrderedData = [...orderedData];

    const sourceList = newOrderedData.find(
      (list) => list.id === source.droppableId
    );
    const destList = newOrderedData.find(
      (list) => list.id === destination.droppableId
    );

    if (!sourceList || !destList) return;

    try {
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );
        sourceList.cards = reorderedCards;
      } else {
        const [movedCard] = sourceList.cards.splice(source.index, 1);
        destList.cards.splice(destination.index, 0, movedCard);
      }

      // Compute destination neighbors after the optimistic move.
      const destCards = destList.cards;
      const before = destination.index > 0 ? destCards[destination.index - 1]?.name : null;
      const after =
        destination.index < destCards.length - 1 ? destCards[destination.index + 1]?.name : null;

      await moveCard({
        name: draggableId,
        project,
        from_status: source.droppableId,
        to_status: destination.droppableId,
        before,
        after,
      });

      setOrderedData(newOrderedData);
      mutate();
    } catch (error) {
      console.error("Error updating task positions:", error);
      // Optionally show error notification
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div id="board-canvas" className="flex-grow relative h-full">
        <ol
          id="board"
          className="bottom-0 left-0 mb-2 overflow-x-auto overflow-y-hidden pb-2 pt-2  absolute right-0 -top-[2px] -webkit-user-select-none user-select-none whitespace-nowrap flex flex-row"
        >
          {orderedData.map((list) => (
            <ListItem
              key={list.id}
              title={list.id}
              icon={list.icon}
              data={list.cards}
              mutate={mutate}
            />
          ))}
          <div className="flex-shrink-0 w-1" />
        </ol>
      </div>
    </DragDropContext>
  );
}

export default ListContainer;
