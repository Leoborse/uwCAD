import React from 'react'
import Circuit from '../net/CircuitElements.js'
import {Part,Modal} from './Utils.js'

export default class Parts extends Part {
  constructor(props){
    super(props)
    this.onChangeData = this.props.onChangeData
    this.value = this.props.value
    var parts = this.props.parts
    this.state.modals = [
      { n: "a", v: parts.a },
      { n: "b", v: parts.b },
      { n: "c", v: parts.c },
      { n: "d", v: parts.d },
      { n: "e", v: parts.e },
      { n: "f", v: parts.f },
      { n: "g", v: parts.g },
      { n: "h", v: parts.h },
      { n: "i", v: parts.i },
    ]
    this.state.current = { n:"x", v:new Circuit()}
    this.handleChange = this.handleChange.bind(this)
    this.editParams = this.editParams.bind(this)
  }
  checkData(event){
    event.preventDefault()
    var name = ["parts",this.state.current.n].join(".")
    var val = this.state.current.v.getData()
    for ( var i=0; i<event.target.length; i++) {
      if ( event.target[i].tagName !== "BUTTON" ) {
        if ( event.target[i].type === 'number' ) {
          var c = parseFloat(event.target[i].value)
          if ( ! isNaN(c) )
            val[event.target[i].name] = c
        } else {
          val[event.target[i].name] = event.target[i].value
        }
      }
    }
    var v = {}
    v[name] = new Circuit(val)
    console.log(v)
    this.onChangeData(v)
    this.hideModal()
  }
  handleChange(evt){
    console.log(this.state.current)
    var c = this.state.current
    c.name = evt.target.value
    c.v = new Circuit({name:c.name})
    c.i = 1-c.i
    this.setState({"current":c})
    console.log(this.state.current)
  }
  editParams(i){
    const ei = this.state.modals[i]
    var c = this.state.current
    c.i =
    c.n = ei.n
    c.v = new Circuit(ei.v.getData())
    c.name = ei.v.name
    this.setState({"current":c})
    this.showModal()
  }
  render(){
    const value = this.value
    const modals = this.state.modals
    const ce = this.state.current
    const step = this.state.step
    return(
      <div key={step} className="w3-card-4 w3-margin-bottom w3-border w3-border-yellow w3-topbar">
        <Modal key={ce.i} title="Circuit element" show={this.state.show === 0} handleCancel={this.hideModal} handleOk={(e)=>this.checkData(e)}>
          <div>
            <label className="w3-large" htmlFor={ce.i}>Part: {ce.n}</label>
            <select id={ce.i} className="w3-select w3-round-large" value={ce.v.getData().name} onChange={this.handleChange} name="name" title="Circhuit element type">
              <option value="">Chose an element</option>
              {ce.v.elements().map((e,i)=>{
                return <option key={i} value={e.n}>{e.d}</option>
              })}
            </select>
            {ce.v.render()}
          </div>
        </Modal>
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div className="w3-margin-left w3-margin-right">
          <table>
            <tbody>
              {modals.map((m, i)=>{
                return (
                  <tr key={i} onClick={()=>this.editParams(i)}><td>{m.n}</td><td>{m.v.toString()}</td></tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
