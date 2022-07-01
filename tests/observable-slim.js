import { copyDeep } from "../src/modules/utils/object.js"

class dosage {

  constructor(a) {
    this.a = a
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }
}

var d = new dosage(3);
d.set('b', 5)

function ftest(x) {
  return 2 * x
}

function oTestEvents(data) {
  switch (data.property) {
    case 'a':
      console.log('a')
      break
    case 'b':
      console.log('b')
      break
  }
}

// @ts-ignore
var oTest = ObservableSlim.create(dosage, false, function (changes) {
  oTestEvents(changes[0])
});

let o = {}
o.c = "zz"

d.set('c', copyDeep(o));
console.log(d)
o.c = 23
console.log(d)
console.log(o)


oTest.a = 3
console.log(d)
oTest.b = "zz"
oTest.c = 230

// @ts-ignore
ObservableSlim.pause(oTest)