import * as cts from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as e from "../modules/utils/errors.js"
import { getElt, getEltID } from "../modules/utils/html.js";
import {G, getGlobal} from "../environnement/globals.js";
import { isObject } from "../modules/utils/type.js";
import { getInfoPH } from "../especes/especes.infos.js";
import { set_drag } from "./ui/initFlacon.js"
import { setPHmetre } from "./ui/initPhmetre.js"
import {resetMesures} from "./dosage.datas.js"
import {setButtonState, setButtonClass, setClassMenu} from "./dosage.ui.js"
import {vidage} from "./dosage.js"
import { dspInfo, dspContextInfo } from "../infos/infos.js";

/** Définit events
 *
 * @param {tLab} lab
 * @private 
 * @use vidage
 *
 */
function setEvents(lab) {
  const _this = G.charts.chartPH
  if (!isObject(lab.canvas)) throw new TypeError((e.ERROR_OBJ))

  // Initie un listener d'événement de redimensionnement
  window.addEventListener("resize", debouncedResize);
  var debounceTimeoutHandle;

  /* ------------------------------------------- */
  function debouncedResize() {
      clearTimeout(debounceTimeoutHandle); // Clears any pending debounce events
      debounceTimeoutHandle = setTimeout(resizeCanvas, 100);
  }

  /* ------------------------------------------- */

  /** canvas resize
   *
   */
  function resizeCanvas() {

      if (G.test('etat',cts.ETAT_PERPENDICULAIRE)) {
          G.setState(cts.ETAT_PERPENDICULAIRE, -1)
          _this.dspPerpendiculaire();
      }
  }

  /* ------------------------------------------- */

  /** Réinitialise
   * 
   * @param {boolean} all 
   */
  function reset(all = false) {

      // réinitialise les constantes de dosage
      resetMesures(all);
      
      // réinitialise la burette
      lab.burette.reset();

      // réinitialise le bécher
      lab.becher.reset(G.solution.vol);

      lab.burette.canvas.redraw();
      
      // actualise l'affichage
      lab.phmetre.setText(G.sph);
      lab.conductimetre.setText(G.scond);
      lab.potentiometre.setText(G.spot)

      // supprime l'indicateur
      G.indic = undefined

      // réinitialise les graphes
      if (G.test('etat',cts.ETAT_GRAPH_PH)) {
          if (G.test('etat',cts.ETAT_TANGENTE_1))
              _this.removeData(_this.getChartByProp('id', 'tan1'))
          if (G.test('etat',cts.ETAT_TANGENTE_2))
              _this.removeData(_this.getChartByProp('id', 'tan2'))
          if (G.test('etat',cts.ETAT_PERPENDICULAIRE))
              _this.removeData(_this.getChartByProp('id', 'perp'))
          if (G.test('etat',cts.ETAT_DERIVEE))
              _this.removeData(_this.getChartByProp('id', 'derivee'))
          if (G.test('etat',cts.ETAT_THEORIQUE))
              _this.removeData(_this.getChartByProp('id', 'theo'))
      }

      if (G.test('etat',cts.ETAT_GRAPH_CD) && G.charts.chart_cd){
          G.charts.chart_cd.clearData(0);
          G.charts.chart_cd.data = []
      }
      if (G.test('etat',cts.ETAT_GRAPH_PH) && G.charts.chartPH){
          G.charts.chartPH.clearData(0);
          G.charts.chartPH.data = []
      }
      if (G.test('etat',cts.ETAT_GRAPH_PT) && G.charts.chart_pt){
          G.charts.chart_pt.clearData(0);
          G.charts.chart_pt.data = []
      }
          
  }

  /* ------------------------------------------- */
  /* checkbox pour conservation des courbes */
  /* ------------------------------------------- */
  getEltID(ui.DOS_CHK_GRAPH).on("change", function () {
      if (!getElt(ui.DOS_CHK_GRAPH).is(":checked"))
          G.setState(cts.ETAT_GRAPH_SAVE, -1);
  });

  /* ------------------------------------------- */
  // bouton reset (réinitialise le dosage)
  /* ------------------------------------------- */
  getEltID(ui.DOS_BT_RESET).on("click", function () {
      reset(false)
      G.setState(cts.ETAT_INDIC, -1)
      // désactive les boutons
      setButtonClass("")
      set_drag(lab.flacons, true)
  })

  /* ------------------------------------------- */
  // bouton new_dosage (réinitialise lee espèces)
  /* ------------------------------------------- */
  getEltID(ui.DOS_BT_NEW_DOSAGE).on("click", function () {

      reset(true)
      setPHmetre(lab.phmetre, lab.becher);
      
      // désactive les boutons
      setButtonClass("")
      
      // On bascule sur le premiInformation : Cliquez ou double-cliquez sur un des appareils autorisés. N'oubliez pas d'ajouter éventuellement un indicateur ou un réactif.Information : Cliquez ou double-cliquez sur un des appareils autorisés. N'oubliez pas d'ajouter éventuellement un indicateur ou un réactif.er onglet
      setClassMenu();
  });

  /* ------------------------------------------- */
  // Vidange burette avec touche 'v'
  /* ------------------------------------------- */
  lab.canvas.bind("keydown", function () {
      var key = lab.canvas.keyboard.getKeysDown();
      // @ts-ignore
      if (key.includes(86) && G.test('etat',cts.ETAT_ESPECES)) {
          vidage(lab, G);
      }
  });

  /* ------------------------------------------- */
  // fin du vidage
  /* ------------------------------------------- */
  lab.canvas.bind("keyup", function () {
      lab.burette.leave("burette_o");
  });

  /* ------------------------------------------- */
  // bouton affichage dérivée
  /* ------------------------------------------- */
  getEltID(ui.DOS_BT_DERIVEE).on("click", function () {
      if (G.test('etat',cts.ETAT_DERIVEE)) {
          G.event = 0
          let idx = _this.getChartByProp("id", "derivee")
          if (!idx) return;
          _this.removeData(idx);
          setButtonClass(ui.DOS_BT_DERIVEE, 0)

      } else {
          _this.dspDerivee()
          setButtonClass(ui.DOS_BT_DERIVEE, 1)

      }
      G.setState(cts.ETAT_MOVE_TANGENTE,0)
      G.setState(cts.ETAT_DERIVEE,-1)
  });

  /* ------------------------------------------- */
  // boutons affichage tangentes
  /* ------------------------------------------- */
  getEltID(ui.DOS_BT_TAN1).on("click", function () {
      _setTangente(1, cts.ETAT_TANGENTE_1, ui.DOS_BT_TAN1)
  });

  // affichage tangente N°2
  getEltID(ui.DOS_BT_TAN2).on("click", function () {
      _setTangente(2, cts.ETAT_TANGENTE_2, ui.DOS_BT_TAN2)
  });

 

  /* ------------------------------------------- */
  // affichage perpendiculaire
  /* ------------------------------------------- */
  getEltID(ui.DOS_BT_PERP).on("click", function () {

      // si pas de perpendiculaire tracée
      if (G.test('etat',cts.ETAT_THEORIQUE)) {
          G.event = 0
          _this.dspPerpendiculaire(1)
          _this.indiceTangentes[2] = 0
          setButtonClass(ui.DOS_BT_PERP, 0)
          setButtonState()
          G.setState(cts.ETAT_PERPENDICULAIRE, -1)
      } else {
          _dspPerpendiculaire(_this)
          
      }
  });

  /* ------------------------------------------- */
  // affiche graphe théorique
  /* ------------------------------------------- */
  getEltID(ui.DOS_BT_COTH).on("click", function () {

      if (G.test('etat',cts.ETAT_THEORIQUE)) {
          G.event = 0
          _this.dspCourbeTheorique(1)
          setButtonClass(ui.DOS_BT_COTH, 0)
          setButtonState()
          getEltID(ui.DOS_BT_DERIVEE).prop("disabled", true)
      } else {
          setButtonClass(ui.DOS_BT_COTH, -1)
          _this.dspCourbeTheorique(0)
          getEltID(ui.DOS_BT_DERIVEE).removeAttr("disabled")
      }
      G.setState(cts.ETAT_MOVE_TANGENTE,0)
      G.setState(cts.ETAT_THEORIQUE,-1)
  });

  // affiche informations
  getEltID(ui.DOS_BT_DSPINFO).on("click",
      null, {
      idModal: "id_dos_modal",
      title: "Info",
      setMsg: getInfoPH,
      data: getGlobal,
      idContainer: ui.DOS_DIV_INFO,
      labelBtClose: "Quitter",
      idBtClose: "dos_info_close",
      //equation: G.equation,
      //equation_id: G.equation.id,
  },
      dspInfo
  );
}

 /** action lors du clic sur boutons tangente
 * 
 * @param {number} idTangente N° de la tangente
 * @param {number} ctsTangente constante identifiant tangente
 * @param {string} idBtTangente ID bouton
 * @use _dspPerpendiculaire, setButtonState, setButtonClass
 */
  function _setTangente(idTangente, ctsTangente, idBtTangente){

    const _this = G.charts.chartPH
    // si tan déjà affichée on l'efface
    if (G.test('etat',ctsTangente)) {
        G.event = 0
        _this.delTangente(idTangente);
        G.setState(ctsTangente,0)
  
        // supprime la perpendiculaire si existe
        if (G.test('etat', cts.ETAT_PERPENDICULAIRE))
            _dspPerpendiculaire(_this)
  
        setButtonState()
    } else {
        G.event = idTangente
        dspContextInfo("dspTangente")
    }
    G.setState(cts.ETAT_MOVE_TANGENTE,0)
    setButtonClass(idBtTangente, -1)
  }

