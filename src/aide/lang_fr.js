const H_TITLE = "AIDE"
const H_INTRO = "Cliquez sur la rubrique qui vous intéresse : "
const H_UI = "Utilisation de l'interface"
const H_AC = "Titrage acido-basique"
const H_OX = "Titrage d'oxydoréduction"
const H_CP = "Titrage par formation de complexe ou d'un précipité"
const H_UI_DETAIL = "<h4>"+H_UI+"</h4><p>L\'onglet <b>ESPECES</b> permet de choisir le type de dosage, les différentes espèces ainsi que les paramètres (concentrations, volumes)</p>" +
"<p>L\'onglet <b>DOSAGE</b> s\'active quand les données des espèces sont renseignés. Le labo permet de simuler le dosage en versant le réactif titrant [clic sur burette ou touche V]. Les appareils de mesure disponibles sont activés par un double clic. La courbe adaptée s\'affiche alors.</p>" +
"<p>L\'onglet <b>PROBLEMES</b> affiche différentes situations de dosage. Une réponse numérique est attendue, après avoir simulé le dosage avec le <u>labo</u></p>" +
"<p>Enfin l\'onglet <b>Aide</b> affiche la page présente.</p>"
const H_AC_DETAIL ="<h4>"+H_AC+"</h4><p>Pour titrer un acide on utilise une base forte et inversément un acide fort est le réactif titrant d'une base</p><p>Le volume équivalent peut être déterminé soit en utilisant un indicateur coloré adapté, soit en mesurant le pH.</p><p>Dans certains cas on peut aussi mesurer la conductance de la solution</p><p>Le graphe affiche des boutons permettant:<ul><li>de tracer les tangentes et la perpendiculaire aux tangentes pour trouver le volume et le pH à l'équivalence</li><li>d'afficher la courbe dérivée</li><li>d'afficher la courbe théorique</li></ul></p>"
const H_OX_DETAIL = "<h4>"+H_OX+"</h4><p>Ces réactions font intervenir des couples oxydant/réducteur</p><p>Le dosage peut être simple, une espèce réductrice réagit avec une espèce oxydante ou faire intervenir une espèce supplémentaire comme dans un dosage en retour</p><p>On peut utiliser un conductimètre ou parfois mesurer le potentiel avec un millivoltmètre muni d'électrodes adéquates</p>"
const H_CP_DETAIL = "<h4>"+H_CP+"</h4><p>Certains titrages utilisent la formation de d'entités chimiques : les complexes (Un complexe est souvent constitué d'un cation métallique entouré de plusieurs ligands anioniques ou neutres qui délocalisent une partie de leur densité électronique. Wikipédia.)</p><p>Enfin les espèces réagissantes peuvent froméer des précipités</p>"

export {H_TITLE, H_AC, H_AC_DETAIL, H_CP, H_CP_DETAIL, H_INTRO, H_OX, H_OX_DETAIL, H_UI, H_UI_DETAIL}