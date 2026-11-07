import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, directeur de la publication et hébergeurs du site.",
};

export default function LegalNoticePage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="text-sm text-gray-500">Dernière mise à jour : novembre 2026</p>

      <h2>Éditeur du site</h2>
      <p>
        Le site de la Mairie des Jeunes de Zè est édité par l’Association Mairie des Jeunes du Bénin
        (AMJB), autorisation n° 2021/029/PDO/SG/SAG/SA du 10 mai 2021.
      </p>
      <ul>
        <li>Adresse : Zè, Département de l’Atlantique, Bénin</li>
        <li>
          Téléphone : <a href="tel:+2290198704584">+229 01 98 70 45 84</a>
        </li>
        <li>
          Email :{" "}
          <a href="mailto:mairiedesjeunesdeze2025@gmail.com">mairiedesjeunesdeze2025@gmail.com</a>
        </li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>Astérix GOUDEAGBE, président de l’Association Mairie des Jeunes du Bénin.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par deux prestataires. Ses données sont conservées sur des serveurs en
        Irlande.
      </p>
      <ul>
        <li>
          Application : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (
          <a href="mailto:privacy@vercel.com">privacy@vercel.com</a>)
        </li>
        <li>
          Base de données et fichiers : Supabase Pte. Ltd., 65 Chulia Street #38-02/03, OCBC Centre,
          Singapour 049513 (<a href="mailto:privacy@supabase.com">privacy@supabase.com</a>)
        </li>
      </ul>

      <h2>Droit de réponse</h2>
      <p>
        Toute personne nommée ou désignée sur ce site peut demander à y répondre, ou demander la
        correction ou la suppression du contenu, en écrivant à l’adresse ci-dessus.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, photos et logos de ce site appartiennent à leurs auteurs et ne peuvent être
        réutilisés sans leur accord.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Consultez la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </>
  );
}
