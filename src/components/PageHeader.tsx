interface Props {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}

export default function PageHeader({ title, eyebrow, subtitle }: Props) {
  return (
    <section className="bg-green-900 px-4 py-12 text-center text-white md:px-6 md:py-16">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold tracking-widest text-gold-light uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-3xl font-bold md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-green-100">{subtitle}</p>}
    </section>
  );
}
