interface Props {
  isPublished: boolean;
  saving: boolean;
}

const PRIMARY =
  "rounded-lg bg-green-700 px-6 py-2 text-white transition hover:bg-green-800 disabled:opacity-50";
const SECONDARY =
  "rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50";

export function wantsPublish(e: React.FormEvent) {
  const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
  return submitter?.value === "publish";
}

// Enter triggers the first button, so it must never change the publication state
export default function PublishButtons({ isPublished, saving }: Props) {
  return (
    <>
      {isPublished ? (
        <>
          <button type="submit" value="publish" disabled={saving} className={PRIMARY}>
            Enregistrer
          </button>
          <button type="submit" value="draft" disabled={saving} className={SECONDARY}>
            Retirer de la publication
          </button>
        </>
      ) : (
        <>
          <button type="submit" value="draft" disabled={saving} className={SECONDARY}>
            Enregistrer comme brouillon
          </button>
          <button type="submit" value="publish" disabled={saving} className={PRIMARY}>
            Publier
          </button>
        </>
      )}
      {saving && <span className="self-center text-sm text-gray-500">Enregistrement...</span>}
    </>
  );
}
