/** STRINGS 
 * 
 * @module modules/utils/utilsString
 * @description
 * Fonctions chaines incluse dans classe uString
 * ***
 * ***export uString dspHtmlLatex***
*/
import {isBoolean, isString, isInteger, isFloat} from "./type.js" 
import * as e from "./errors.js"
class uString extends String {

  /** 
   * 
   * @param {string} str texte de la chaîne 
   */
  constructor(str) {
    super()
    this.val = str
    this.html = ''
    this.array = []
  }

  /** retourne la valeur */
  getVal(){
    return this.val
  }

  /** retourne chaîne HTML */
  getHtml(){
    return this.html
  }

  /** retourne tableau */
  getArray(){
    return this.array
  }

  /*************************************************************** */

  /** Ajoute un motif à une chaîne
   * 
   * @param {string} motif motif à ajouter
   * @param {number} pos position de départ du motif
   * @param {boolean} exist indique si on doit ajouter la chaine si elle existe déjà (false = on insère que si absente)
   * @returns {uString} chaine modifée
   * @file 'modules/utils/string.js'
   */
  insertMotif(motif, pos = 0, exist = false) {
    
    if (! isString(motif)) throw new TypeError(e.ERROR_STR)
    if (! isInteger(pos)) throw new TypeError(e.ERROR_NUM)
    if (pos >= this.val.length) throw new RangeError(e.ERROR_RANGE)
    if (! isBoolean(exist)) throw new TypeError(e.ERROR_BOOL) 
    if (this.val.indexOf(motif) == pos) return this

    let left = this.val.substring(0, pos)
    let right = this.val.substring(pos)
    this.val = left + motif + right
    return this
  }

  /*************************************************************** */

  /** Met la première lettre en majuscule
 * 
 * @returns {uString} Chaine modifiée
 * @file 'modules/utils/string.js'
 */
  capitalize() {
    this.val = this.val.charAt(0).toUpperCase() + this.val.slice(1);
    return this
  }

  /*************************************************************** */

