import { formatDateTime } from "@/lib/utils";
import { Attachment, Task } from "@/types";
import { useFrappeFileUpload } from "frappe-react-sdk";
import { ArrowUpRight, Ellipsis, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ModalAttachmentsProps {
  data: Task;
  mutate: () => void;
}

const ModalAttachments = ({ data, mutate }: ModalAttachmentsProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>(
    data.attachments
  );

  const { upload, loading, error, progress, reset } = useFrappeFileUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      upload(file, {
        isPrivate: true,
        doctype: "Task",
        docname: data.name,
        fieldname: "attachments",
      }).then((r: any) => {
        setAttachments([
          {
            name: r.name,
            file_name: r.file_name,
            file_url: r.file_url,
            file_type: r.file_type,
            attached_to_name: r.attached_to_name,
            creation: r.creation,
          },
          ...attachments,
        ]);

        mutate();
        reset();
      });
    }
  };

  useEffect(() => {
    if (data.attachments) {
      setAttachments(data.attachments);
    }
  }, [data.attachments]);

  return (
    <div className="flex items-start gap-x-3 w-full">
      <Paperclip className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between -mt-1">
          <p className="font-bold text-neutral-700 mb-2">Attachments</p>
          {/* if attachment.length is less than 5 */}
          {attachments.length < 5 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                className="rounded-sm bg-neutral-200 hover:bg-neutral-300 py-2 h-8"
                onClick={() => {
                  document.getElementById("file-upload")?.click();
                }}
              >
                Add
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          ) : (
            <p className="text-xs text-neutral-500">
              You can only upload a maximum of 5 files
            </p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs">Files</p>
          {attachments &&
            attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="flex items-center h-12 text-sm text-neutral-700 gap-x-2"
              >
                <div className="w-16 h-full flex items-center justify-center rounded-md bg-neutral-200 shadow-sm">
                  <p>{attachment.file_type}</p>
                </div>
                <div className="w-full flex items-center justify-between gap-x-2 mt-1">
                  <div>
                    <span className="line-clamp-1">
                      {attachment?.file_name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatDateTime(
                        new Date(attachment?.creation).toISOString()
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-1">
                    <a
                      href={attachment?.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-8 h-8 aspect-square hover:bg-neutral-300 rounded-sm"
                      >
                        <ArrowUpRight className="w-2 h-2" />
                      </Button>
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-8 h-8 aspect-square hover:bg-neutral-300 rounded-sm"
                    >
                      <Ellipsis className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ModalAttachments;
