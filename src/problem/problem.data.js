/**
 *  @desc Module problem.data
 *  
 */
import * as cts from "../environnement/constantes.js";
import { uString } from "../modules/utils/string.js";
import { initPage } from "./problem.ui.js"
import { ETAT_PROBLEM } from "../environnement/constantes.js";
import { getData } from "../data.js";

// @ts-ignore
var socket = io();


/** Retourne une promesse avec le problème choisi
 * 
 * @param {object} data indique l'indice du problème {indice: ...}
 * @returns {Promise}
 */
async function getProblem(data) {
  
  const _data = {
    func: "get_problems",
    data: data
  }
  
  return getData(cts.DATA_GET_PROBLEM, cts.DATA_GET_PROBLEM_OK, _data)
}

export { getProblem }