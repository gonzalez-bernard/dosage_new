/** ESPECES - html.js */

import * as obj from "../modules/utils/object.js"
import * as ui from "./html_cts.js"
import * as txt from "./lang_fr.js";

import { Element, Label, Input, P, Form, Button, Div } from "../modules/dom.js";
import { uString } from "../modules/utils/string.js";
import { FOOTER, VOL_EMAX, VOL_EMIN } from "../environnement/constantes.js"
import { CONC_MAX, CONC_MIN, VOL_MAX, VOL_MIN, CONC_RMAX, CONC_RMIN } from "./../environnement/constantes.js"

var fieldsets = {},
    legends = {},
    buttons = {},
    inputs = {},
    divs = {},
    labels = {},
    forms = {},
    elts = {},
    selects = {};

// style
const ST_INPUT = "col-md-1 form-input";
const INT_VOL = new uString("Volume dans l'intervalle \n[" + VOL_MIN + " , " + VOL_MAX + "] mL").convertHtmlChar().getHtml()
const INT_C1 = new uString("Concentration dans l'intervalle \n[" + CONC_MIN + "  , " + CONC_MAX + "] mol/L").convertHtmlChar().getHtml();
const INT_VOLEAU = new uString("Volume dans l'intervalle \n[" + VOL_EMIN + " , " + VOL_EMAX + "] mL").convertHtmlChar().getHtml();
//const INT_CR = new uString( "Concentration dans l'intervalle <br>[" + CONC_RMIN + "  , " + CONC_RMAX + "] mol/L" ).convertHtmlChar().getHtml();

// container principal
const div_container = new Div("container-fluid").setParent("body");

// titre
const div_titre = new Div("title").addChild(new Element("h3").setText(txt.ES_TITLE)).setParent("body");

// Objectif
elts.intro = new P(txt.ES_INTRO, {}).setParent("body");

// espace radio, sélection du type de dosage et bouton info
divs.selection_info = new Div("row").setName("selection_info")

legends.type = new Element("legend", { class: "type-border" }).setText(txt.ES_TYPE);
inputs.ac = new Input("radio", { id: "type_ac", name: "choice_type" }).setValue(1)
    .setAttrs("checked");
labels.ac = new Label(txt.ES_AB, { class: "radio-inline col-md-4" }).setFor("type_ac")
    .addChild(inputs.ac)
inputs.ox = new Input("radio", { id: "type_ox", name: "choice_type" }).setValue(2);
labels.ox = new Label(txt.ES_OR, { class: "radio-inline col-md-8" }).setFor("type_ox")
    .addChild(inputs.ox);
fieldsets.type = new Element("fieldset", { class: "type-border col-10 col-md-10" })
    .addChild(legends.type, labels.ac, labels.ox);

// Aide
buttons.info = new Button('INFO', { id: ui.ES_BT_DSPINFO_AC, class: 'btn btn-info' })
    .setTitle(txt.ES_BT_INFO)
    .setStyle("height: 3em")
    .setAttrs('disabled')

divs.selection_info.addChild(fieldsets.type, buttons.info)

/** Ajout au container */
div_container.addChild(elts.intro, divs.selection_info)

// Consigne
elts.ac_consigne = new P(txt.ES_ACIDEBASE_OBJECTIF, {});

// selecteur acide-base
labels.ac_titre = new Label(txt.ES_TITRE, {}).setFor(ui.ES_ACIDEBASE_TITRE_SELECT);
selects.ac_titre = new Element("select", { class: "form-control", id: ui.ES_ACIDEBASE_TITRE_SELECT, })
    .setText("<option>");
divs.ac_titre = new Div("form-group col-md-6").addChild(labels.ac_titre, selects.ac_titre);

labels.ac_titrant = new Label(txt.ES_TITRANTE, {});
selects.ac_titrant = new Element("select", { class: "form-control", id: ui.ES_ACIDEBASE_TITRANT_SELECT, }).setText("<option>").setAttrs('required');
divs.ac_titrant = new Div("form-group col-md-6").addChild(labels.ac_titrant, selects.ac_titrant);

