/** Teste la validité des paramètres
 * 
 * @param  {...any} args liste des arguments à tesetr
 * @returns {boolean}
 */
 const isValidArgs = function(args){
  //args = Array.isArray(args) ? args[0]: args
  for (let i=0; i<args.length; i++){
      if (undefined === args[i] || null === args[i])
          return false
  }
  return true
}

function test (test1, test2){
  if (! isValidArgs(arguments))
    throw "Erreur Paramètre" 
  console.log(test1, test2)
  }


test (1)
