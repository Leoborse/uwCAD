import React from 'react'
import {Part,Modal} from './Utils.js'

export default class Graph extends Part {
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
    canvas.height = dimensions.height
    let ctx = canvas.getContext("2d")
    ctx.font = '12px serif';
    var off = 24
    const mx = canvas.width - 2*off
    const my = canvas.height - off
    var i, j, dx, p;
    var mdb = Math.ceil(20*Math.log10(data.plot.r))
    var yrange = [
      mdb-conf.range,mdb
    ]
    // Rettangolo
    ctx.beginPath()
      ctx.strokeStyle = "#007F00"
      ctx.setLineDash([]);
      ctx.rect(off,0,mx,my)
    ctx.stroke()
    // Griglia
    ctx.beginPath()
      ctx.strokeStyle = "#007F00"
      ctx.setLineDash([8,2]);
      dx = mx/10
      for ( i=1; i<10; i++) {
        ctx.moveTo(off+dx*i, 0)
        ctx.lineTo(off+dx*i, my)
      }
      var ygrid = 10* Math.floor(mdb/10.)
      while ( (p = my * (yrange[1]-ygrid)/(yrange[1]-yrange[0])) < my ) {
        ctx.moveTo(off+0, p)
        ctx.lineTo(off+mx,p)
        ygrid -= 10
      }
    ctx.stroke()
    // Curve
    for ( j=0; j<data.curve.length; j++) {
      ctx.beginPath()
        ctx.strokeStyle = conf.colors[j]
        ctx.setLineDash([]);
        var dj = data.curve[j].value
        dx = mx/(dj.length-1)
        for (i=0; i<dj.length; i++ ){
          var vdb = 20 * Math.log10(dj[i].abs())
          p = Math.min(my,my * (yrange[1]-vdb)/(yrange[1]-yrange[0]))
          if ( i === 0 ) {
            ctx.moveTo(off+dx*i, p)
          } else {
            ctx.lineTo(off+dx*i, p)
          }
        }
      ctx.stroke()
    }
  }

  render(){
    var value = this.props.value
    var data = this.props.data
    var conf = this.props.conf
    var f0 = data.plot.f0
    var f1 = data.plot.f1
    var fm = .5*(f0+f1)
    var modals = [
      { n: "data.plot.f0", v: data.plot.f0, u: "GHz", title: "Frequenza minima" },
      { n: "data.plot.f1", v: data.plot.f1, u: "GHz", title: "Frequenza massima" },
    ]
    return(
      <div className="area w3-card-4 w3-margin-bottom w3-margin-left w3-border w3-border-black w3-topbar">
        {modals.map((m, i)=>{
          return (
            <Modal  key={i} title={[m.title,m.u].join(" - ")} show={this.state.show === i} handleCancel={this.hideModal} handleOk={this.setData}>
              <div className="w3-center">
                <input ref={input => input && input.focus()} className="w3-input" name={m.n} defaultValue={m.v} type="number" step=".01"/>
              </div>
            </Modal>
          )
        })}
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div className="w3-display-container w3-text-white">
        <span className="w3-display-topright w3-text-green">{Math.ceil(20*Math.log10(data.plot.r))}</span>
        <span className="w3-display-right w3-margin-bottom">|S|<br/>dB</span>
        <span className="w3-display-bottomright w3-margin-bottom w3-text-green">{Math.ceil(20*Math.log10(data.plot.r))-conf.range}</span>
        <span className="w3-display-bottomleft  w3-margin-left" onClick={(e)=>this.showModal(0)} >{this.fmt(f0,2)}</span>
        <span className="w3-display-bottommiddle w3-text-green">{this.fmt(fm,3)} GHz</span>
        <span className="w3-display-bottomright w3-margin-right" onClick={(e)=>this.showModal(1)} >{this.fmt(f1,2)}</span>
        <canvas ref={this.setCanvas} />
        </div>
      </div>
    )
  }
}
