/** Retourne le nom du fichier
 * 
 * @param {string} str chemin complet du fichier
 * @returns string
 */
const getFileName = function (str) {
    // @ts-ignore
    return str.split('\\').pop().split('/').pop();
}

/** Retourne le chemin complet
 * 
 * @param {string} str url fichier
 * @returns 
 */
const getDirName = function (str){
    return str.match(/.*\//);
}

export {getFileName, getDirName}