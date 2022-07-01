
import { DOS_CHART } from "../dosage/ui/html_cts.js";
import { Graphs, gGraphListenUpdate } from "../dosage/classes/graphs.js";
import { Dosage, gDosageListenUpdate } from "../dosage/classes/dosage.js"
import { Especes } from "../especes/classes/especes.js";
import { graphMenu } from "../dosage/classes/graphMenu.js";
import { Lab } from "../dosage/classes/lab.js"

// définition d'une instance de Dosage et d'espèces
// @ts-ignore
const gDosage = ObservableSlim.create(new Dosage(), false, (changes) => { gDosageListenUpdate(changes[0]) })
const gEspeces = new Especes()

// @ts-ignore
//const gGraphs = ObservableSlim.create(new Graphs(DOS_CHART), false, (changes) => {gGraphListenUpdate(changes[0])}) 
const gGraphs = new Graphs(DOS_CHART)
const gGraphMenu = new graphMenu("menu", "menu_list")
const gLab = new Lab()
const DEBUG = false

//createGraphMenu()

const getGlobal = () => { return (gDosage) }

export { gDosage, gGraphs, gEspeces, gGraphMenu, gLab, getGlobal, DEBUG }