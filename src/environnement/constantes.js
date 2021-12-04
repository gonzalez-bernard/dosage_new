// Constantes javascript

const SUFFIXE_LANG = 'fr'
const FOOTER = "<footer><span class='footer'>Dosages - @Copyright 2021 - B. Gonzalez<span></footer>"

const FILE_ZOOM_IN = 'static/resources/img/zoom-in.png'
const FILE_ZOOM_OUT = 'static/resources/img/zoom-out.png'
const FILE_BACKGROUND_LABO = "img/dosage/paillasse_flou.png"

const TYPE_ES_MONOACIDEFORT = 0
const TYPE_ES_POLYACIDEFORT = 2
const TYPE_ES_MONOACIDEFAIBLE = 1
const TYPE_ES_POLYACIDEFAIBLE = 3
const TYPE_ES_MONOBASEFORTE = 4
const TYPE_ES_POLYBASEFORTE = 6
const TYPE_ES_MONOBASEFAIBLE = 5
const TYPE_ES_POLYBASEFAIBLE = 7

const TYPE_NUL = 0
const TYPE_ACIDEBASE = 1
const TYPE_OXYDO = 2
const ETAT_INITIAL = 0
const ETAT_ESPECES = 1 // espèces définies
const ETAT_PHMETRE = 0x2 // pHmètre branché
const ETAT_COND = 0x4 // conductimètre branché
const ETAT_POT = 0x8 // potentiomètre actif
const ETAT_INDIC = 0x10 // indicateur coloré mis
const ETAT_GRAPH_PH = 0x20 // graphe pH initié
const ETAT_GRAPH_CD = 0x40
const ETAT_GRAPH_PT = 0x80
const ETAT_DOS = 0x100 // données existantes
const ETAT_DERIVEE = 0x200 // dérivée expérimentale affichée
const ETAT_TANGENTE_1 = 0x800 // indique que la tangente N°1 est affichée
const ETAT_TANGENTE_2 = 0x1000
const ETAT_PERPENDICULAIRE = 0x2000 // perpendiculaire entre tangente
const ETAT_MOVE_TANGENTE = 0x4000
const ETAT_GRAPH_DSP = 0x8000 // graphe affiché 
const ETAT_GRAPH_SAVE = 0x10000 // Sauvegarde des courbes
const ETAT_DOSAGE = 0x20000 // dosage en cours
const ETAT_THEORIQUE = 0x40000 // courbe théorique affichée
const ETAT_PROBLEM = 0x100000 // probleme actif

const TYPE_OX_SIMPLE = 1 // dosage simple
const TYPE_OX_RETOUR = 2 // dosage en retour
const TYPE_OX_EXCES = 3 // dosage en excès

// indique l'indicateur utilisé
const INDIC_PHI = 0
const INDIC_BBT = 1
const INDIC_RP = 2
const INDIC_H = 3
const INDIC_VB = 4
const INDIC_NET = 5

// couleur initiale
const COLOR_INIT = "#ffffff44"

const VERT_PALE = "#f2faeb99"
const VIOLET = "#cf45d988"
const INCOLORE = "#c1e0e866"
const JAUNE = "#e0c00b88"
const BLANC = "#ffffffff"
const ROUGE = "#e02f0b88"
const BLEU_PALE = "#b5d8e888"
const BLEU = "#0d9cde88"
const PHI_ACIDE = "#ffffff44"
const PHI_VIRAGE = "#ECDEE7FF"
const PHI_BASE = "#C769A7FF"
const BBT_ACIDE = "#e3fa0fff"
const BBT_VIRAGE = "#04dc53ff"
const BBT_BASE = "#5dabf8ff"
const RP_ACIDE = "#DCE34CFF"
const RP_VIRAGE = "#F0963EFF"
const RP_BASE = "#F52939FF"
const H_ACIDE = "#F72B3BFF"
const H_VIRAGE = "#ECB744FF"
const H_BASE = "#DBE34AFF"
const VB_ACIDE = "#DEE24BFF"
const VB_VIRAGE = "#82C767FF"
const VB_BASE = "#00A7CBFF"
const NET_ACIDE = "#ff1111FF"
const NET_VIRAGE = "#aa11aaFF"
const NET_BASE = "#42c4f0FF"
const BRUN = "#603315"
const JAUNE_PALE = "#fefce1ff"


const COLORS = { 'vert_pale': VERT_PALE, 'violet': VIOLET, 'incolore': INCOLORE, 'jaune': JAUNE, 'blanc': BLANC, 'brun': BRUN, 'rouge': ROUGE, 'bleu_pale': BLEU_PALE, 'bleu': BLEU, 'phi_acide': PHI_ACIDE, 'phi_virage': PHI_VIRAGE, 'phi_base': PHI_BASE, 'bbt_acide': BBT_ACIDE, 'bbt_virage': BBT_VIRAGE, 'bbt_base': BBT_BASE, 'rp_acide': RP_ACIDE, 'rp_virage': RP_VIRAGE, 'rp_base': RP_BASE, 'h_acide': H_ACIDE, 'h_virage': H_VIRAGE, 'h_base': H_BASE, 'vb_acide': VB_ACIDE, 'vb_virage': VB_VIRAGE, 'vb_base': VB_BASE, 'net_acide': NET_ACIDE, 'net_virage': NET_VIRAGE, 'net_base': NET_BASE, 'jaune_pale': JAUNE_PALE, "emp_acide": BLEU, "emp_virage": BLEU, "emp_base": JAUNE_PALE }

