// Classe de gestion du graphMenu
import { DOS_BT_DSP_GRAPH, DOS_CHART } from "../../dosage/ui/html_cts.js";
import { DOS_DSP_LST_GRAPH } from "../../dosage/ui/lang_fr.js";

class graphMenu {

  constructor(idRoot, idMenu) {
    this.label = DOS_DSP_LST_GRAPH,
      this.idButton = DOS_BT_DSP_GRAPH,
      this.idRootMenu = idRoot,     // id du div présent dans HTML qui va contenir le menu
      this.idMenu = idMenu,  // id du menu
      this.width = "auto",
      this.imgVisible = '../../static/resources/img/oeil_ouvert.png',
      this.imgNoVisible = '../../static/resources/img/oeil_ferme.png',
      this.imgTrash = '../../static/resources/img/poubelle.png',
      this.menu = {},    // menu déroulant instance de ListMenu
      this.dialog = {}  // instance de Dialog (dom.js)
  }
}

export {graphMenu}