divs.row_ac = new Div("row").addChild(divs.ac_titre, divs.ac_titrant);
divs.acide = new Element("div", { id: ui.ES_ACIDEBASE }).addChild(elts.ac_consigne, divs.row_ac);

// selecteur autre type
elts.ox_consigne = new P(txt.ES_AUTREDOS_OBJECTIF);
labels.ox = new Label(txt.ES_TITRE);
selects.ox = new Element("select", { class: "form-control", id: ui.ES_AUTREDOS_SELECT })
    .setText("<option>")
    .setStyle("width:40em");
divs.ox_equation = new Div("form-group col-md-10").addChild(labels.ox, selects.ox);
divs.row_ox = new Div("row").addChild(divs.ox_equation);
divs.ox = new Element("div", { id: ui.ES_AUTREDOS }).addChild(elts.ox_consigne, divs.row_ox)
    .setStyle("display:none");

let oInput = {
    id: ui.ES_TITRE_CONC,
    class: ST_INPUT,
    size: 4,
    attrs: "required",
    style: "min-width:fit-content",
    max: CONC_MAX,
    min: CONC_MIN,
    pattern: "[0-9.]{1,7}",
    title: new uString(INT_C1).convertHtmlChar().getVal(),
    label: { label: txt.ES_CONC_TITRE, o: { class: "label col-md-9" } },
    ext: [{ data: "Toggle", value: "tooltip" }, { data: "html", value: "true" }],
    feedback: { feedback: [INT_C1], o: { offset: 7, class: "col-md-5" } },
    value: 0.01
}
// champs pour concentration
inputs.titre_conc = new Input("text", oInput)

obj.replace(oInput, { id: ui.ES_TITRANT_CONC, label: { label: txt.ES_CONC_TITRANT, o: { class: "label col-md-9" } } })
inputs.titrant_conc = new Input("text", oInput)

divs.col_conc_titre = new Div("col-6 col-md-6").addChild(inputs.titre_conc)
divs.col_conc_titrant = new Div("col-6 col-md-6").addChild(inputs.titrant_conc)
divs.concentration = new Div("row").addChild(divs.col_conc_titre, divs.col_conc_titrant)

// champs pour volume
obj.replace(oInput, { id: ui.ES_TITRE_VOL, value: 10, max: VOL_MAX, min: VOL_MIN, title: INT_VOL, pattern: "[0-9.]{1,4}", label: { label: txt.ES_VOL_TITRE, o: { class: "label col-md-9" } }, feedback: { feedback: [INT_VOL], o: { offset: 8, class: "col-md-4" } } })

inputs.titre_vol = new Input("text", oInput)

divs.volume = new Div("row").addChild(new Div("col-6 col-md-6").addChild(inputs.titre_vol))

obj.replace(oInput, { id: ui.ES_EAU_VOL, value: 40, max: VOL_EMAX, min: VOL_EMIN, title: INT_VOLEAU, pattern: "[0-9.]{1,2}", label: { label: txt.ES_EAU_VOL, o: { class: "label col-md-9" } }, feedback: { feedback: [INT_VOLEAU], o: { offset: 8, class: "col-md-4" } } })

// champ pour ajout d'eau
inputs.eau_vol = new Input("text", oInput)

divs.eau = new Div("row").addChild(new Div("col-6 col-md-6").addChild(inputs.eau_vol))

// champs pour espèce supplémentaire (réactif)
fieldsets.supp = new Element("fieldset", {
    id: ui.ES_SUPP,
    class: "type-border col-md-12",
    style: "display:none",
});
legends.supp = new Element("legend", { class: "type-border" }).setText(txt.ES_ESP_SUPP);

divs.supp = new Div("form-group row", 'div_supp').setID('supp');


// espèce supplémentaire concentration
let msgInterval = txt.ES_MSG_INTERVAL + CONC_MIN + " et " + CONC_MAX + " mol/L"
obj.replace(oInput, { id: ui.ES_SUPP_CONC, value: null, max: CONC_MAX, min: CONC_MIN, title: msgInterval, pattern: "[0-1]{1}[0-9.]{0,3}", label: { label: txt.ES_SUPP_CONC, o: { class: "label col-md-9" } }, feedback: { feedback: [txt.ES_SUPP_CONC + txt.ES_MSG_HORS_INTERVAL], o: { offset: 8, class: "col-md-4" } }, minlength: 1 })

