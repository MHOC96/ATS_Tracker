type PageTitleProps = {
  title: string;
  description?: string;
  mono?: string;
};

export function PageTitle({ title, description, mono }: PageTitleProps) {
  return (
    <div className="space-y-2">
      {mono && (
        <p className="linear-mono text-fog uppercase tracking-wider">{mono}</p>
      )}
      <h1 className="text-[24px] font-[510] tracking-[-0.012em] text-paper sm:text-[32px]">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-[13px] leading-relaxed text-fog">{description}</p>
      )}
    </div>
  );
}
