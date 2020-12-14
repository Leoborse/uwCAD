import React from 'react'
import Part from './Utils.js'

export default class Layout extends Part {
  constructor(props){
    super(props)
    this.canvas = null
  }

  componentDidMount() {  this.drawGraph() }
  componentDidUpdate() { this.drawGraph() }

  setCanvas = (e)=>{ this.canvas = e }

  drawGraph(){
    var parts = this.props.parts
    var layout = this.props.layout
    var board = this.props.board
    var canvas = this.canvas
    var dimensions = canvas.getBoundingClientRect()
    canvas.width = dimensions.width
    canvas.height = canvas.width
    let ctx = canvas.getContext("2d")
    canvas.height = canvas.width
    const x0 = 20
    const mx = canvas.width - 2 * x0
    const my = canvas.height - 2 * x0
    // Substrate borders and Ports
    ctx.beginPath()
      ctx.font = '24px serif';
      ctx.strokeStyle = "#FFFFFF"
      ctx.strokeRect(x0,0,mx,my)
      ctx.fillStyle = "#FF0000"
      const ph = 4, pw = 4
      ctx.fillText("1",x0-4*pw,.5*my+ph)
      ctx.fillRect(x0-pw,.5*my-ph,2*pw, 2*ph)
      ctx.fillText("2",x0+mx+2*pw,.5*my+ph)
      ctx.fillRect(x0+mx-pw,.5*my-ph,2*pw, 2*ph)
    ctx.stroke()

    var scale = mx/board.s

    // Layout
    var xr = .5*board.s, yr = .5*board.s // mm
    var nodi = [[xr,yr]]
    layout.forEach((item, i) => {
      if ( 'op'.indexOf(item.e) === -1 ) {
        layout[i].dim = parts[item.e] ? parts[item.e].size() : {l:0,w:0}
        var ex = item.n
        nodi[ex[0]] = nodi[ex[0]] || [xr+5*i,yr+5*i]
        ctx.beginPath()
        ctx.fillStyle = "#FFFF00"
        ctx.arc(nodi[ex[0]][0]*scale,nodi[ex[0]][1]*scale,2,0,2*Math.PI)
        ctx.fill()
        if ( ex[1] ) {
          if ( 'ns'.indexOf(item.d) !== -1 ) {
            var tmp = layout[i].dim.w
            layout[i].dim.w = layout[i].dim.l
            layout[i].dim.l = tmp
            if ( 's'.indexOf(item.d) !== -1 ) {
              nodi[ex[1]] = [nodi[ex[0]][0],nodi[ex[0]][1]+layout[i].dim.w]
            } else {
              nodi[ex[1]] = [nodi[ex[0]][0],nodi[ex[0]][1]-layout[i].dim.w]
            }
          } else {
            if ( 'e'.indexOf(item.d) !== -1 ) {
              nodi[ex[1]] = [nodi[ex[0]][0]+layout[i].dim.l,nodi[ex[0]][1]]
            } else {
              nodi[ex[1]] = [nodi[ex[0]][0]-layout[i].dim.l,nodi[ex[0]][1]]
            }
          }
          ctx.beginPath()
          ctx.fillStyle = "#FFFF00"
          ctx.arc(nodi[ex[1]][0]*scale,nodi[ex[1]][1]*scale,2,0,2*Math.PI)
          ctx.fill()
        }
      }
    })
    // Componenti
    ctx.beginPath()
      ctx.font = '16px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = "#FFFF00"
      ctx.strokeStyle = "#00FFFF"
      layout.forEach((item, i) => {
        if ( 'op'.indexOf(item.e) === -1 ) { // Non visualizza porte e open
          var n = item.n[0]
          var xri = nodi[n][0]*scale, yri = nodi[n][1]*scale
          var l = item.dim.l*scale, w = item.dim.w*scale
          if ( item.d === 'e' ) {
            ctx.rect(xri,yri-.5*w,l,w)
            ctx.fillText(item.e,xri+.5*l,yri)
          } else if ( item.d === 'w' ) {
            ctx.rect(xri,yri-.5*w,-l,w)
            ctx.fillText(item.e,xri-.5*l,yri)
          } else if ( item.d === 'n' ) {
            ctx.rect(xri-.5*l,yri,l,-w)
            ctx.fillText(item.e,xri,yri-.5*w)
          } else if ( item.d === 's' ) {
            ctx.rect(xri-.5*l,yri,l,w)
            ctx.fillText(item.e,xri,yri+.5*w)
          } else { // centered
            ctx.rect(xri-.5*l,yri-.5*w,l,w)
          }
        }
      })
    ctx.stroke()
    // porte
    layout.forEach((item, i) => {
      if ( 'p'.indexOf(item.e) !== -1 ) {
        var el = item.n
        ctx.beginPath()
          ctx.lineWidth = 5
          ctx.fillStyle = "#FFFF00"
          ctx.strokeStyle = "#00FF00"
          ctx.moveTo(x0, .5*my)
          ctx.lineTo(nodi[el[0]][0]*scale, nodi[el[0]][1]*scale)
          ctx.moveTo(x0+mx, .5*my)
          ctx.lineTo(nodi[el[1]][0]*scale, nodi[el[1]][1]*scale)
        ctx.stroke()
      }
    })
  }

  render(){
    var value = this.props.value
    return(
      <div className="w3-card-4 w3-margin-bottom w3-margin-left w3-border w3-border-cyan w3-topbar">
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div>
          <canvas ref={this.setCanvas}/>
        </div>
      </div>
    )
  }
}
