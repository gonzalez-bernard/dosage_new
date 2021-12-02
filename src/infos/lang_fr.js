const INTRO1 = "L'équation est : "
const TXT2 = "L'équation du dosage du réactif restant est : "
const TXT1 = "L'équation de la première réaction est : "
const ACIDE = "acide "
const BASE = "base "
const POLY = "poly"
const MONO = "mono"
const FAIBLE = "faible "
const FORT = "fort(e) "
const TITRAGE = "Titrage "
const INFO1a = "<p>Ce titrage est une réaction acido-basique entre (le ou la) "
const AND = " et "
const BY = " par "
const LE = "(le ou la) "
const INFO1b = "Les couples mis en jeu sont : "
const HOWTO = "Mode d'emploi"


const infoText = "Cette page vous permet de simuler le titrage en versant le réactif titrant présent dans la burette.<p><p>Pour cela il suffit de cliquer sur le robinet de celle-ci ou d'appuyer sur la touche 'V' lorsque le curseur est sur le labo.</p><p>Pour utiliser un indicateur coloré, il faut déplacer le flacon et double-cliquer pour le renverser. Une fois l'indicateur mis, il est impossible d'en rajouter ou d'en changer sans refaire le dosage.<p><p>Pour positionner les appareils (pH-mètre, conductimètre...), il suffit d'un double-clic sur ceux-ci. Dans ce cas, la courbe s'affiche et peut être tracée point par point.</p>"
const infoTitle = []
const info1 = []
const info2 = []

infoTitle.push( "Dosage des ions fer II par les ions permanganate" )
info1.push( "<p>Ce dosage est basé sur une réaction d'<b>oxydoréduction</b>. " +
    "L'ion <b>fer II Fe'2+'</b> est oxydé par l'ion <b>permanganate MnO_4_'-'</b>.</p>" )
info2.push( "<p>L'équivalence du titrage est déterminée par le changement de coloration. " +
    "<p>L'ion permanganate violet se transforme en ion manganèse Mn'2+' incolore. " + "Après l'équivalence, les ions permanganate persistent et la solution prend une couleur violette.</p>" +
    "<p><b><u>Important</u></b> : Cette réaction nécessite la présence d'ion hydronium H_3_O'+' en quantité suffisante, la solution initiale est donc acide.</p>" )

infoTitle.push( "Dosage des ions fer II par les ions dichromate" )
info1.push( "<p>Ce dosage est basé sur une réaction d'oxydoréduction.</p>" +
    "<p>L'ion <b>fer II Fe'2+'</b> est oxydé par l'ion <b>dichromate Cr_2_O_7_'2-'</b>.</p>" )
info2.push( "<p>Le volume à l'équivalence du titrage ne peut pas être déterminé par conductimétrie ni par le changement de coloration. En effet les réactifs (Les ions dichromates sont orangés, les ions fer II vert pâle) et les produits (l'ion chrome III est vert et l'ion fer III jaune-orangé) ont des couleurs proches.<p><p>Il faut procéder à un dosage potentiométrique.</p><p>Cette réaction nécessite la présence d'ion hydronium H_3_O'+' en quantité suffisante, la solution est donc acide.</p>" )

infoTitle.push( "Dosage des ions chlorure par les ions argent" )
info1.push( "<p>Ce dosage utilise une <b>réaction de précipitation</b><p>" +
    "Les ions <b>argent Ag'+'</b> et <b>chlorure Cl'-'</b> précipitent pour donner du <b>chlorure d'argent AgCl</b> blanc" )
info2.push( "<p>Comme la réaction de précipitation a lieu dès que l'on verse le réactif titrant, il faut utiliser un réactif intermédiaire le <b>chromate de potassium K_2_CrO_4_</b>. L'ion chromate CrO_4_'-' forme un précipité rouge avec l'ion argent, mais cette réaction ne se réalise que quand tous les chlorures ont été consommés. Par conséquent l'équivalence est atteinte lorsque le précipité rouge apparaît.</p>" )

infoTitle.push( "Dosage des ions sulfate par les ions baryum" )
info1.push( "<p>Ce dosage utilise une <b>réaction de précipitation</b><p>" +
    "Les ions <b>baryum Ba'2+'</b> et <b>sulfate SO_4_'2-'</b> précipitent pour donner du <b>sulfate de baryum BaSO_4_</b> blanc" )
info2.push( "<p>Comme la réaction de précipitation a lieu dès que l'on verse le réactif titrant, on ne peut déterminer le point d'équivalence par colorimétrie. Il faut donc procéder à un <b>dosage conductimétrique<b>.</p>" )

