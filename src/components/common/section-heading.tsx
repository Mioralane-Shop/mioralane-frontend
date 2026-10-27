interface SectionHeadingProps {
  title: string;
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  title,
  className = "",
  titleClassName = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-center sm:gap-4 ${className}`}>
      <span className="h-px w-6 shrink-0 bg-ink/20 sm:w-16" />
      <h2 className={`text-balance font-display text-lg font-bold uppercase leading-tight tracking-tight text-ink sm:text-2xl ${titleClassName}`}>
        {title}
      </h2>
      <span className="h-px w-6 shrink-0 bg-ink/20 sm:w-16" />
    </div>
  );
}
