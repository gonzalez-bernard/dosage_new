import * as M from "../src/modules/utils/number.js"

const a = 0.0565
const b = 12.675
console.log(M.roundDecimal(a,3))
console.log(M.mathArrondir(a,3))
console.log(M.mathArrondir(a,4))
console.log(M.mathArrondir(b,3))
console.log(M.mathArrondir(b,6))
console.group(M.roundPrecision(a,4))
console.group(M.roundPrecision(b,7))

