import type { Opportunity } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { focusPosition } from "@/lib/focus";
import { formatDate, formatPrice, LONG_DATE } from "@/lib/format";

interface Props {
  opportunity: Opportunity;
  preload?: boolean;
}

export default function OpportunityCard({ opportunity, preload }: Props) {
  const type = opportunity.type === "JOB" ? "Emploi" : "Formation";

  return (
    <Link
      href={`/opportunites/${opportunity.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-green-700 hover:shadow-lg"
    >
      <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-green-800">
        {opportunity.imageUrl ? (
          <Image
            src={opportunity.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{
              objectPosition: focusPosition(opportunity.imageFocusX, opportunity.imageFocusY),
            }}
            preload={preload}
            fetchPriority={preload ? "high" : undefined}
          />
        ) : (
          <span className="font-serif text-2xl font-bold text-white">{type}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-widest text-gold-dark uppercase">{type}</p>
        <h3 className="mt-2 font-serif text-lg font-bold break-words text-gray-900 transition group-hover:text-green-800">
          {opportunity.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-gray-600">{opportunity.description}</p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
          <p className="font-bold text-green-800">
            {opportunity.isFree ? "Gratuit" : `${formatPrice(opportunity.price)} XOF`}
          </p>
          {opportunity.deadline && (
            <p className="text-xs text-gray-600">
              Jusqu’au {formatDate(opportunity.deadline, LONG_DATE)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
