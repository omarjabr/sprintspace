import { Loader2 } from "lucide-react";

interface Props {
  text?: string;
}

export const FullPageLoader = ({
  text = "We're getting everything ready for you...",
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <p>{text}</p>
      </div>
    </div>
  );
};
