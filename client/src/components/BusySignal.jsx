import React, { Component } from 'react'
import './BusySignal.scss'

class BusySignal extends Component {
  render() {
    const { style } = this.props
    return (
      <div className="busy-signal" style={ style }/>
    )
  }
}

export default BusySignal
