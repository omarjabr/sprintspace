import { Task } from "@/types";
import { DragDropContext } from "@hello-pangea/dnd";
import { useFrappePutCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import ListItem from "./list-item";

interface ListContainerProps {
  data: {
    id: string;
    icon: string;
    cards: Task[];
  }[];
  mutate: () => void;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function ListContainer({ data, mutate }: ListContainerProps) {
  const [orderedData, setOrderedData] = useState<
    {
      id: string;
      icon: string;
      cards: Task[];
    }[]
  >(data);

  const {
    call: updateCardOrder,
    error,
    loading,
  } = useFrappePutCall("sprintspace.api.tasks.update_card_order");

  useEffect(() => {
    const sortedData = data.map((list) => ({
      ...list,
      cards: [...list.cards].sort(
        (a, b) => (a.custom_kanban_index || 0) - (b.custom_kanban_index || 0)
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

    let newOrderedData = [...orderedData];
    const updates: any[] = [];

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

        reorderedCards.forEach((card, index) => {
          updates.push({
            name: card.name,
            custom_kanban_index: index,
          });
        });

        sourceList.cards = reorderedCards;
      } else {
        const [movedCard] = sourceList.cards.splice(source.index, 1);
        destList.cards.splice(destination.index, 0, movedCard);

        updates.push({
          name: movedCard.name,
          status: destination.droppableId,
          custom_kanban_index: destination.index,
        });

        sourceList.cards.forEach((card, index) => {
          updates.push({
            name: card.name,
            custom_kanban_index: index,
          });
        });

        destList.cards.forEach((card, index) => {
          if (card.name !== movedCard.name) {
            updates.push({
              name: card.name,
              custom_kanban_index: index,
            });
          }
        });
      }

      await updateCardOrder({ tasks: updates });

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
