import * as dom from "../src/modules/dom.js"
import * as obj from "../src/modules/utils/object.js"

var inputs = {}
var o = {
  id: 'test_input',
  cls: 'test',
  size: 4,
  action: '#',
  value: 0.01,
  pattern: "[0-9.]{1,7}",
  attrs: "required",
  max: 10,
  style: "min-width:fit-content",
  label: {label:'text label', o:{cls: 'label'}},
  elt: {data:'Toggle', value:'tooltip'},
  feedback: {feedback:["invalid"], o:{offset: 9}}
}

inputs.test = new dom.Input("text", o)
o = obj.replace(o,{id: "new", value:0.2})
inputs.old = new dom.Input('text',{id:'test', cls:"cc"}).addFeedback("invalid","valid",{cls:"xxx"})
console.log(inputs)