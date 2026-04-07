function SectionHeader({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`max-w-4xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-black mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-slate-400 max-w-xl leading-relaxed text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
