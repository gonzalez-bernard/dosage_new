import { isNumeric, isUndefined, isString } from "../src/modules/utils/type.js"

class NotElementException extends Error {
  constructor(msg = "Un paramètre fourni n'est pas présent dans une structure"){
    super(msg)
    this.name = "NotElementException"
  }
  
}
var f = function (a, b){
  if (isUndefined(a)) throw new ReferenceError("paramètre absent")
  var y = a+b
  if (y == 5) throw new NotElementException()
  return y
}

try{
  var x = f(4, 1)
  console.log(x)
} catch (e){
  if (e instanceof TypeError)
    console.error(e)
  else if (e instanceof ReferenceError)
    console.error(e)
  else if (e instanceof NotElementException)
    console.error(e)
    console.log(x)
}
