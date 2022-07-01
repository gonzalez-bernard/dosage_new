//import { setEventsClick } from "../dosage/dosage.events.js"

// Constantes javascript
const ETATS_DOSAGE = {
    ESPECES_INIT: 0,    /** espèces définies après saisie dans especes */
    APPAREIL_ON: 0,     /** appareil activable nécessite ESPECES_INIT, LAB_INIT et DOSAGE_INIT */
    APPAREIL_TYPE: 0,   /** necessite APPAREIL_ON - inactif(0), pHmètre(1), conductimètre(2), potentiomètre (3) branché */
    DOSAGE_ON: 0,       /** on peut vidanger necessite APPAREIL_TYPE*/
    LAB_INIT: 0,        /** laboratoire créé lors du premier dosage*/
    INDIC_ON: 0,        /** indicateur coloré mis */
    DOSAGE_INIT: 0,     /** données existantes dans la structure gDosage */
    PROBLEM: 0,         /** probleme actif */
}

const ETATS_GRAPH = {
    GRAPH_INIT: 0,      /** la structure de graphe a été créé */
    GRAPHMENU_INIT:0,   /** le menu graphe est créé */
    GRAPH_TYPE: 0,      /** type de graphe affiché 0: rien 1:PH, 2: CD et 3:PT ou 4: multiple*/
    DERIVEE_INIT: 0,    /** indique si les valeurs de la dérivée sont calculées */
    DERIVEE_ON: 0,      /** indique si la dérivée est affichée */
    DERIVEE_EXP: 0,     /** dérivée expérimentale affichée */
    TANGENTE: 0,        /** précise les tangentes affichées 0: aucune, 1: tan1, 2: tan2, 3: tan1 et 2*/
    PERPENDICULAIRE: 0, /** perpendiculaire entre tangente 0: aucune, 1: perpendiculaire affichée*/
    MOVE_TANGENTE: 0,   /** déplacement tangente activé */
    GRAPH_SAVE: 0,      /** Sauvegarde des courbes utile pour affichage du menu */
    THEORIQUE: 0,       /** courbe théorique affichée */
    
}

/** liste des états à initialiser lors d'un nouveau dosage */
const ETATS_DOSAGE_INIT = ['APPAREIL_TYPE','INDIC_ON','PROBLEM']
const ETATS_GRAPH_INIT = ['GRAPH_TYPE','DERIVEE_INIT','DERIVEE_ON','DERIVEE_EXP','TANGENTE','PERPENDICULAIRE','MOVE_TANGENTE','THEORIQUE']

