import { uArray } from "../src/modules/utils/array.js";

var t = new uArray([1,2]);
console.log(t)
var p = t.getInterval(10)
console.log(p)

var a = new uArray([{'a':1, 'b':4},{'a':6, 'b':13}, {'a':14, 'b':18}])
console.log(a.getArrayObjectExtremumValues('a','max')) 
console.log(a.getArrayObjectNearIndex('b',15.5)) 

var z = new uArray([1,5,8,12,34,67])
var q = new uArray([67, 45, 24, 11, 8, 3])
var s = new uArray([5,8,3,12,43, 9])

console.log(z.getArrayNearIndex(11,1))
console.log(q.getArrayNearIndex(8,-1))
console.log(s.getArrayNearIndex(41,0))
console.log(s.delArrayElement(43))
var w = q.delArrayElement(24, true)
console.log(q)
