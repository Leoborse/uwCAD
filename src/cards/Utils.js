import React from 'react'

function format(x,n){
  return x.toLocaleString(undefined,{ minimumFractionDigits: n, maximumFractionDigits: n })
}

export default class Part extends React.Component{
  constructor(props){
    super(props)
    this.state = { show: -1 }
    this.focus = null
    this.onChangeData = this.props.onChangeData
  }
  showModal = (n) => { this.setState({ show: n || 0 }) }
  hideModal = () =>  { this.setState({ show: -1 }) }
  setData = (event) => {
    event.preventDefault()
    var newData = {}
    for ( var i=0; i<event.target.length; i++) {
      if ( event.target[i].tagName !== "BUTTON" ) {
        if ( event.target[i].type === 'number' ) {
          var c = parseFloat(event.target[i].value)
          if ( ! isNaN(c) )
            newData[event.target[i].name] = c
        } else {
          newData[event.target[i].name] = event.target[i].value
        }
      }
    }
    this.onChangeData(newData)
    this.hideModal()
  }
  fmt = (x,n) => { return format(x,n) }
  db  = (x) => { return format(20.*Math.log10(x),2) }
  deg = (x) => { return format(180.*x/Math.PI,1) }
}

class Modal extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      handleOk: this.props.handleOk,
      handleCancel: this.props.handleCancel,
      title: this.props.title,
      children: this.props.children
    }
  }
  render(){
    const s = this.state
    const showHideClassName = this.props.show ? "w3-modal w3-show" : "w3-modal w3-hide"
    return (
      <div className={showHideClassName}>
        <div className="w3-modal-content w3-animate-zoom w3-blue w3-round-large">
          <form onSubmit={s.handleOk}>
            <header className="w3-container w3-round-large">
              <span className="w3-xxlarge">{s.title}</span>
              <span className="w3-button w3-right w3-round w3-xxlarge" onClick={this.state.handleCancel}>&times;</span>
            </header>
            <div className="w3-container">
              <div className="w3-margin">{s.children}</div>
            </div>
            <footer className="w3-container w3-round-large">
              <button type="submit" name="submit" className="w3-button w3-right w3-margin w3-round w3-green">Ok</button>
              <button type="button" name="cancel" className="w3-button w3-right w3-margin w3-round w3-red" onClick={this.state.handleCancel}>Cancel</button>
            </footer>
          </form>
        </div>
      </div>
    )
  }
}

const scale = {
  "E": 1e18,
  "P": 1e15,
  "T": 1e12,
  "G": 1e9,
  "M": 1e6,
  "K": 1e3,
  "" : 1,
  "m": 1e-3,
  "µ": 1e-6,
  "n": 1e-9,
  "p": 1e-12,
  "f": 1e-15,
  "a": 1e-18
}

export {Part,Modal,scale}
