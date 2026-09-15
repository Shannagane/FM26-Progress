import { normalize } from '../utils/text.js';

// Clé de recherche tolérante : comme normalize(), mais on remplace en plus les
// apostrophes/tirets par des espaces pour absorber les variantes d'écriture du
// CSV FM26 ("Côte d'Ivoire", "Cote d Ivoire", "Bosnie-Herzégovine"...).
function nationKey(str) {
  return normalize(str).replace(/['’-]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Drapeaux "nation" de Football Manager qui ne correspondent pas à un pays
// ISO standard (Angleterre/Écosse/Pays de Galles/Irlande du Nord font partie
// du Royaume-Uni mais ont leur propre sélection et leur propre drapeau en jeu).
// Codes de la librairie flag-icons (pas des codes ISO officiels).
const SPECIAL_CODES = {
  'angleterre': 'gb-eng',
  'england': 'gb-eng',
  'ecosse': 'gb-sct',
  'scotland': 'gb-sct',
  'pays de galles': 'gb-wls',
  'wales': 'gb-wls',
  'irlande du nord': 'gb-nir',
  'northern ireland': 'gb-nir'
};

// Nom de nation (français, normalisé via nationKey) -> code ISO 3166-1 alpha-2.
// Couvre les nations les plus courantes en Football Manager ; complète au
// besoin si une nation de ton effectif n'apparaît pas ici.
const NATION_CODES = {
  // Europe
  'france': 'FR',
  'allemagne': 'DE',
  'espagne': 'ES',
  'italie': 'IT',
  'portugal': 'PT',
  'pays bas': 'NL',
  'hollande': 'NL',
  'belgique': 'BE',
  'suisse': 'CH',
  'autriche': 'AT',
  'pologne': 'PL',
  'republique tcheque': 'CZ',
  'tchequie': 'CZ',
  'slovaquie': 'SK',
  'hongrie': 'HU',
  'roumanie': 'RO',
  'bulgarie': 'BG',
  'grece': 'GR',
  'turquie': 'TR',
  'serbie': 'RS',
  'croatie': 'HR',
  'bosnie herzegovine': 'BA',
  'slovenie': 'SI',
  'macedoine du nord': 'MK',
  'albanie': 'AL',
  'montenegro': 'ME',
  'kosovo': 'XK',
  'ukraine': 'UA',
  'russie': 'RU',
  'bielorussie': 'BY',
  'moldavie': 'MD',
  'lituanie': 'LT',
  'lettonie': 'LV',
  'estonie': 'EE',
  'finlande': 'FI',
  'suede': 'SE',
  'norvege': 'NO',
  'danemark': 'DK',
  'islande': 'IS',
  'irlande': 'IE',
  'republique d irlande': 'IE',
  'royaume uni': 'GB',
  'gibraltar': 'GI',
  'andorre': 'AD',
  'monaco': 'MC',
  'saint marin': 'SM',
  'malte': 'MT',
  'chypre': 'CY',
  'luxembourg': 'LU',
  'israel': 'IL',
  'georgie': 'GE',
  'armenie': 'AM',
  'azerbaidjan': 'AZ',
  'kazakhstan': 'KZ',

  // Afrique
  'maroc': 'MA',
  'algerie': 'DZ',
  'tunisie': 'TN',
  'egypte': 'EG',
  'senegal': 'SN',
  'cote d ivoire': 'CI',
  'cameroun': 'CM',
  'ghana': 'GH',
  'nigeria': 'NG',
  'mali': 'ML',
  'burkina faso': 'BF',
  'guinee': 'GN',
  'rd congo': 'CD',
  'republique democratique du congo': 'CD',
  'congo': 'CG',
  'afrique du sud': 'ZA',
  'zambie': 'ZM',
  'gabon': 'GA',
  'cap vert': 'CV',
  'guinee equatoriale': 'GQ',
  'tanzanie': 'TZ',
  'ouganda': 'UG',
  'kenya': 'KE',
  'ethiopie': 'ET',
  'benin': 'BJ',
  'togo': 'TG',
  'niger': 'NE',
  'mauritanie': 'MR',
  'libye': 'LY',
  'zimbabwe': 'ZW',
  'namibie': 'NA',
  'mozambique': 'MZ',
  'angola': 'AO',
  'rwanda': 'RW',
  'sierra leone': 'SL',
  'gambie': 'GM',
  'comores': 'KM',
  'madagascar': 'MG',

  // Amériques
  'bresil': 'BR',
  'argentine': 'AR',
  'uruguay': 'UY',
  'chili': 'CL',
  'colombie': 'CO',
  'perou': 'PE',
  'equateur': 'EC',
  'paraguay': 'PY',
  'venezuela': 'VE',
  'bolivie': 'BO',
  'etats unis': 'US',
  'canada': 'CA',
  'mexique': 'MX',
  'costa rica': 'CR',
  'panama': 'PA',
  'honduras': 'HN',
  'guatemala': 'GT',
  'jamaique': 'JM',
  'trinite et tobago': 'TT',
  'haiti': 'HT',
  'republique dominicaine': 'DO',
  'el salvador': 'SV',
  'nicaragua': 'NI',
  'cuba': 'CU',
  'suriname': 'SR',
  'curacao': 'CW',

  // Asie / Océanie
  'japon': 'JP',
  'coree du sud': 'KR',
  'coree du nord': 'KP',
  'chine': 'CN',
  'arabie saoudite': 'SA',
  'iran': 'IR',
  'irak': 'IQ',
  'qatar': 'QA',
  'emirats arabes unis': 'AE',
  'jordanie': 'JO',
  'liban': 'LB',
  'syrie': 'SY',
  'inde': 'IN',
  'indonesie': 'ID',
  'thailande': 'TH',
  'vietnam': 'VN',
  'malaisie': 'MY',
  'singapour': 'SG',
  'philippines': 'PH',
  'ouzbekistan': 'UZ',
  'australie': 'AU',
  'nouvelle zelande': 'NZ'
};

// Renvoie le code drapeau (librairie flag-icons, ex: "fr", "gb-eng") pour une
// nation, ou null si inconnue/non reconnue, à partir du texte tel qu'exporté
// par le CSV FM26.
//
// On utilise des drapeaux SVG (flag-icons) plutôt que les emoji Unicode :
// Windows n'affiche pas les emoji drapeau comme de vraies images (il montre
// à la place un petit rectangle gris avec le code pays), ce qui rendait les
// drapeaux invisibles/gris dans l'appli packagée en .exe.
export function getNationFlagCode(nation) {
  const key = nationKey(nation);
  if (!key) return null;
  if (SPECIAL_CODES[key]) return SPECIAL_CODES[key];
  const code = NATION_CODES[key];
  return code ? code.toLowerCase() : null;
}