/** Gestion de la perpendiculaire
 * 
 * @param {Graphx} _this - instance graphx
 * @access private
 * @memberof dosage.events
 */
 function _dspPerpendiculaire(_this){
  const dsp_perp = _this.dspPerpendiculaire(G.test('etat',cts.ETAT_PERPENDICULAIRE) ? 1:0)
  if (dsp_perp == 1) {
      // affichage réussi
      setButtonClass(ui.DOS_BT_PERP, -1)
      dspContextInfo("perp_move")
      G.setState(cts.ETAT_PERPENDICULAIRE,1)
  } else if (dsp_perp == -1) {
      // erreur d'affichage
      dspContextInfo("err_pentes")
  } else {
      // perpendiculaire effacée
      setButtonClass(ui.DOS_BT_PERP, -1)
      dspContextInfo("perp_del")
      G.setState(cts.ETAT_PERPENDICULAIRE,0)
      G.setState(cts.ETAT_MOVE_TANGENTE,0)
  }
}

  /** Gère le clic sur les courbes
 *
 * @param {Event} evt
 * @param {unknown[]} elt
 * @returns {boolean}
 * @use delTangente, dspTangente, movTangente, setButtonState
 *
 * Clic sur bouton tangente X: on fixe ETAT_TANGENTE_X = 1, ETAT_TANGENTE_Y = 0, ETAT_MOVE_TANGENTE = 0, ETAT_PERPENDICULAIRE = 0
 * 
 * Clic sur point du canvas :
 * - si aucune courbe on annule les états
 * - si courbe pH et ETAT_TANGENTE_X actif on vérifie la présence d'une tangente précedente, on l'efface et on trace la nouvelle
 * - si courbe tangente on bascule entre mode normal et mode move.
 *  
 * Déplacement sur canvas:
 * - si aucune courbe on annule les états
 * - si courbe pH on ne fait rien
 * - si courbe tangente et ETAT_MOVE_TANGENTE actif on déplace la tangente
 *
 *
 *  */
 function setEventsClick(evt, elt = undefined) {

  const _this = G.charts.chartPH
  let chartIndex, chartID, selectedPoint

  // On désactive tout
     if (elt.length != 0) {

         chartIndex = _this.getEventIndexChart(elt);
         chartID = _this.getIdChart(chartIndex).id
         selectedPoint = _this.getEventIndicePoint(elt)


         // si type == clic
         if (evt.type == "click") {

             // paramètre du clic
             const idTangente = G.event     // défini par clic sur bouton tan1 ou tan2

             // si courbe expérimentale pH
             if (chartIndex == 0) {

                 // test si on est en mode affichage des tangentes
                 if (G.event != 1 && G.event != 2)
                     return false

                 // test si tangente déjà tracée
                 if (_this.indiceTangentes[idTangente - 1] != 0) {

                     // on ne fait rien si déjà tracée au même point
                     if (selectedPoint == _this.indiceTangentes[idTangente - 1])
                         return false;

                     _this.delTangente(idTangente);
                     _this.indiceTangentes[idTangente - 1] = 0
                 }

                 // Affiche la tangente
                 _this.dspTangente(chartIndex, elt, idTangente);

                 // enregistre l'indice du point de la tangente
                 _this.indiceTangentes[idTangente - 1] = selectedPoint;
                 if (idTangente == 1)
                     G.setState(cts.ETAT_TANGENTE_1, 1)  // tan1 tracée
                 else
                     G.setState(cts.ETAT_TANGENTE_2, 1)  // tan1 tracée

                 /*
             // active bouton tangente N°2
             getEltID(ui.DOS_BT_TAN2).removeAttr("disabled");
             if (idTangente == 2)
                 getEltID(ui.DOS_BT_PERP).removeAttr("disabled");
             setButtonClass("")
             */
                 setButtonState()

             } else if (chartID == "tan1" || chartID == "tan2" || chartID == "perp") {

                 // active ou désactive le déplacement de la tangente
                 if (selectedPoint == 1) return  // pas d'action sur le point tangent
                 G.setState(cts.ETAT_MOVE_TANGENTE, -1)  // tan1 tracée
                 G.charts.tangente_point = _this.getEventIndicePoint(elt);
                 G.charts.activePoints = _this.getData(elt);
             }

             // déplacement souris
         } else if (evt.type == "mousemove" && G.test('etat', cts.ETAT_MOVE_TANGENTE)) {
             if (selectedPoint == G.charts.tangente_point) {
                 _this.movTangente(evt, G.charts.tangente_point, G.charts.activePoints, chartIndex);
             }
         }
     }
 }

/********************************************************** */


export {setEvents, setEventsClick}