import React from 'react'
import Part from './Utils.js'

export default class Smith extends Part {
  constructor(props){
    super(props)
    this.canvas = null
  }

  componentDidMount() {  this.drawGraph() }
  componentDidUpdate() { this.drawGraph() }

  setCanvas = (e)=>{ this.canvas = e }

  drawGraph(){
    var data = this.props.data
    var conf = this.props.conf
    var canvas = this.canvas
    var dimensions = canvas.getBoundingClientRect()
    canvas.width = dimensions.width
    canvas.height = canvas.width
    let ctx = canvas.getContext("2d")
    const d = canvas.width
    const r = .5 * d
    const cx = r, cy = r
    const pi = Math.PI, dpi = 2*pi
    ctx.width = d
    ctx.height = d
    var i, j, zn, ri, rr
    // Assi secondari (molto sbiaditi)
    ctx.beginPath()
      ctx.strokeStyle = "#003F00"
      for ( i=1;i<10;i++) {
        zn = i/10 // (.1, .2, ..., .9)*z0
        rr = r*(1/(1+zn))
        ri = r*(1/zn)
        ctx.arc(d-rr, cy, rr, 0, dpi)
        ctx.arc(d, cy-ri, ri, 0, dpi)
        ctx.arc(d, cy+ri, ri, 0, dpi)
        zn = 10-i  // (1, 2, ..., 9)*z0
        rr = r*(1/(1+zn))
        ri = r*(1/zn)
        ctx.arc(d-rr, cy, rr, 0, dpi)
        ctx.arc(d, cy-ri, ri, 0, dpi)
        ctx.arc(d, cy+ri, ri, 0, dpi)
      }
    ctx.stroke()
    // Assi principali (sbiaditi)
    ctx.beginPath()
      ctx.strokeStyle = "#00AF00"
      ctx.moveTo(0, r)
      ctx.lineTo(d, r)
      zn = 0 // 1 * z0
      rr = r*(1/(1+zn))
      ctx.arc(d-rr, cy, rr, 0, dpi)
      zn = 1 // 1 * z0
      rr = r*(1/(1+zn))
      ri = r*(1/zn)
      ctx.arc(d-rr, cy, rr, 0, dpi)
      ctx.arc(d, cy-ri, ri, 0, dpi)
      ctx.arc(d, cy+ri, ri, 0, dpi)
    ctx.stroke()
    // Curve
    for ( j=0; j<data.curve.length; j++) {
      ctx.beginPath()
        ctx.strokeStyle = conf.colors[j]
        ctx.setLineDash([]);
        var dj = data.curve[j].value
        for (i=0; i<dj.length; i++ ){
          var px = cx + r * dj[i].re
          var py = cy - r * dj[i].im
          if ( i === 0 ) {
            ctx.moveTo(px, py)
          } else {
            ctx.lineTo(px, py)
          }
        }
      ctx.stroke()
    }
  }

  render(){
    var value = this.props.value
    return(
      <div className="area w3-card-4 w3-margin-bottom w3-margin-left w3-border w3-border-black w3-topbar">
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div>
          <canvas ref={this.setCanvas}/>
        </div>
      </div>
    )
  }
}
