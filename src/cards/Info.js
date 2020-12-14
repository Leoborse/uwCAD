import React from 'react'
import Part from './Utils.js'

export default class Info extends Part {
  render(){
    var value = this.props.value
    var info = this.props.info
    return(
      <div className="w3-card-4 w3-margin-bottom w3-border w3-border-red w3-topbar">
        <div className="w3-center"><sup className="w3-black w3-large w3-padding">{value}</sup></div>
        <div className="w3-margin-left w3-margin-right">
          <table>
            <tbody>
              <tr><td>l:</td><td>{info.l}</td><td>mm</td></tr>
              <tr><td>w:</td><td>{info.w}</td><td>mm</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
