import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import BulletList from "@tiptap/extension-bullet-list";

import ListItem from "@tiptap/extension-list-item";

import OrderedList from "@tiptap/extension-ordered-list";

import Heading from "@tiptap/extension-heading";

import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

import EditorToolbar from "./toolbar/editor-toolbar";

interface EditorProps {
  content: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Editor = ({ content, placeholder, onChange }: EditorProps) => {
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
    editorProps: {
      attributes: {
        class:
          "shadow appearance-none min-h-[150px] border rounded w-full py-2 px-3 bg-white text-black text-sm mt-0 md:mt-3 leading-tight focus:outline-none focus:shadow-outline",
      },
    },
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return <></>;

  return (
    <div className="prose max-w-none w-full border border-input bg-background dark:prose-invert">
      <EditorToolbar editor={editor} />
      <div className="editor">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
};

export default Editor;
