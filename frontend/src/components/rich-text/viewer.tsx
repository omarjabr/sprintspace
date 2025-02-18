import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import BulletList from "@tiptap/extension-bullet-list";

import ListItem from "@tiptap/extension-list-item";

import OrderedList from "@tiptap/extension-ordered-list";

import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

import Heading from "@tiptap/extension-heading";

interface ViewerProps {
  content: string;
  style?: "default" | "prose";
}

const Viewer = ({ content, style }: ViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ListItem,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex gap-x-2 ml-2",
        },
      }),
      Heading.configure({
        HTMLAttributes: {
          class: "text-xl font-bold capitalize",
          levels: [2],
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-2",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-2",
        },
      }),
    ],
    immediatelyRender: false,
    content: content,
    editable: false,
  });

  if (!editor) return <></>;

  const className: string =
    style === "prose" ? "prose-mt-0 prose max-w-none dark:prose-invert" : "";

  return (
    <article className={className}>
      <EditorContent editor={editor} readOnly={true} />
    </article>
  );
};

export default Viewer;
