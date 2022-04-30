// Constantes javascript
const etats = {
    ESPECES_INIT: 0,    /** espèces défines */
    APPAREIL_ON: 0,     /** appareil actif ou inactif */
    APPAREIL_TYPE: 0,   /** pHmètre (1), conductimètre (2) ou potentiomètre (3) branché */
    INDIC_ON: 0,        /** indicateur coloré mis */
    GRAPH_TYPE: 0,      /** type de graphe affiché 1:PH, 2: CD et 3:PT ou 4: multiple*/
    DATA_INIT: 0,       /** données existantes */
    DERIVEE_EXP: 0,     /** dérivée expérimentale affichée */
    TANGENTE: 0,        /** indique que la tangente N°1 est affichée */
    PERPENDICULAIRE: 0, /** perpendiculaire entre tangente */
    MOVE_TANGENTE: 0,   /** déplacement tangente activé */
    GRAPH_SAVE: 0,      /** Sauvegarde des courbes */
    THEORIQUE: 0,       /** courbe théorique affichée */
    PROBLEM: 0,         /** probleme actif */


}

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
    /** Autre Options pour graphe pH */
    GR_OTHER_PH: {
        label: "pH",
        showLine: true,
        backgroundColor: "rgba(255,255,255,0)",
        pointBackgroundColor: "rgba(0,0,0,1)",
        borderColor: "rgba(0,255,0.5)",
        pointRadius: 1,
    },

    /** Autre options pour graphe CD */
    GR_OTHER_CD: {
        label: "Conductance",
        showLine: true,
        backgroundColor: "rgba(255,255,255,0)",
        pointBackgroundColor: "rgba(0,255,0,1)",
        borderColor: "rgba(255,0,0,0.5)",
        pointRadius: 1,
    },

    /** Autre options pour graphe pH */
    GR_OTHER_PT: {
        label: "Potentiel",
        showLine: true,
        backgroundColor: "rgba(255,255,255,0)",
        pointBackgroundColor: "rgba(0,0,255,1)",
        borderColor: "rgba(0,0,255,0.5)",
        pointRadius: 1,
    },

    /** Options pour graphe pH */
    GR_OPTIONS: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.0,
        events: ["click", "mousemove"],
        animation: false,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: "Volume",
                },
                ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 40,
                    stepSize: 5,
                },
                min: 0,
                max: 25,
            },
        }
    },

    GR_OPTIONS_SCALE: {
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: "Volume",
                },
                ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 40,
                    stepSize: 5,
                },
                min: 0,
                max: 25,
            },
        }
    },

    GR_OPTIONS_PH: {
        position:"left",
        display: true,
        title: {
            display: true,
            text: "pH",
        },
        ticks: {
            beginAtZero: true,
            maxTicksLimit: 16,
        },
        max: 14,
        min: 0,
    },

    /** Options pour graphe CD */
    GR_OPTIONS_CD: {
        position:"right",
        display: true,
        title: {
            display: true,
            text: "Conductance",
        },
        ticks: {
            beginAtZero: true,
        },
        min: 0,
        max: 1
    },

    /** Options pour graphe PT */
    GR_OPTIONS_PT: {
        position:"right",
        display: true,
        title: {
            display: true,
            text: "Potentiel",
        },
        ticks: {
            beginAtZero: true,
        },
        min: 0,
        max: 1
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

export { cts, etats }