inputs.supp_conc = new Input("text", oInput)

// espèce supplémentaire volume
msgInterval = txt.ES_MSG_INTERVAL + VOL_MIN + " et " + VOL_MAX + " mL"
obj.replace(oInput, { id: ui.ES_SUPP_VOL, value: "", max: VOL_MAX, min: VOL_MIN, title: txt.ES_MSG_INTERVAL + txt.ES_SUPP_VOL, pattern: "[1-9].?[0-9]{0,1}", label: { label: txt.ES_SUPP_VOL, o: { class: "label col-md-9" } }, feedback: { feedback: [txt.ES_SUPP_VOL + txt.ES_MSG_HORS_INTERVAL], o: { offset: 8, class: "col-md-4" } } })

inputs.supp_vol = new Input("text", oInput)

divs.supp.addChild(new Div("col-6 col-md-6").addChild(inputs.supp_conc), new Div("col-6 col-md-6").addChild(inputs.supp_vol));
fieldsets.supp.addChild(legends.supp, divs.supp);

// champs pour ajout excipient (H3O+)
fieldsets.exc = new Element("fieldset", {
    id: ui.ES_EXC,
    class: "type-border col-md-12",
    style: "display:none",
});
legends.exc = new Element("legend", { class: "type-border" }).setText(txt.ES_EXC_TITRE);
elts.exc = new P(txt.ES_EXC_INFO);

divs.exc = new Div("form-group row", 'div_exc').setID('exc');

// concentration
msgInterval = txt.ES_MSG_INTERVAL + CONC_RMIN + " et " + CONC_RMAX + " mol/L"
obj.replace(oInput, { id: ui.ES_EXC_CONC, value: "", max: CONC_RMAX, min: CONC_RMIN, title: msgInterval, pattern: "[0-5]{1}.?[0-9]{0,3}", label: { label: new uString(txt.ES_EXC_CONC).convertExpoIndice().html, o: { class: "col-9 col-md-9" } }, feedback: { feedback: [txt.ES_EXC_CONC + txt.ES_MSG_HORS_INTERVAL], o: { offset: 8, class: "col-md-4" } }, minlength: 1 })

inputs.exc_conc = new Input("text", oInput)

// Volume
msgInterval = txt.ES_MSG_INTERVAL + VOL_MIN + " et " + VOL_MAX + " mL"
obj.replace(oInput, {
    id: ui.ES_EXC_VOL, value: "", max: VOL_MAX, min: VOL_MIN, title: msgInterval,
    pattern: "[1-5]{1,2}", label: { label: txt.ES_EXC_VOL, o: { class: "col-9 col-md-9" } },
    feedback: { feedback: [txt.ES_EXC_VOL + txt.ES_MSG_HORS_INTERVAL], o: { offset: 8, class: "col-md-4" } }
})

inputs.exc_vol = new Input("text", oInput)

divs.exc.addChild(new Div("col-6 col-md-6").addChild(inputs.exc_conc), new Div("col-6 col-md-6").addChild(inputs.exc_vol))
fieldsets.exc.addChild(legends.exc, elts.exc, divs.exc);

divs.feedback = new Div('feedback', 'feedback_select')

// Formulaire
forms.getEspeces = new Form({ id: ui.ES_FORM, name: ui.ES_FORM_NAME })
    .addChild(divs.acide, divs.ox, divs.feedback, divs.concentration, divs.volume, divs.eau, fieldsets.supp, fieldsets.exc);

// Bouton
buttons.valid = new Button(txt.ES_BT_VALID, { id: ui.ES_BT_VALID, class: "btn btn-success" })
    .setAttrs("disabled")
    .setStyle("float:right")

divs.info = new Div("container").setID(ui.ES_DIV_INFO)
div_container.addChild(forms.getEspeces, buttons.valid, divs.info)

var html = div_titre.getHTML() + div_container.getHTML() + FOOTER;
export { html };