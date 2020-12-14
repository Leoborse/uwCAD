import Complex from 'complex.js'
import {scale} from '../cards/Utils.js'

const ghz = scale["G"]

/*******************************************************************************
Dal circuito a Snet. Agoritmo:
  1. Sostituisce tutti i nodi con connessioni multiple con Giunzioni finché
     tutti i nodi compaiono due e due sole volte.
  2. Allunga la lista dei componenti aggiungendo le sintesi. Ad esempio se le
     parti a e b sono connesse rispettivamente ai nodi 5,6 e 6,7 creare un nuovo
     componente cicuitale "a-b" connesso a 5,7 che sostituisce i precedenti.
*******************************************************************************/
function snet(state){
  var input = 2, names = ["S11","S12","S21","S22"]
  // np è il numero dei punti e deve essere dispari
  var np = state.data.plot.np, points = np + 1 - np%2
  var curve = []
  for ( var j=0 ; j < input*input; j++) {
    curve.push({
      name: names[j],
      value: []
    })
  }
  var net = schema(state)
  var f0 = state.data.plot.f0 * ghz
  var f1 = state.data.plot.f1 * ghz
  for ( var i=0; i<points; i++) {
    var f = ( (points-1-i) * f0 + i * f1 ) / (points -1)
    var s = compute(f,net,state)
    var l = 0
    for ( var m=0; m<input; m++) {
      for ( var n=0; n<input; n++) {
        curve[l++].value.push(s[m][n])
      }
    }
  }
  return curve
}

function schema(s){
  var l = JSON.parse(JSON.stringify(s.layout))
  var nodes = countJunctions(l)
  var nl = nodes.length
  for ( var i=0; i<nodes.length; i++) {
    var k = nodes[i]
    switch (k){
      case undefined: // Node is not connected
      case 2:         // Simple Junction
        break   // Anyway nothing to do
      case 1:         // Port not connected inserting open circuit
        l.push({e:"o",n:[i]})
        break
      default:        // Multiple connections inserting a multiport junction
        var repl = []
        for ( var m=0; m<nodes[i];m++)
          repl.push(nl++)
        l.push({e:"j"+m,n:repl})
        l = replace(l,i,repl)
        break
    }
  }
  // Rename nodes. Ports are the first nodes 0,1
  var ports = getPorts(l)
  for ( i=0; i<ports.length; i++){
    l = replace(l,ports[i],[i,i])
  }
  return l
}

function replace(l,n,a) {
  var k = 0
  for ( var i=0; i<l.length; i++){
    for ( var j=0; j<l[i].n.length; j++){
      if ( l[i].n[j] === n ) l[i].n[j] = a[k++]
    }
  }
  return l
}

function countJunctions(l){
  var nodes = [], i, j
  for ( i=0; i<l.length; i++){
    for ( j=0; j<l[i].n.length; j++){
      var p = l[i].n[j]
      nodes[p] = nodes[p] ? nodes[p] + 1 : 1
    }
  }
  return nodes
}

function getPorts(l){
  for ( var i=0; i<l.length; i++){
    if ( l[i].e === 'p' ) return l[i].n
  }
}

function compute(f,net,s){
  var nn = JSON.parse(JSON.stringify(net))
  // Calcolo delle matrici S di ciascune elemento
  nn.forEach((item, i) => {
    // se un elemento è usato più volte lo calcola più volte
    if ( item.e !== 'p' ) {
      nn[i].s = s.parts[item.e].smatrix(f,s.board)
    }
  });
  // Calcolare la matrice della rete a partire dalle connessioni (net)
  // Connettere i due nodi con id più elevato e ripetere finché non resta un
  // solo elemento

  //  Finché esistono più elementi (nn.length() > 2 == porte più elemento)
  while ( nn.length > 2 ) {
    //  Leggere e Rimuovere l'ultimo elemento (en) in nn
    var en = nn.pop()
    // Determinare id_nodo_max di en (max(en.n))
    var inm = Math.max(...en.n);
    // Determinare il nodo ei in nn che ha id_nodo_max
    for ( var i=1; i<nn.length; i++) {
      if ( nn[i].n.includes(inm) ) {
        var ei = nn[i]
        // Connettere en ed ei per il nodo id_nodo_max generando ep
        let ep = {
          e: [en.e,ei.e].join("-"),
          n: [...en.n, ...ei.n].filter(function(n){return n!== this},inm),
          s: connect(en, ei, inm)
        }
        // Sostituire ei con ep in nn (nn[i]=ep)
        nn[i] = ep
        i = nn.length
      }
    }
  }
  // Ordina le porte
  var p0 = nn[1].n.indexOf(nn[0].n[0])
  var p1 = nn[1].n.indexOf(nn[0].n[1])
  var snet = [
    [ nn[1].s[p0][p0], nn[1].s[p0][p1] ],
    [ nn[1].s[p1][p0], nn[1].s[p1][p1] ]
  ]
  return snet
}

