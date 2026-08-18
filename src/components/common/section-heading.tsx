interface SectionHeadingProps {
  title: string;
  className?: string;
}

export function SectionHeading({ title, className = "" }: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-center gap-4 text-center ${className}`}>
      <span className="h-px w-10 bg-ink/20 sm:w-16" />
      <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      <span className="h-px w-10 bg-ink/20 sm:w-16" />
    </div>
  );
}
