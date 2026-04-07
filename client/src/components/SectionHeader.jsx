function SectionHeader({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`max-w-4xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="text-[hsl(var(--primary))] text-xs font-bold tracking-widest uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-black mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-[hsl(var(--muted-foreground))] max-w-xl leading-relaxed text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
