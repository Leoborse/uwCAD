import React from 'react'
import {Part,Modal} from './Utils.js'

export default class Board extends Part {
  render(){
    var value = this.props.value
    var board = this.props.board
    var modals = [
      { n: "board.zd", v: board.zd, u: "Ω",   title: "Impedance" },
      { n: "board.fd", v: board.fd, u: "GHz", title: "Frequency" },
      { n: "board.er", v: board.er, u: "",    title: "Costante dielettrica" },
      { n: "board.h",  v: board.h,  u: "mm",  title: "Spessore" },
      { n: "board.s",  v: board.s,  u: "mm",  title: "s" },
      { n: "board.c",  v: board.c,  u: "mm",  title: "c" },
    ]
    return(
      <div className="w3-card-4 w3-margin-bottom w3-border w3-border-blue w3-topbar">
        {modals.map((m, i)=>{
          return (
            <Modal key={i} title={[m.title,m.u].join(" - ")} show={this.state.show === i} handleCancel={this.hideModal} handleOk={(e)=>this.setData(e,m.n)}>
              <div className="w3-center">
                <input ref={input => input && input.focus()} className="w3-input" name={m.n} defaultValue={m.v} type="number" step=".001"/>
              </div>
            </Modal>
          )
        })}
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div className="w3-margin-left w3-margin-right">
          <table>
            <tbody>
            {modals.map((m, i)=>{
              return (
                <tr key={i} onClick={(e)=>this.showModal(i)}><td>{m.n.split('.').pop()}</td><td className="w3-right">{this.fmt(m.v,3)}</td><td>{m.u}</td></tr>
              )
            })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
