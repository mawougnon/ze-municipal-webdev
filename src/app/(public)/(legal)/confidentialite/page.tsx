import type { Metadata } from "next";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Quelles données le site collecte, pourquoi, combien de temps, et vos droits.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-gray-500">Dernière mise à jour : novembre 2026</p>

      <h2>Qui est responsable de vos données</h2>
      <p>
        L’Association Mairie des Jeunes du Bénin (AMJB), pour la Mairie des Jeunes de Zè, Zè,
        Département de l’Atlantique, Bénin. Contact :{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> ou{" "}
        <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
      </p>

      <h2>Si vous consultez le site</h2>
      <p>
        Le site n’utilise ni publicité, ni outil de mesure d’audience, ni cookie pour les visiteurs.
      </p>

      <h2>Si vous envoyez une candidature</h2>
      <ul>
        <li>
          Données obligatoires : votre nom complet et votre numéro WhatsApp. Sans eux, nous ne
          pouvons ni étudier votre candidature ni vous répondre.
        </li>
        <li>Données facultatives : votre adresse email, votre message et vos documents PDF.</li>
        <li>
          Pour limiter les abus, l’adresse IP est enregistrée avec chaque document envoyé. Elle est
          supprimée avec lui.
        </li>
      </ul>
      <p>
        Ces données servent uniquement à étudier votre candidature à l’offre choisie et à vous
        contacter à ce sujet. Aucune décision n’est prise automatiquement. Elles ne servent pas à la
        prospection.
      </p>

      <h2>Qui peut les voir</h2>
      <p>
        Seuls les administrateurs de la Mairie des Jeunes de Zè y ont accès. Vos données ne sont ni
        vendues ni cédées. Elles sont stockées par nos prestataires techniques, cités dans les
        mentions légales, qui n’agissent que pour faire fonctionner le site.
      </p>

      <h2>Où elles sont conservées</h2>
      <p>
        Hors du Bénin : sur des serveurs en Irlande, chez Vercel (société américaine) et Supabase
        (société de Singapour). Le formulaire vous demande votre accord exprès pour cela avant tout
        envoi.
      </p>

      <h2>Combien de temps</h2>
      <ul>
        <li>Candidature et documents : supprimés au plus tard 6 mois après l’envoi.</li>
        <li>Documents envoyés sans que le formulaire soit validé : supprimés après un jour.</li>
      </ul>
      <p>Ces suppressions sont automatiques.</p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez à tout moment accéder à vos données, les faire corriger ou supprimer, vous
        opposer à leur traitement pour un motif légitime, demander à ne plus figurer dans nos
        fichiers et retirer votre accord. Le retrait ne remet pas en cause ce qui a été fait
        auparavant. Il suffit d’écrire à l’adresse ci-dessus ou par WhatsApp, gratuitement. Nous
        pourrons vous demander de confirmer votre identité.
      </p>
      <p>
        Vous pouvez aussi saisir l’Autorité de Protection des Données à caractère Personnel (APDP)
        du Bénin. Le texte applicable est le Livre V du Code du numérique (loi n° 2017-20).
      </p>
    </>
  );
}
