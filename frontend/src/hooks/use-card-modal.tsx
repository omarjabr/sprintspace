import { Task } from "@/types";
import { create } from "zustand";

type CardModalStore = {
  task?: Task;
  mutate: () => void;
  isOpen: boolean;
  onOpen: (task: Task, mutate: () => void) => void;
  onClose: () => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  task: undefined,
  mutate: () => {},
  isOpen: false,
  onOpen: (task: Task, mutate: () => void) =>
    set({ isOpen: true, task, mutate }),
  onClose: () => set({ isOpen: false, task: undefined, mutate: () => {} }),
}));
