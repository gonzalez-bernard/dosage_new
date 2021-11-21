/* dosage_ox.js */

/**
 * @module dosage/dosage_ox
 * @description
 * - Appel script Python pour récupérer les données à partir des informations fournies par espèces.
 * ***
 * ***exports initDosageOX***
 */

import * as cts from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import { html } from "./ui/html.js";
import { MNU_ESPECES,ESPECES} from "./../especes/html_cts.js";
import { getEltID, getElt } from "../modules/utils/html.js";
import {isObject} from "../modules/utils/type.js"
import { createLab,dspMessage, setDosageValues } from './dosage.js'
import {setConcentrations } from './dosage.datas.js'
import {dspContextInfo} from "../infos/infos.js"
import { ES_BT_DSPINFO_OX } from "./../especes/html_cts.js"
import {defGraphCD, defGraphPH, defGraphPT} from "./dosage.graph.js"
import { setEvents, setEventsClick } from "./dosage.events.js";
//import { Dosage } from "../../types/classes";
//var io = require("../../app.js")

// @ts-ignore
var socket = io();

/** Met  à jour les informations du formulaire
 * 
 * - Lance la routine python et récupère les points des courbes 
 * - Initialise le dosage (Crée le graphe sans affichage)
 * @param {Dosage} G global
 * @returns void
 * @use dosage.data~setConcentrations
 * @use dosage_ox~dspMessage
 * @use dosage.datas~setDosageValues
 * @use dosage~createLab
 * @public
 * @file dosage_ox.js
 */
 function initDosageOX(G) {

    // calcule les concentrations
    const c = setConcentrations(G.titre.conc, G.titre.vol, G.titrant.conc, G.titrant.vol, G.eau.vol)
    G.titre.conc = c.titre_conc
    G.titrant.conc = c.titrant_conc

    // Lance calcul dosage
    var datas = {
        type: G.typeDetail,
        c1: G.titre.conc,
        c2: G.titrant.conc,
        v1: G.titre.vol,
        c3: G.reactif.conc,
        c4: G.exc.conc,
        v3: G.reactif.vol,
        v4: G.exc.vol,
        ve: G.eau.vol,
        pH: G.ph,
        v_max: 25,
        eq: JSON.stringify( G.equation.params ),
    }
    socket.emit( "getDosage", { func: "data_dosage_ox", datas: datas } )

    
    socket.on("pyerror", function(){
        dspMessage(ES_BT_DSPINFO_OX)
    })

    // retour du calcul python
    socket.on( "getDosage_ok", function( data ) {

        // si dosage impossible data est une constante affiche message d'erreur
        if ( data == cts.ERR_DOSAGE_IMPOSSIBLE ) {
            dspMessage(ES_BT_DSPINFO_OX)
        } else {

            // initialise la constante dosage avec data
            setDosageValues( G, data )

            // modifie l'état
            G.setState(cts.ETAT_DOS,1)

            // Modifie affichage pHmetre et graph
            //conductimetre.setText( G.scond );

            /** Initialisation du dosage (dosage.js)  */
            let lab = createLab(G)
            
            if (isObject(lab)){

                /** création des instances de graphes */ 

                // Création graphe pH
                G.charts.chartPH = defGraphPH()
                G.charts.chartPH.setEvent("onHover", setEventsClick);
                
                // Création graphe conductance
                G.charts.chartCD = defGraphCD()
            
                // Création graphe potentiometre
                G.charts.chartPT = defGraphPT()

                // Affiche page
                getEltID(ui.DOSAGE).html(html);
                getElt(".title").html(G.title)
                
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
            getEltID(ui.MNU_DOSAGE).addClass('active')
            getEltID(MNU_ESPECES).removeClass('active')
            getEltID(ESPECES).removeClass('active show')
            getEltID(ui.DOSAGE).addClass('active show')
        }
    } );
}

export {initDosageOX}