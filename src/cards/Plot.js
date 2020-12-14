import React from 'react'
import {Part,Modal} from './Utils.js'

export default class Plot extends Part {
  render(){
    var color = this.props.conf.colors
    var value = this.props.value
    var data  = this.props.data
    var board = this.props.board
    var np = data.plot.np
    var fd = board.fd
    var nc = (np-1)*(fd-data.plot.f0)/(data.plot.f1-data.plot.f0)
    nc = Math.max(Math.min(Math.floor(nc),np-1),0)
    var fp = data.plot.f0 + nc * (data.plot.f1-data.plot.f0) / (np-1)
    return(
      <div className="w3-card-4 w3-margin-bottom w3-border w3-border-green w3-topbar">
        <Modal title="Number of data points" show={this.state.show === 0} handleOk={this.setData} handleCancel={this.hideModal}>
          <div className="w3-center">
            <input className="w3-input" name="data.plot.np" defaultValue={np} type="number" min="5" max="10001" step="2" required/>
          </div>
        </Modal>
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div className="w3-margin-left w3-margin-right" onClick={(e)=>this.showModal(0)}>Points {np}</div>
        <div className="w3-margin-left w3-margin-right">Smith radius <span className="w3-text-green">{this.fmt(data.plot.r,2)}</span></div>
        <div className="w3-margin-left w3-margin-right">
          <table>
            <tbody>
              <tr><td></td><td>f</td><td className="w3-text-green">{this.fmt(fp,3)}</td><td>GHz</td><td></td><td></td></tr>
              {data.curve.map((c, i) => {
                  return (
                    <tr key={i}>
                      <td style={{"color": color[i]}}>x</td>
                      <td>{c.name}</td>
                      <td className="w3-text-green w3-right">{this.db(c.value[nc].abs())}</td><td>dB</td>
                      <td className="w3-text-green w3-right">{this.deg(c.value[nc].arg())}</td><td>°</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
