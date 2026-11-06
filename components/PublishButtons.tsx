interface Props {
  isPublished: boolean;
  saving: boolean;
}

const PRIMARY =
  "rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50";
const SECONDARY =
  "rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50";

// Reads which button submitted the form. Native submit buttons keep the browser's checks
// on required fields.
export function wantsPublish(e: React.FormEvent) {
  const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
  return submitter?.value === "publish";
}

// The Enter key triggers the first submit button of a form. It always keeps the current
// state here, so pressing Enter in a field can never publish or unpublish anything.
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