// Connette due elementi circuitali (en,ei) tramite le porta p
function connect(en, ei, p) {
  var n  = en.s.length + ei.s.length
  var see = new SMatrix(n-2,n-2),sei = new SMatrix(n-2,2)
  var sie = new SMatrix(  2,n-2),sii = new SMatrix(  2,2)
  /*
  var g = new SMatrix((new Junction(2)).smatrix())
  /*/
  var g = new SMatrix([
    [new Complex(0), new Complex(1)],
    [new Complex(1), new Complex(0)]
  ])
  //*/
  var i,j,k,l,m,h

  // Generazione di see, sei, sie, sii mediante scansione di en ed ei
  // see è diagonale a blocchi n-2 righe, n-2 colonne
  // sei è verticale di n-2 righe, 2 colonne
  // sie è orizzontale di 2 righe, n-2 colonne
  // sii è diagonale e contiene solo i due elementi delle porte da connettere
  h = 0 // Elemento in corso di gestione
  m = 0 // Blocco dell'elemento (S è diagonale a blocchi))
  k = 0 // 0 Prima o -1 dopo la porta da connettere
  var elements = [ei,en]

  while ( elements.length > 0 ) {
    // elemento da gestire
    var es = elements.pop()
    var el = es.s.length
    var pp = es.n.indexOf(p)
    for ( i=0; i<el; i++) {
      l = m // m Prima o m-1 dopo la porta da connettere
      for ( j=0; j<el; j++) {
        if ( i !== pp ) { // Porta non connessa
          if ( j !== pp ) { // Porta non connessa
            see.set(i+k,j+l,es.s[i][j])
          } else { // Porta connessa
            l = m-1
            sei.set(i+k,h,es.s[i][j])
          }
        } else {  // Porta connessa
          k = m-1
          if ( j !== pp ) { // Porta non connessa
            sie.set(h,j+l,es.s[i][j])
          } else { // Porta connessa
            l = m-1
            sii.set(h,h,es.s[i][j])
          }
        }
      }
    }
    m += es.s.length-1
    k = m // m Prima o m-1 dopo la porta da connettere
    h += 1 // prossimo elemento
  }

  var snet = see.add(sei.mul(g.sub(sii).inverse().mul(sie)))
  return snet.val()
}

export default class SMatrix {
  constructor(m,n,d){
    if ( typeof n === 'undefined' ) {
      this.s = m
    } else {
      d = d || new Complex(0)
      this.s = []
      for ( var km=0;km<m;km++) {
        var r = []
        for ( var kn=0;kn<n;kn++) {
          r.push( new Complex(d) )
        }
        this.s.push(r)
      }
    }
  }
  set(m,n,d){
    this.s[m][n] = d
  }
  val() {
    return this.s
  }
  add(s2){
    var s1 = this.s
    var s2s = s2.val()
    var n1 = s1.length
    var n2 = s1[0].length
    var s = new Array(n1).fill(0)
    for (var i=0;i<s1.length;i++){
      s[i] = new Array(n2).fill(0)
      for (var j=0;j<s1[i].length;j++){
        s[i][j] = s1[i][j].add(s2s[i][j])
      }
    }
    return new this.constructor(s)
  }
  sub(s2){
    var s1 = this.s
    var s2s = s2.val()
    var n1 = s1.length
    var n2 = s1[0].length
    var s = new Array(n1).fill(0)
    for (var i=0;i<s1.length;i++){
      s[i] = new Array(n2).fill(0)
      for (var j=0;j<s1[i].length;j++){
        s[i][j] = s1[i][j].sub(s2s[i][j])
      }
    }
    return new this.constructor(s)
  }
  mul(s2) {
    var s1 = this.s
    var s2s = s2.val()

    var n1 = s1.length
    var n = s1[0].length
    var n2 = s2s[0].length

    var s = new Array(n1).fill(0)
    for (var i=0;i<n1;i++){
      s[i] = new Array(n2).fill(0)
      for (var j=0;j<n2;j++){
        s[i][j] = s1[i][0].mul(s2s[0][j])
        for (var k=1;k<n;k++){
          s[i][j] = s[i][j].add(new Complex(s1[i][k]).mul(s2s[k][j]))
        }
      }
    }
    return new this.constructor(s)
  }
  inverse() {
    var s = this.s
    var det = s[0][0].mul(s[1][1]).sub(s[0][1].mul(s[1][0]))
    var idet = det.inverse()
    var si = [
      [ s[1][1].mul(idet),         s[0][1].mul(idet).mul(-1) ],
      [ s[1][0].mul(idet).mul(-1), s[0][0].mul(idet) ]
    ]
    return new this.constructor(si)
  }
  toString(){
    var nd = 3
    var nr = this.s.length
    var nc = this.s[0].length
    var s = new SMatrix(nr,nc,"")
    for ( var i=0;i<nr;i++ ) {
      for ( var j=0;j<nc;j++ ) {
        var c = this.s[i][j]
        var v = "("+this.format(c.re,nd)+","+this.format(c.im,nd)+")"
        s.set(i,j,v)
      }
    }
    return s
  }
  format(x,n){
    return x.toLocaleString(undefined,{ minimumFractionDigits: n, maximumFractionDigits: n })
  }
}

export {snet}