  /** Insère une chaine dans une autre
   * 
   * @param {string} ajout chaine à ajouter
   * @param {boolean} debut vrai si insertion au début
   * @return {uString} chaîne modifiée
   * @file 'modules/utils/string.js'
   */
  insertRegChaine(ajout = '', debut = true) {

    if (!isString(ajout)) throw new TypeError(e.ERROR_STR)
    if (!isBoolean(debut)) throw new TypeError(e.ERROR_BOOL)

    let subst = ''
    if (debut)
      subst = ">" + ajout + `$1</`
    else
      subst = `>$1` + ajout + "</"
    this.val = this.val.replace(/>([\sa-zA-Z0-9,'.\(\)]*)<\//, subst)
    return this
  }

  /*************************************************************** */

  /** Permet d'afficher certains caractères en html 
  * @return {uString}
  * @file 'modules/utils/string.js'
  */
  convertHtmlChar() {
    // @ts-ignore
    const code = {
      ' ' : '&nbsp;',
      '¢' : '&cent;',
      '£' : '&pound;',
      '¥' : '&yen;',
      '€' : '&euro;', 
      '©' : '&copy;',
      '®' : '&reg;',
      '<' : '&lt;', 
      '>' : '&gt;',  
      '"' : '&quot;', 
      '&' : '&amp;',
      '\'' : '&apos;',
      '\n' : '&#10;'
  };
  this.html =  this.val.replace(/[\u00A0-\u9999<>\n\&''""]/gm, (i)=>code[i]);
  //this.html = this.html.replace('&new;','<br>')

    //this.html = this.val.replaceAll("'", "&apos;")
    //return this
    //this.html = .replace(/(&#(\d+);)/g, function(match, capture, charCode) {
    //return String.fromCharCode(charCode);
    //this.html = this.val.replace(/[\\x26\\x0A\\<>'"]/g,function(e){return"&#"+e.charCodeAt(0)+";"})
    
    return this
  }

  /*************************************************************** */

  /** remplace caractères par flèches
 * 
 * @param {string} right suite de caractère pour flèche droite ('->')
 * @param {string} left idem gauche ('<-')
 * @return {uString}
 * @file 'modules/utils/string.js'
 */
  convertArrow(right = "->", left = "<-") {
    if (!isString(right) || !isString(left)) throw new TypeError(e.ERROR_STR)

    if (this.html != '')
      this.html = this.html.replace(right, '&rarr;')
    else
      this.html = this.val.replace(right, '&rarr;')
    this.html = this.html.replace(left, '&larr;')
    return this
  }

  /*************************************************************** */

  /** Transforme une chaîne comportant des indices ou des exposants délimités par un symbole
  * 
  * par ex: '2+' ou _2_ en balises html <sup> et <sub>
  * @param {boolean} html si false on ne traite pas les équivalents html de l'apostrophe
  * @param {Boolean} num_only true: on ne traite que les nombres, false on traite tous les caractères
  * @param {String} exp symbole exposant
  * @param {String}ind symbole indice
  * @return {uString}
  * @file 'modules/utils/string.js'
*/
  convertExpoIndice(html = true, num_only = true, exp = "'", ind = "_") {

    if (!isBoolean(html) || !isBoolean(num_only)) throw new TypeError(e.ERROR_BOOL)
    if (!isString(exp) || !isString(ind)) throw new TypeError(e.ERROR_STR)

    var reg_sup, reg_inf
    const r1 = "([\\d\\+\\-]*)"
    const r2 = "([\\da-z\\(\\)\\+\\-]*)"
    const r0 = "([\\d]*)"
    const r3 = "([\\da-z\\(\\)]*)"
 
    if (num_only) {
      if (html)
        reg_sup = new RegExp(exp + r1 + exp + "|&apos;" + r1 + "&apos;", 'g')
      else
        reg_sup = new RegExp(exp + r1 + exp, 'g')
      reg_inf = new RegExp(ind + r0 + ind, 'g')
    } else {
      if (html)
        reg_sup = new RegExp(exp + r2 + exp + "|&apos;" + r2 + "&apos;", 'g')
      else
        reg_sup = new RegExp(exp + r2 + exp, 'g')
      reg_inf = new RegExp(ind + r3 + ind, 'g')
    }
    if (this.html === '')
      this.html = this.val.replace(reg_sup, "<sup>$1$2</sup>")
    else
      this.html = this.html.replace(reg_sup, "<sup>$1$2</sup>")

    this.html = this.html.replace(reg_inf, "<sub>$1</sub>")
    return this
  }

  /*************************************************************** */

  /** transforme une chaine de type "[a,b]" en tableau
  * 
  * @param {string} sep séparateur par défaut "," 
  * @return {uString}
  * @file 'modules/utils/string.js'
 */
  strListToArray(sep = ",", html = false) {
    
    if (!isBoolean(html)) throw new TypeError(e.ERROR_BOOL)
    if (!isString(sep) ) throw new TypeError(e.ERROR_STR)

    if (html && this.html != '')
      this.array = this.html.replace(/[[\]]/g, '').split(sep)
    else
      this.array = this.val.replace(/[[\]]/g, '').split(sep)
    
    // Analyse chaque élément et les transforme en nombre si nécessaire
    this.array = this.array.map(element => {
      if (isFloat(element)) return parseFloat(element)
      else if (isInteger(element)) return parseInt(element)
      else return element
    })
    return this
  }
}

/*************************************************************** */

/** Affiche un texte au format Latex
 * 
 * @param {String} html : contenu html à afficher
 * @param {String} target : id de la balise d'affichage
 * @file 'modules/utils/string.js'
 */
var dspHtmlLatex = function (html, target) {

  if (! isString(html) || !isString(target)) throw new TypeError(e.ERROR_STR)
  
  // @ts-ignore
  MathJax.typesetPromise().then(() => {
    $(target).html(html)
    // @ts-ignore
    MathJax.typesetPromise();
  }).catch((err) => console.log(err.message));
}

/*************************************************************** */

/** Insère symbole "#"
 * 
 * @param {string} str chaine où inserer un dièse si non présent
 * @returns {uString | string}
 * @file 'modules/utils/string.js'
 */
function insertDiese(str){
  if (str.indexOf("#") == 0)
    return str
  return new uString(str).insertMotif('#').getVal()
}



export {dspHtmlLatex, insertDiese, uString }