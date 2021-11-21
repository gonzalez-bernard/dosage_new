/** 
 * @module dosage/dosage_ph
 * @description 
 * - Appel script Python pour calculer les valeurs de pH et volumes
 * ***
 * ***export : initDosagePH***
*/
import * as cts from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import { html } from "./ui/html.js";
import { MNU_DOSAGE, DOSAGE } from "./ui/html_cts.js";
import { MNU_ESPECES,ESPECES} from "./../especes/html_cts.js";
import { getEltID, getElt } from "../modules/utils/html.js";
import { isObject} from "../modules/utils/type.js"
import { dspMessage,setDosageValues, createLab} from "./dosage.js";
import { ES_BT_DSPINFO_AC } from "./../especes/html_cts.js"
import { dspContextInfo} from "../infos/infos.js"
import {defGraphCD, defGraphPH, defGraphPT} from "./dosage.graph.js"
import { setEvents } from "./dosage.events.js";
//import { Dosage } from "../../types/classes.js";
//var io = require("../../app.js")


// @ts-ignore
var socket = io();

/** Fonction utilisée lors de callback de dosage_ui
 *
 * - Lance la routine python et récupère les points des courbes 
 * - Initialise le dosage (Crée le graphe sans affichage)
 * @param {Dosage} G global
 * @returns void
 * @public
 * 
 * @use dosage~setConcentrations, dosage~dspMessage, dosage~setDosageAcValues
 * @use dosage~createLab
 * 
 * @file dosage_ph.js
 * @external especes.events
 */
function initDosagePH(G) {

    // calcule les concentrations
    /*
    const c = setConcentrations(G.titre.conc, G.titre.vol, G.titrant.conc, G.titrant.vol, G.eau.vol)
    G.titre.conc = c.titre_conc
    G.titrant.conc = c.titrant_conc
    */
   
    // lance calcul du pH
    var data = {
        func: "data_dosage_ph",
        datas: {
            type: 1 - ( G.titre.type  % 2 ),
            c1: G.titre.conc,
            c2: G.titrant.conc,
            v1: G.titre.vol,
            ve: G.eau.vol,
            pK: G.titre.pka,
            v_max: 25,
            esp1: G.titre,
            esp2: G.titrant,
        }
    }
    socket.emit( "getDosage", data );

    // retour du calcul python
    socket.on( "getDosage_ok", function( data ) {

        // si dosage impossible data est une constante
        if ( data == cts.ERR_DOSAGE_IMPOSSIBLE ) {
            dspMessage(ES_BT_DSPINFO_AC);
        } else {

            // initialise la constante dosage avec data
            setDosageValues( G, data, 'ph' );

            // modifie l'état
            G.setState(cts.ETAT_DOS,1)
            
            /** Initialisation du dosage (dosage.js)  */
            const lab = {}
            if (isObject(lab)){
                // Affiche page
                getEltID(ui.DOSAGE).html(html);
                getElt(".title").html(G.title)
            
                let lab = createLab(G)
            
                /** création des instances de graphes */ 
                G.charts = undefined

                // Création graphe pH
                G.charts.chartPH = defGraphPH()

                // Création graphe conductance
                G.charts.chartCD = defGraphCD()
            
                // Création graphe potentiometre
                G.charts.chartPT = defGraphPT()

                // Modifie affichage pHmetre et graph
                lab.phmetre.setText(G.sph);

                // définition des événements
                setEvents(lab);

                // Affiche info
                dspContextInfo("init")
            } else {
                getEltID(ui.DOS_DIV_GRAPH ).hide()
            }

            // On bascule sur dosage
            getEltID(MNU_DOSAGE).addClass('active').trigger('add_class')
            getEltID(MNU_ESPECES).removeClass('active')
            getEltID(ESPECES).removeClass('active show')
            getEltID(DOSAGE).addClass('active show')
        }
    } )
}

export { initDosagePH };