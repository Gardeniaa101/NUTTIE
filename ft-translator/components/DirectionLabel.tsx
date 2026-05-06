type DirectionLabelProps = {
  letter: "F" | "T";
  caption: string;
  active: boolean;
  align: "left" | "right";
};

export default function DirectionLabel({
  letter,
  caption,
  active,
  align
}: DirectionLabelProps) {
  const alignmentClass = align === "right" ? "text-right" : "text-left";
  const colorClass = active ? "text-[#1a1a1a]" : "text-[#9c9486]";

  return (
    <div className={`${alignmentClass} min-w-[180px]`}>
      <div className={`text-6xl leading-none italic font-semibold ${colorClass}`}>
        {letter}
      </div>
      <div className="mono text-[10px] uppercase tracking-[0.25em] text-stone-600 mt-1">
        {caption}
      </div>
    </div>
  );
}
