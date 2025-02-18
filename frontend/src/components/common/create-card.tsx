interface CreateCardProps {
  label: string;
  onPress: () => void;
}

function CreateCard({ label, onPress }: CreateCardProps) {
  return (
    <button
      type="button"
      className="h-24 rounded-md bg-slate-200 hover:bg-slate-300 transition-colors ease-in-out duration-200 cursor-pointer overflow-hidden text-slate-500"
      onClick={onPress}
    >
      <h3 className="text-sm">{label}</h3>
    </button>
  );
}

export default CreateCard;
