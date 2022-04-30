
import { DOS_CHART } from "../dosage/ui/html_cts.js";
import { Graphs } from "../dosage/classes/graphs.js";
import { Dosage } from "../dosage/classes/dosage.js"
import { Dosages } from "../dosage/classes/dosages.js"
import { Especes } from "../especes/classes/especes.js";
import { graphMenu } from "../dosage/classes/graphMenu.js";
import {Lab} from "../dosage/classes/lab.js"

// définition d'une instance de Dosage et d'espèces
const gDosage = new Dosage()
const gEspeces = new Especes()
const gDosages = new Dosages()
const gGraphs = new Graphs(DOS_CHART)
const gGraphMenu = new graphMenu("menu","menu_list")
const gLab = new Lab()

gDosages.dosages.push(gDosage)
//initGraphMenu()

function getGlobal() {
    return gDosages.getCurrentDosage()
}

export { gDosage, gDosages, gGraphs, gEspeces, gGraphMenu, getGlobal, gLab }