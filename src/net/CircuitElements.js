import React from 'react'
import Complex from 'complex.js'
import {scale} from '../cards/Utils.js'

class CircuitElement {
  toString(){ return this.data.name }
  getData(){  return this.data }
  smatrix(){  return [ [new Complex(0)] ] } // match
  size(){     return { l:1, w:1 } }
  elements(){
    var list = []
    Object.entries(parts).forEach(([k, e]) => {
      e.n = k
      list.push(e)
    })
    return list
  }
  render(){
    return (
      <div className="w3-container w3-large w3-center w3-padding">No parametres to define</div>
    )
  }
}

export default class Circuit extends CircuitElement {
  constructor(data){
    super()
    this.data = typeof data !== 'undefined' ? data :
                { name: "" }
    if ( parts[this.data.name] )
      return new (parts[this.data.name].v)(data)
  }
}

// Elementi circuitali ====================
class TLine extends CircuitElement {
  constructor(data) {
    super()
    this.data = data
    this.data.l = 0//5.832
    this.data.w = 0//.649
  }
  toString() {
    return ["µ strip","Z=",this.data.z+"Ω,","L=",this.data.phi+"°"].join(" ")
  }
  size(){
    return {
      l: this.l,
      w: this.w
    }
  }
  smatrix(f,board) {
    var c = 3e8
    var z = this.data.z/board.zd
    var y = 1/z
    var wsh = 1 // da calcolare (pag 25) W/h
    var er = board.er
    var ereq = .5 * ( (er+1) + (er-1)/Math.sqr(1+10*wsh) )
    var ge = 2*Math.PI*f*scale["G"]*Math.sqrt(ereq)/c
    var ep = Math.exp( + ge * this.data.l*scale["m"] )
    var em = Math.exp( - ge * this.data.l*scale["m"] )
    var den = (ep+em) + .5 * (z+y) * (ep-em)
    var g = new Complex( (.5 * (z-y) * (ep-em)) / den )
    var t = new Complex(2/den)
    return [
      [g, t],
      [t, g]
    ]
  }
  render(){
    return (
      <div className="w3-container">
        <div className="w3-row">
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Imp. (Ω)</label>
            <input className="w3-input w3-round-large" type="number" name="z" defaultValue={this.data.z} />
          </div>
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Phase (°)</label>
            <input className="w3-input w3-round-large" type="number" name="phi" defaultValue={this.data.phi} />
          </div>
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Len. (mm)</label>
            <input className="w3-input w3-round-large" type="number" name="l" defaultValue={this.data.l} />
          </div>
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Wid. (mm)</label>
            <input className="w3-input w3-round-large" type="number" name="w" defaultValue={this.data.w} />
          </div>
        </div>
      </div>
    )
  }
}

class Lumped extends CircuitElement {
  constructor(data) {
    super()
    this.data = data
    this.data.t = typeof data.t != "undefined" ? data.t : "serial" // Serie
    this.data.s = typeof data.s != "undefined" ? data.s : 4  // 4mm length
  }
  toString() {
    var c = this.data.t === 'serial' ? "+" : "||"
    var v = [this.data.r+"Ω"]
    if ( typeof this.data.l != "undefined") v.push(this.data.l+"nH")
    if ( typeof this.data.c != "undefined") v.push(this.data.c+"pF")
    var vt = v.join(c)
    return [this.data.name,vt,this.data.s+"mm"].join(" ")
  }
  size(){
    return {
      l: this.data.s,
      w: .5*this.data.s
    }
  }
  smatrix(f,board) {
    var z, xl, xc, w = 2 * Math.PI * f
    var r = this.data.r
    var l = this.data.l*scale["n"]
    var c = this.data.c*scale["p"]
    if ( this.data.t === 'serial' ) {
      xl = w * ( l || 0 )
      xc = !c ? 0 : 1/(w*c)
      z = new Complex([r,xl-xc])
    } else {
      xl = !l ? 0 : 1/(w*l)
      xc = w * ( c || 0 )
      z = new Complex([1/r,-xl+xc]).inverse()
    }
    z = z.div(board.zd)
    var den = new Complex(z).add(2).inverse()
    var g = new Complex(z).mul(den)
    var t = new Complex(2).mul(den)
    return [
      [g, t],
      [t, g]
    ]
  }
  render(){
    return (
      <div className="w3-container">
        <div className="w3-row">
          <div className="w3-col w3-padding s12 m4 l3">
            <label>Connection type</label>
            <select className="w3-select w3-round-large" defaultValue={this.data.t} name="t" title="Connection type">
              <option value="serial">Series</option>
              <option value="parallel">Parallel</option>
            </select>
          </div>
        </div>
        <div className="w3-row">
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Res. (Ω)</label>
            <input className="w3-input w3-round-large" name="r" defaultValue={this.data.r} type="number" step=".001" required/>
          </div>
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Ind. (nH)</label>
            <input className="w3-input w3-round-large" name="l" defaultValue={this.data.l} type="number" step=".001" />
          </div>
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Cap. (pF)</label>
            <input className="w3-input w3-round-large" name="c" defaultValue={this.data.c} type="number" step=".001" />
          </div>
          <div className="w3-col w3-padding s12 m3 l3">
            <label>Len. (mm)</label>
            <input className="w3-input w3-round-large" name="s" defaultValue={this.data.s} type="number" step=".001" required />
          </div>
        </div>
      </div>
    )
  }
}

// Elementi di supporto ====================
class Junction extends CircuitElement { // Connection (n=2), Tee (n=3) or cross (n=4)
  constructor(data) {
    super(data)
    this.data = data
    this.data.p = typeof data.p === "number" ? data.p : 2 // Ports
  }
  toString() {
    return [this.name,this.p,"ports"].join(" ")
  }
  smatrix() {
    var p = this.data.p
    var s = []
    for(var i=0; i<p; i++) {
      s[i] = [];
      for(var j=0; j<p; j++) {
        s[i][j] = i === j ? new Complex((2-p)/(p)) : new Complex((2  )/(p))
      }
    }
    return s
  }
}

class Tee extends CircuitElement { // Tee Junction(n=3)
  smatrix() {
    var g = new Complex(-1./3)
    var t = new Complex( 2./3)
    return [ [g,t,t],[t,g,t],[t,t,g] ]
  }
}

class Cross extends CircuitElement { // Cross Junction(n=4)
  smatrix() {
    var g = new Complex(-.5)
    var t = new Complex( .5)
    return [ [g,t,t,t],[t,g,t,t],[t,t,g,t],[t,t,t,g] ]
  }
}

class Open extends CircuitElement {
  smatrix(f) { return [ [new Complex(1)] ] }
  size()     { return { l:0, w:0 } }
}

class Ground extends CircuitElement {
  smatrix(f) { return [ [new Complex(-1)] ] }
  size()     { return { l:1, w:1 } }
}

const parts = {
  lumped:   {v:Lumped,   d:"Lumped element"},
  tline:    {v:TLine,    d:"Microstrip transmission line"},
  junction: {v:Junction, d:"Multiport junction"},
  tee:      {v:Tee,      d:"Tee junction"},
  cross:    {v:Cross,    d:"Cross junction"},
  open:     {v:Open,     d:"Open circuit"},
  ground:   {v:Ground,   d:"Short to ground"},
}