// Définition des graphes
const GR_OTHER_PH = {
    label: "pH",
    showLine: true,
    backgroundColor: "rgba(255,255,255,0)",
    pointBackgroundColor: "rgba(0,0,0,1)",
    borderColor: "rgba(0,255,0.5)",
    pointRadius: 1,
};

const GR_OTHER_CD = {
    label: "Conductance",
    showLine: true,
    backgroundColor: "rgba(255,255,255,0)",
    pointBackgroundColor: "rgba(0,255,0,1)",
    borderColor: "rgba(255,0,0,0.5)",
    pointRadius: 1,
}

const GR_OTHER_PT = {
    label: "Potentiel",
    showLine: true,
    backgroundColor: "rgba(255,255,255,0)",
    pointBackgroundColor: "rgba(0,0,255,1)",
    borderColor: "rgba(0,0,255,0.5)",
    pointRadius: 1,
}

const GR_OPTIONS_PH = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.0,
    events: ["click", "mousemove"],
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

        y: {
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
    },

    animation: {
        duration: 0,
    },
};

const GR_OPTIONS_CD = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    events: ["click", "mousemove"],
    scales: {
        x: {
            display: true,
            title: {
                display: true,
                text: "Volume",
            },
            ticks: {
                beginAtZero: true,
                maxTicksLimit: 25,
                stepSize: 5,
            },
            min: 0,
            max: 25,
        },

        y: {
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
    },
    animation: {
        duration: 0,
    },
};

const GR_OPTIONS_PT = jQuery.extend(true, {}, GR_OPTIONS_CD)
GR_OPTIONS_PT.scales.y.title.text = "Potentiel"

// constante de cellule en m
const K = 0.002

// constante d'erreur
const ERR_DOSAGE_IMPOSSIBLE = 1

// constantes concentration et volume
const CONC_MIN = 0.0001 // concentration titré et titrant
const CONC_MAX = 0.1
const VOL_MIN = 5
const VOL_MAX = 20
const CONC_RMIN = 0.1; // concentration réactif
const CONC_RMAX = 1
const VOL_EMIN = 0 // volume eau
const VOL_EMAX = 50
const VOL_RMIN = 1
const VOL_RMAX = 10
const CONC_EMIN = 0.1 // concentration exipient H+
const CONC_EMAX = 5


// Paramètres pour acquisition des données
const DATA_GET_ESPECES = "getEspeces"
const DATA_GET_ESPECES_OK = "getEspeces_ok"
const DATA_GET_DOSAGE = "getDosage"
const DATA_GET_DOSAGE_OK = "getDosage_ok"
const DATA_GET_PROBLEM = "getProblem"
const DATA_GET_PROBLEM_OK = "getProblem_ok"


export {
    FOOTER, SUFFIXE_LANG, ETAT_ESPECES, ETAT_PHMETRE, ETAT_COND, ETAT_DOS, ETAT_INDIC, ETAT_GRAPH_PH, TYPE_ACIDEBASE, TYPE_OXYDO, TYPE_OX_SIMPLE, TYPE_OX_RETOUR, TYPE_OX_EXCES,
    ETAT_GRAPH_CD, ETAT_DERIVEE, ETAT_TANGENTE_1, ETAT_TANGENTE_2, COLOR_INIT, INDIC_PHI, INDIC_BBT, INDIC_RP, INDIC_H, INDIC_VB, INDIC_NET, ETAT_GRAPH_DSP,
    TYPE_NUL, ETAT_INITIAL, ETAT_MOVE_TANGENTE, ETAT_DOSAGE, ETAT_THEORIQUE, ETAT_PERPENDICULAIRE, K, ERR_DOSAGE_IMPOSSIBLE, ETAT_GRAPH_SAVE, TYPE_ES_MONOACIDEFAIBLE, TYPE_ES_MONOACIDEFORT, TYPE_ES_MONOBASEFAIBLE, TYPE_ES_MONOBASEFORTE, TYPE_ES_POLYACIDEFAIBLE,
    TYPE_ES_POLYACIDEFORT, TYPE_ES_POLYBASEFORTE, TYPE_ES_POLYBASEFAIBLE, CONC_EMAX, CONC_EMIN, CONC_MAX, CONC_MIN, CONC_RMAX, CONC_RMIN, VOL_MAX, VOL_MIN, VOL_RMAX,
    VOL_RMIN, BLANC, BLEU, BLEU_PALE, INCOLORE, JAUNE, ROUGE, VERT_PALE,
    VIOLET, JAUNE_PALE, COLORS, ETAT_POT, ETAT_GRAPH_PT, VOL_EMIN, VOL_EMAX, FILE_ZOOM_IN,
    FILE_ZOOM_OUT, ETAT_PROBLEM, FILE_BACKGROUND_LABO, GR_OPTIONS_PH, GR_OTHER_PT, GR_OTHER_CD, GR_OPTIONS_CD, GR_OTHER_PH, GR_OPTIONS_PT, DATA_GET_DOSAGE, DATA_GET_DOSAGE_OK, DATA_GET_ESPECES, DATA_GET_ESPECES_OK, DATA_GET_PROBLEM, DATA_GET_PROBLEM_OK
};