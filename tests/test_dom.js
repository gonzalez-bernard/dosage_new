import * as dom from "../src/modules/dom.js"
import * as obj from "../src/modules/utils/object.js"

var inputs = {}
var o = {
    id: 'test_input',
    class: 'test',
    size: 4,
    action: '#',
    value: 0.01,
    pattern: "[0-9.]{1,7}",
    attrs: "required",
    max: 10,
    style: "min-width:fit-content",
    label: { label: 'text label', o: { class: 'label' } },
    ext: { data: 'Toggle', value: 'tooltip' },
    feedback: { feedback: [ "invalid" ], o: { offset: 9 } }
}

inputs.test = new dom.Input( "text", o )
o = obj.replace( o, { id: "new", value: 0.2, label: {label: "Hello"}  } )
inputs.old = new dom.Input( 'text', o).setFeedback( ["invalid", "valid"], { offset:3, class: "xxx" } )
const div = new dom.Div( 'test' ).addChild( inputs.test, inputs.old )
const HTML = div.getHTML()
console.log( HTML )
document.getElementById("container").innerHTML = HTML
