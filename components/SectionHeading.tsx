export default function SectionHeading({
  small,
  main,
}: {
  small?: string;
  main: string;
}) {
  return (
    <div className="mb-4">
      {small && (
        <div className="mb-1 text-xs font-bold tracking-[0.2em] text-brand-deep">
          {small}
        </div>
      )}
      <h2 className="font-serif text-lg font-bold text-ink md:text-xl">{main}</h2>
    </div>
  );
}
