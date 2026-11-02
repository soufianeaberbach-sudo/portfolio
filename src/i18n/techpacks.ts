import type {Locale} from './locales';
import type {TechPack} from '../data/portfolio';

/** Display-only overlays for the five current Development Samples. Their PDFs,
 * artwork, identifiers, revisions and measurement engineering remain unchanged. */
const words: Record<Exclude<Locale,'en'>, Record<string, readonly [string,string,string]>> = {
  fr: {
    'tp-01': ['Chemise courte à deux poches','Chemise courte','Chemise courte à cinq boutons, poches poitrine plaquées et manches longues à poignets boutonnés.'],
    'tp-02': ['Legging taille haute à bandes','Legging à bandes','Legging extensible taille haute, avec ceinture anatomique et trois bandes latérales contrastantes.'],
    'tp-03': ['Robe longue à bretelles et buste froncé','Robe longue à bretelles','Robe longue coupée en biais, avec panneaux de buste froncés, bretelles réglables et dos en V échancré.'],
    'tp-04': ['Pantalon fuselé sans pinces devant','Pantalon fuselé','Pantalon en chaîne et trame sans pinces devant, avec braguette zippée, poches italiennes et poches dos à simple passepoil.'],
    'tp-05': ['Sweat à capuche à devant épuré','Sweat à capuche','Sweat ample à épaules descendues, capuche doublée dans la matière principale, devant épuré, poignets et bas en bord-côte.'],
  },
  es: {
    'tp-01': ['Camisa corta de dos bolsillos','Camisa corta','Camisa corta de cinco botones, con bolsillos de parche en el pecho y mangas largas con puños abotonados.'],
    'tp-02': ['Legging de tiro alto con bandas','Legging con bandas','Legging elástico de tiro alto con cinturilla anatómica y tres bandas laterales en contraste.'],
    'tp-03': ['Vestido largo de tirantes con busto fruncido','Vestido largo de tirantes','Vestido largo cortado al bies, con paneles de busto fruncidos, tirantes regulables y espalda baja en V.'],
    'tp-04': ['Pantalón de pernera afinada sin pinzas delanteras','Pantalón de pernera afinada','Pantalón de tejido plano sin pinzas delanteras, con bragueta de cremallera, bolsillos inclinados y bolsillos traseros de un vivo.'],
    'tp-05': ['Sudadera con capucha de delantero limpio','Sudadera con capucha','Sudadera holgada de hombro caído, con capucha forrada en el mismo tejido, delantero limpio y puños y bajo de canalé.'],
  },
};
export function translateTechPack(pack:TechPack,locale:Locale):TechPack {
  if(locale==='en')return pack;
  const row=words[locale][pack.id];
  if(!row)throw new Error(`Missing current ${locale} tech pack copy: ${pack.id}`);
  const [title,garmentType,description]=row;
  const category=locale==='fr'?(pack.gender==='womenswear'?'Femme':'Homme'):(pack.gender==='womenswear'?'Mujer':'Hombre');
  const alt=locale==='fr'?`Page de garde de ${pack.styleCode}, ${title} : dossier technique de développement ${category.toLowerCase()}, avec échantillons de matières et dessins techniques à plat de face et de dos.`:`Portada de ${pack.styleCode}, ${title}: ficha técnica de desarrollo de ${category.toLowerCase()}, con muestras de tejidos y dibujos técnicos del delantero y la espalda.`;
  return {...pack,title,garmentType,description,category,coverImage:pack.coverImage&&{...pack.coverImage,alt}};
}
