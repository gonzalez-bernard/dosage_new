
  /** Retourne l'indice de la courbe sur laquelle on a cliqué.
   * 
   * @param {chartElement} elt événement
   * @return {number} indice de la courbe
   */
   getEventChart(elt) {
    if (! isValidArgs([{arg:elt,type:'object'}]))
      throw ERR_PRM

    return elt[0]._datasetIndex;
  }

  /** Retourne l'indice du point
   *
   * @param {chartElement} elt
   * @return {number} indice du point
   */
  getEventIndicePoint(elt) {
    if (! isValidArgs([{arg:elt,type:'object'}]))
      throw ERR_PRM

    return elt[0]._index;
  }

  /**
   * Retourne les coordonnées du point sur laquelle on a agit
   *
   * @param {chartElement} elt
   * @return {Point}
   */
  getEventCoordPoint(elt) {

    if (! isValidArgs([{arg:elt,type:'object'}]))
      throw ERR_PRM

    // détecte sur quelle courbe on a cliqué
    var chart = this.getEventChart(elt);

    if (chart != undefined) {
      // récupère l'indice et le couple de valeur du point cliqué
      var selectedIndex = this.getEventIndicePoint(elt);

      return elt[0]._chart.data.datasets[chart].data[selectedIndex];
    } else return false;
  }

  /** Retourne les coordonnées d'un point de la courbe à partir des coordonnées x, y
   * 
   * Par défaut x et y sont les coordonnées de la souris
   * 
   * @param {Event} evt événement
   * @param {number} x abscisse
   * @param {number} y ordonnée
   * @returns {number[]} 
   */
  getEventCoord(evt, x =0,y =0){

    if (! isValidArgs([{arg:evt,type:'object'}]))
      throw ERR_PRM

    var element = this.chart.getElementAtEvent(evt)[0]
    if (element != undefined){
      var scaleX = element['_xScale'].id
      var scaleY = element['_yScale'].id
      var px = this.chart.options.scales[scaleX].getValueForPixel(evt.offsetX)
      var py = this.chart.options.scales[scaleY].getValueForPixel(evt.offsetY)
      return [px,py]
    }
    
  }

  /** Retourne les coordonnées de tous les points *
   * 
   * @param {chartElement} elt
   * @return {any[]}
   */
  getEventAllCoordPoints(elt) {
    // détecte sur quelle courbe on a cliqué
    var chart = this.getEventChart(elt);

    if (chart != undefined) {

      return elt[0]._chart.data.datasets[chart].data;
    } 
  }

  /** Retourne le tableau de données
   * 
   * @param {Event} evt
   * @return {Array}
   */
  getEventArray(evt) {
    if (evt != undefined) return this.chart.getElementsAtEvent(evt);
  }

  /** Renvoie un objet avec le label et l'id du graphe correspondant à ce N°
   * 
   * @param {number} index N° du graphe
   * @return {object} 
   */
  getIdChart(index){

    if (index != undefined && index < this.datasets.length){
      var o = {}
      o.label = this.datasets[index].label;
      o.id = this.datasets[index].id;
      return o
    }
    return false 
  }

  /** Retourne l'indice du graphe possédant la propriété
   *  
   * @param {string} prop propriété du graphe
   * @param {string|number} value valeur de la propriété
   * @returns {number | false} indice du graphe  
   */
  getChartByProp(prop, value){
    for (var i=0; i< this.datasets.length; i++){
      if (this.datasets[i][prop] != undefined && this.datasets[i][prop] == value)
        return i
    }
    return false
  }

  /** Retourne le tableau des points
   * 
   * @param {number} index N° de la courbe
   * @returns {array} tableau coordonnées des points
   */
  getData(index){
    return this.datasets[index].data
  }

  

    this.chart.update();
  }

  /** Ajoute des données à un graphe existant
   *
   * @param {object[]} data : données à ajouter
   * @param {number} index : index de la courbe
   */
  addData(data, index = 0) {
    for (var elt in data) 
      this.chart.data.datasets[index].data.push(data[elt]);
    this.chart.update();
  }

  /** Change les données et actualise la courbe
   * 
   * @param data : ensemble des données
   * @param {number} index : index de la courbe
   */
  changeData(data, index = 0) {
    this.chart.data.datasets[index].data = data;
    this.chart.update();
  }

  /** Met en place un gestionnaire d'évènement
   *
   * @param {String} event : type de l'événement ex: onClick
   * @param {Function} callback : fonction de traitement
   */
  setEvent(event, callback) {
    this.chart.options[event] = function (evt, elt) {
      callback(evt, elt);
    };
  }

  
 
  


    this.chart.update();
  }


  /** Mise à jour des options
   * 
   * @param {string} option : sous la forme "parent/enfant1/enfant2/option" à partir de 'options'
   * @param {any} value : valeur
   */
  setOption(option, value, indice = 0) {
    var paths = option.split('/')
    var cont = this.chart.options
    for(var i =0; i<paths.length-1;i++){
      if (Array.isArray(cont)){
        cont = cont[indice]
      }
      cont = cont[paths[i]]
    }
    cont[paths[i]] = value
  }