const isColor = function(strColor){
  var s = new Option().style;
  strColor = strColor.toLowerCase();
  s.color = strColor;
  var test1 = s.color == strColor;
  var test2 = /^#[0-9a-f]{6}|[0-9a-f]{8}$/i.test(strColor);
  var test3 = /^rgba\(\d{1,3},\d{1,3},\d{1,3},[1,0]\.?\d{0,2}\)$/i.test(strColor)
  var test4 = /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/i.test(strColor)
  return (test1 == true || test2 == true || test3 == true || test4 == true)
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

function isInteger(n) {
  return n === +n && n === (n|0);
}

function StringColorToValues(str) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str);
  if (result) {
      return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: parseInt(result[4], 16)/255,
      }
  } else {
      result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str);
      if (result) {
          return {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
          }
      } else {
          result = /^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3}),?(\d?.?\d?)\)$/i.exec(str)
          if (result){
              return {
                  r: parseInt(result[1]),
                  g: parseInt(result[2]),
                  b: parseInt(result[3]),
                  a: parseFloat(result[4]),
              }
          } else 
          return null
      }
  }
}

function valuesToRgba(r,g,b,a){
  r = Math.round(r)
  g = Math.round(g)
  b = Math.round(b)
  return "rgba("+r+","+g+","+b+","+a+")"
}

function mixColors(col1, col2, val1, val2){
    
  // on teste la validité des paramètres
  if (! isColor(col1) || !isColor(col2))
      return false
  if ((!isFloat(val1) && !isInteger(val1)) || (!isFloat(val2) && !isInteger(val2)))
      return false
  if (val1 < 0 || val1 > 1 || val2 < 0 || val2 > 1)
      return false

  // Récupère les valeurs
  var c1 = StringColorToValues(col1)
  var c2 = StringColorToValues(col2)

  // On mixe les couleurs
  var r = (val1*c1.r + val2*c2.r)/2
  var g = (val1*c1.g + val2*c2.g)/2
  var b = (val1*c1.b + val2*c2.b)/2
  var a = (val1*c1.a + val2*c2.a)/2

  // renvoie
  return valuesToRgba(r,g,b,a)
}

/**
 * Détecte si un nombre ou une chaine est numérique
 * @param {number | *} n - nombre
 * @returns {boolean | number} - valuer numérique ou false
 */
const isNumeric = function(n)
 {
     if (! isInteger(n))
       return isFloat(n)
     return true
 }

function test_throw(a){
  if (!a)
    throw 'Erreur parametre'
}

/**
 * Recherche la valeur la plus proche d'un élément dans un 
 * tableau
 * @param {array} tab tableau
 * @param {number} value valeur à chercher
 * @return {number} index
 */
 var getArrayNearIndex = function(tab, value, sorted = 0){
  
  if (! Array.isArray(tab))
    throw "Erreur de paramètres"
  
  var len = tab.length;
  var ecarts = []
  if (len == 0)
      return -1
  
  // tri inverse
  if (sorted == -1){
    tab = tab.reverse()   // on inverse le tableau pour une recherche normale
    sorted = 2
  }
  if (sorted == 1 || sorted == 2){
      var a = 0
      var b = len
      var m,x, mini, maxi, result

      // recherche dichotomique
      while (true){
          m = (a+b)/2 >> 0
          x = a-b
          if (a == m && tab[m] == value){
              return  m
          }
          // si encadrement de la valeur cherchée
          if (Math.abs(x) == 1){
            mini = Math.max(0,m-1)    // nécessaire pour effet de bord
            maxi = Math.min(len-1,m+1)

            // on cherche les écarts
            ecarts.push(Math.abs(tab[mini]-value))
            ecarts.push(Math.abs(tab[m]-value))
            ecarts.push(Math.abs(tab[maxi]-value))
            
            // On cherche l'écart minimal
            let min = Math.min(...ecarts)

            // On ajoute à l'indice courant m le décalage (-1,0 ou +1)
            result = Math.max(0,Math.min(len-1,m+ecarts.indexOf(min)-1))

            // inversion de l'index si tableau en tri inverse
            return sorted == 2 ? len-result-1 : result
          }
          // modification desbornes
          if (tab[m] > value)
              b = m
          else 
              a = m
      }
  }
  // tableau non trié
  else {

    // On cherche les écarts pour chaque élément
    for (var i=0;i<len;i++){
        ecarts.push(Math.abs(tab[i]-value))
    }

    // On renvoie l'indice de celui qui a l'écart le plus faible.
    return ecarts.indexOf(Math.min(...ecarts))
  }
}

/**
 * Supprime un élément d'un tableau
 * @param {array} tab tableau 
 * @param {any} elt élément que l'on veut supprimer
 * @param {boolean} copy - true on crée un nouveau tableau sinon on travaille sur le tableau initial
 * @return {array} tableau modifié
 */
 var delArrayElement = function(tab, elt, copy = false){
  let index = tab.indexOf(elt);
  if (index > -1) {
    if (copy){
      let ctab = [...tab]
      ctab.splice(index, 1);
      return ctab
    } else 
      return tab.splice(index, 1);
  }
}

//console.log("test = "+isColor("rgba(12,78,98,0.7)"))
//console.log(isNumeric('123.7'))
//test_throw(false)
//console.log(calc_mixColors('rgba(255,0,0,1)','rgba(255,255,0,0.5)',1.,1.))
var tab = [1.0,1.4,1.7,2.3,2.6,2.8,3.0,3.4,3.5,3.9,4.1,4.3,4.7,4.9,5.2,5.3,5.6,5.8]
//var tab = [1.0,3.4,2.7,1.3,0.6,2.8,3.0,3.9,3.5,4.9,5.1,1.3,2.7,9.9,1.2,0.3,5.6,5.8]
//var rtab = tab.reverse()
//console.log(getArrayNearIndex(rtab,1.55,-1))
delArrayElement(tab,1.0)
console.log(tab)
var c = delArrayElement(tab,1.7,true)
console.log(c)
console.log(tab)