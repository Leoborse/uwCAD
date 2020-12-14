/*******************************************************************************
Componenti
  - Mancano tutte le linee
Network analysis: net.js
  - Migliorare algoritmo scomposizione e ricomposizione della rete
  - Trasformare in una classe ?!
Editing e disegno del circuito
  - Manca viewer per componenti con più di 2 porte. (serve ?)
  - Rifattorizzare il disegno nel componente
  - Manca editor
Componenti
  - Completare le definizioni dei componenti
*******************************************************************************/
import React from 'react'
// Utility functions
// Circuit parts
import {snet} from './net/Network.js'
import Circuit from './net/CircuitElements.js'
// Graphic cards
import Plot from './cards/Plot.js'
import Info from './cards/Info.js'
import Parts from './cards/Parts.js'
import Board from './cards/Board.js'
import Layout from './cards/Layout.js'
import Smith from './cards/Smith.js'
import Graph from './cards/Graph.js'
import './css/w3.css'
import './css/index.css'

const appName = "uwCAD"

export default class App extends React.Component {
  constructor(props) {
    super(props)
    /*
    const s = JSON.parse( localStorage.getItem(appName) || JSON.stringify(startup) )
    /*/
    const s = startup
    //*/
    localStorage.setItem(appName,JSON.stringify(s))
    this.state = s
    for (const [key, value] of Object.entries(s.parts)) {
      this.state.parts[key] = new Circuit(value)
    }
    this.state.step = 0
    this.state.data.curve = snet(this.state)
    this.state.cache = {name:"Unknown cache name"}
    this.onChangeData = this.onChangeData.bind(this)
  }
  componentDidMount() {
    const apiUrl = '/cache.infos'
    console.log(apiUrl)
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        this.setState({"cache":data})
        this.setState({"step":1-this.state.step})
      })
  }

  onChangeData(values){
    var s = this.state
    var step = s.step
    console.log("updating values")
    for( var p in values ) {
      console.log(p,values[p])
      var current = s
      var names = p.split('.')
      while ( names.length !== 1 ) {
        current = current[names.shift()]
      }
      current[names[0]] = values[p]
    }
    console.log(s.parts)
    delete s.data.curve
    delete s.step
    localStorage.setItem(appName,JSON.stringify(s))
    s.data.curve = snet(s)
    s.step = step+1
    this.setState(s)
  }

  render() {
    return (
      <div key={this.state.step} className="w3-margin" >
        <div>{this.state.cache.name}</div>
        <div className="w3-row">
          <div className="w3-col m5 l4">
            <Plot value="F2 : PLOT" data={this.state.data} conf={this.state.conf} board={this.state.board} onChangeData={this.onChangeData} />
            <Info value="INFO" info={this.state.info} />
            <Parts value="F3 : PARTS" parts={this.state.parts} onChangeData={this.onChangeData} />
            <Board value="F4 : BOARD" board={this.state.board} onChangeData={this.onChangeData} />
          </div>
          <div className="w3-col m7 l8">
            <div className="w3-row">
              <div className="w3-col m6 l6">
                <Layout value="F1 : LAYOUT" parts={this.state.parts} layout={this.state.layout} board={this.state.board} />
              </div>
              <div className="w3-col m6 l6">
                <Smith value="Smith chart" data={this.state.data} conf={this.state.conf} />
              </div>
            </div>
            <div className="w3-row">
              <div className="w3-col m12 l12">
                <Graph value="|S| vs Frequency" data={this.state.data} conf={this.state.conf} onChangeData={this.onChangeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

var startup = {
  conf: {
    colors: ["#FF0000", "#00FFFF", "#0000FF", "#FFFF00"], // Curve colors
    range: 40, // dB range for the |S| vs freq. graph
  },
  info:{
    l: "? 2.916 ?",
    w: "? 0.649 ?"
  },
  lay_out:[
    {e:"p",n:[0,1]},  // Ports
    {e:"i",n:[0,1],d:"e"},  // part
  ],
  layout:[
    {e:"p",n:[0,1]},  // Ports
    {e:"a",n:[0,2],d:"e"},  // part
    {e:"b",n:[2,1],d:"e"},  // part
    {e:"c",n:[2,3],d:"s"},  // part
    {e:"s",n:[3],d:"c"},    // Short to ground
  ],
  parts: {
    a: {name:"lumped",t:"serial",s:4,r:  0.00,l:1.593,c:0.637},
    b: {name:"lumped",t:"serial",s:4,r: 50.00,l:1.593,c:0.637},
    c: {name:"lumped",t:"serial",s:4,r:100.00,l:1.593,c:0.637},
    d: {name:"lumped",t:"serial",s:4,r:  5.00,l:2,c:1},
    e: {name:"lumped",t:"serial",s:4,r: 11.11,l:1.59,c:.637},
    f: {},
    g: {},
    h: {},
    i: {name:"tline",z:50,phi:45},
    // Terminazioni
    o: {name:"open"},
    s: {name:"ground"},
    // Parti necessarie per la connessione
    j2: {name:"junction",p:2},
    j3: {name:"tee"},
    j4: {name:"cross"},
  },
  board: {
    zd: 50,
    fd: 5,
    er: 10.2,
    h: 1.27,
    s: 25.4,
    c:  0
  },
  data:{
    plot: {
      f0: 0,
      f1: 10,
      r: 1,
      np: 101
    }
  }
}