infoTitle.push( "Dosage des ions nitrate par les ions permanganate" )
info1.push( "<p>Ce dosage est un dosage <b>en retour</b>, il utilise deux réactions d'oxydoréduction.<p><p>En effet, l'ion nitrate est l'oxydant du couple <b>NO_3_'-'(aq)/NO(g)</b> et l'ion permanganate est l'oxydant du couple <b>MnO_4_'-'(aq)/Mn'2+'(aq)</b>. Deux oxydants ne peuvent réagir entre eux, il faut donc faire intervenir une autre espèce réductrice. Pour cela on utilise l'ion fer II du couple <b>Fe'3+'(aq)/Fe'2+'(aq)</b>.</p><p>Dans une première étape, on fait réagir l'ion nitrate sur l'ion Fe II en excès. Le nitrate étant le réactif limitant, il sera intégralement consommé.<p>Dans la seconde étape, on dose les <b>ions fer II</b> restant par le permanganate.</p>" )
info2.push( "<p>Au dela du point d'équivalence, la concentration de l'ion permanganate n'est plus nulle, il apparaît alors la couleur violette caractéristique de ce dernier. La quantité de matière en permanganate est donnée par la relation :</p><b>$$  {\\boldsymbol{n(NO_3^-) = \\frac{n_i(Fe^{2+}) - 5[MnO_4^-]_i \\times V_{eq}}{3}}} $$</b>" +
    "La concentration en nitrate se calcule ainsi :$$ {\\boldsymbol{[NO_3^-] = \\frac{[Fe^{2+}]_i \\times V_i(Fe^{2+}) -5 [MnO_4^-] \\times V_{eq}}{3 \\times V_i(NO_3^-)}}} $$<hr/><b>Il est important de bien choisir les concentrations et volumes du réactif (Fe'2+') et des ions hydronium, pour ne pas avoir des artefacts sur les courbes.</b> " )

infoTitle.push( "Dosage des ions calcium par l'EDTA" )
info1.push( "<p>Ce dosage utilise la <b>formation de complexe</b>.</p><p><b>L'EDTA</b> est l'abréviation de <b>EthylèneDiamineTétraAcétique</b> de formule C_10_N_2_O_8_H_16_</p><img width='400px' src='../../static/resources/img/edta.png'><p>C'est un polyacide, car il y a 6 couples acide/base : 4 R-COOH/ R-COO'-' et 2 =N:/=NH'+'</p><p>On note les différentes formes : H_6_Y'2+', H_5_Y'+', H_4_Y, H_3_Y'-', H_2_Y'2-', HY'3-', Y'4-'</p><p>Pour déterminer le point d'équivalence, on utilise un réactif, le <b>NET (Noir Eriochrome)</b>. Le NET libre est bleu et devient rouge lorsqu'il forme un complexe avec l'ion métallique (Ca). Au début du dosage, la solution d'ion calcium et le NET est donc rouge. Au fur et à mesure de l'ajout d'EDTA, le complexe CaEDTA se forme car il est plus stable que celui avec le NET et la solution devient bleu quand tout le calcium est complexé avec l'EDTA.</p>" )
info2.push( "La réaction s'effectue avec les espèces HY'3-' et Y'4-'. Pour que la réaction soit possible, il faut que le pH soit basique (milieu tampon proche de 10)." )

infoTitle.push( "Dosage des ions cuivre par le thiosulfate" )
info1.push( "<p>Ce <b>dosage indirect</b> utilise deux réactions d'oxydo-réduction.</p><p>On fait d'abord réagir (réduction) les ions <b>cuivre II Cu'2+'</b> (oxydant) avec les ions <b>iodure I'-'</b> (réducteur) en excès. Il se forme alors du <b>diiode</b>. Le diiode formé est alors dosé par l'ion <b>thiosulfate S_2_O_3_'2-'</b></p>" )
info2.push( "<p>Le point d'équivalence est atteint lorsque la solution teintée par le diiode se décolore (la solution prend la teinte blanche du précipité d'iodure cuivreux CuI). On peut vérifier qu'il ne reste plus de diiode en versant quelques gouttes d'empois d'amidon, qui se colore en bleu s'il reste des traces de diiode.</p><p>L'équation globale est donc : <b>2Cu'2+' + 2S_2_O_3_'2-' \u2192 2Cu'+' + S_4_O_6_'2-'</b></p>" )

const DO_INFO_INIT = "Cliquez ou double-cliquez sur un des appareils autorisés. N'oubliez pas d'ajouter éventuellement un indicateur ou un réactif. "
const DO_INFO_P1 = "Pentes : tan 1 = "
const DO_INFO_P2 = " / tan 2 = "
const DO_INFO_ERRPENTE = "Impossible de tracer la perpendiculaire, les 2 tangentes ne sont pas suffisamment parallèles ! Déplacer au moins une des tangentes."
const DO_INFO_PERP1 = " Volume = "
const DO_INFO_PERP2 = " mL - pH = "
const DO_INFO_MOVE = "Vous pouvez déplacer la perpendiculaire, pour que son milieu coupe la courbe. "
const DO_INFO_PERPDEL = "La perpendiculaire a été effacée !"
const DO_INFO_COND = "La mesure de la conductance n'est précise que pour des concentrations <= 0.01 mol/L</br>" + "Constante de cellule K = 2,0 mm"
const DO_INFO_TAN = "Cliquez sur un point de la courbe pour tracer la tangente. Cliquez sur un autre point pour la déplacer. Vous pouvez modifier l'orientation en cliquant et déplaçant les extrémités de la tangente."

export { INTRO1, TXT1, TXT2, ACIDE, AND, BASE, BY, FAIBLE, FORT, HOWTO, INFO1a, INFO1b, info1, info2, infoText, MONO, POLY, infoTitle, LE, TITRAGE, DO_INFO_COND, DO_INFO_TAN, DO_INFO_PERPDEL, DO_INFO_PERP1, DO_INFO_PERP2, DO_INFO_P1, DO_INFO_P2, DO_INFO_MOVE, DO_INFO_INIT, DO_INFO_ERRPENTE }