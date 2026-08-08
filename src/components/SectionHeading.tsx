interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}

/**
 * Editorial section heading: uppercase eyebrow, serif title, hairline rule.
 */
export default function SectionHeading({ eyebrow, title, action }: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="font-display text-2xl leading-tight text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      <div className="hairline" />
    </div>
  );
}