const cts = {

    SUFFIXE_LANG: 'fr',
    FOOTER: "<footer><span class='footer'>Dosages - @Copyright 2021 - B. Gonzalez<span></footer>",
    FILE_ZOOM_IN: 'static/resources/img/zoom-in.png',
    FILE_ZOOM_OUT: 'static/resources/img/zoom-out.png',
    FILE_BACKGROUND_LABO: "img/dosage/paillasse_flou.png",

    TYPE_ES_MONOACIDEFORT: 0,
    TYPE_ES_POLYACIDEFORT: 2,
    TYPE_ES_MONOACIDEFAIBLE: 1,
    TYPE_ES_POLYACIDEFAIBLE: 3,
    TYPE_ES_MONOBASEFORTE: 4,
    TYPE_ES_POLYBASEFORTE: 6,
    TYPE_ES_MONOBASEFAIBLE: 5,
    TYPE_ES_POLYBASEFAIBLE: 7,

    TYPE_NUL: 0,
    TYPE_ACIDEBASE: 1,
    TYPE_OXYDO: 2,

    /** dosage simple */
    TYPE_OX_SIMPLE: 1,
    /** dosage en retour */
    TYPE_OX_RETOUR: 2,
    /** dosage en excès */
    TYPE_OX_EXCES: 3,

    // indique l'indicateur utilisé
    INDIC_PHI: 0,
    INDIC_BBT: 1,
    INDIC_RP: 2,
    INDIC_H: 3,
    INDIC_VB: 4,
    INDIC_NET: 5,

    // Mesures
    /** Mesure pH possible */
    MESURE_PH: 1,
    /** Mesure cond. possible */
    MESURE_COND: 2,
    /** Mesure pot. possible */
    MESURE_POT: 4,

    // couleur initiale
    COLOR_INIT: "#ffffff44",

    COLORS: { 'vert_pale': "#f2faeb99", 'violet': "#cf45d988", 'incolore': "#c1e0e866", 'jaune': "#e0c00b88", 'blanc': "#ffffffff", 'brun': "#603315", 'rouge': "#e02f0b88", 'bleu_pale': "#b5d8e888", 'bleu': "#0d9cde88", 'phi_acide': "#ffffff44", 'phi_virage': "#ECDEE7FF", 'phi_base': "#C769A7FF", 'bbt_acide': "#e3fa0fff", 'bbt_virage': "#5dabf8ff", 'bbt_base': "#04dc53ff", 'rp_acide': "#DCE34CFF", 'rp_virage': "#F0963EFF", 'rp_base': "#F52939FF", 'h_acide': "#F72B3BFF", 'h_virage': "#ECB744FF", 'h_base': "#DBE34AFF", 'vb_acide': "#DEE24BFF", 'vb_virage': "#82C767FF", 'vb_base': "#00A7CBFF", 'net_acide': "#ff1111FF", 'net_virage': "#aa11aaFF", 'net_base': "#42c4f0FF", 'jaune_pale': "#fefce1ff", "emp_acide": "#0d9cde88", "emp_virage": "#0d9cde88", "emp_base": "#fefce1ff" },

    // Définition des graphes

    _GR_OPTIONS: {
        chart: {
            type: 'line',
            styleMode: true,
            //width: '595px',
            //height: '595px',
            //animations: {
            //enabled: false,
            //},


        },
        /*stroke: {
            width: 1,
            curve: 'straight'
        },
        */
        plotOptions: {
            series: {
                animation: {
                    duration: 200
                },
                marker: {
                    enabled: true,
                    radius: 3
                }
            }
        },
        title: {
            text: 'Dosage'
        },

        // colors: ['#ff0000','#42C4F0FF'],
        /* grid: {
            position: 'front',
            xAxis: {
                lines: {
                    show: true,
                },
                type: 'numeric'
            },
            yAxis: {
                lines: {
                    show: true,
                },
            }
        }, */
        xAxis: {
            title: {
                text: 'Volume (mL)',
            },
            min: 0,
            max: 24,
            tickInterval: 2,
            gridLineWidth: 1,
            //type: 'numeric',
            //decimalsInFloat: 0,
        }
    },


    _GR_YAXES: {
        yAxis:
        {
            name: '',
            title: {
                text: ''
            },
            min: 0,
            max: 14,
            tickInterval: 1,
            //decimalsInFloat: 0
        },
    },



    // constante de cellule en m
    K: 0.002,

    // constante d'erreur
    ERR_DOSAGE_IMPOSSIBLE: 1,

    // constantes concentration et volume
    /** concentration min titré et titrant */
    CONC_MIN: 0.0001,
    /** concentration max titré et titrant */
    CONC_MAX: 0.1,
    /** volume min titré et titrant */
    VOL_MIN: 5,
    /** volume max titré et titrant */
    VOL_MAX: 20,
    /** concentration min réactif */
    CONC_RMIN: 0.1,
    /** concentration max réactif */
    CONC_RMAX: 1,
    /** volume min eau */
    VOL_EMIN: 0,
    /** volume max eau */
    VOL_EMAX: 50,
    /** volume min réactif */
    VOL_RMIN: 1,
    /** volume max réactif */
    VOL_RMAX: 10,
    /** concentration min excipient */
    CONC_EMIN: 0.1,
    /** concentration max excipient */
    CONC_EMAX: 5,


    // Paramètres pour acquisition des données
    DATA_GET_ESPECES: "getEspeces",
    DATA_GET_ESPECES_OK: "getEspeces_ok",
    DATA_GET_DOSAGE: "getDosage",
    DATA_GET_DOSAGE_OK: "getDosage_ok",
    DATA_GET_PROBLEM: "getProblem",
    DATA_GET_PROBLEM_OK: "getProblem_ok",

    DOS_TITRANT_MIN: 1
}

export { cts, ETATS_DOSAGE, ETATS_DOSAGE_INIT, ETATS_GRAPH, ETATS_GRAPH_INIT }