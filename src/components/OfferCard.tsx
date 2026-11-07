import { formatDate, formatPrice, LONG_DATE } from "@/lib/format";
import type { Opportunity } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function OfferCard({ offer }: { offer: Opportunity }) {
  const type = offer.type === "JOB" ? "Emploi" : "Formation";

  return (
    <Link
      href={`/opportunites/${offer.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-green-700 hover:shadow-lg"
    >
      <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-green-800">
        {offer.imageUrl ? (
          <Image
            src={offer.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-serif text-2xl font-bold text-white">{type}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-widest text-[#8A6D1A] uppercase">{type}</p>
        <h3 className="mt-2 font-serif text-lg font-bold break-words text-gray-900 transition group-hover:text-green-800">
          {offer.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-gray-600">{offer.description}</p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
          <p className="font-bold text-green-800">
            {offer.isFree ? "Gratuit" : `${formatPrice(offer.price)} XOF`}
          </p>
          {offer.deadline && (
            <p className="text-xs text-gray-600">
              Jusqu’au {formatDate(offer.deadline, LONG_DATE)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
