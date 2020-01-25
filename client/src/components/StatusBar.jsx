import React, { Component } from 'react'
import './StatusBar.scss'

import ProgressBar from './ProgressBar'
import BusySignal from './BusySignal'

class StatusBar extends Component {
  constructor() {
    super()

    this.state = {
      progress: 0
    }
  }


  render() {
    return (
      <div id="status-bar">
        <span >Status bar</span>
        <ProgressBar style={{ margin: "0 5px" }} progress={ this.state.progress }/>
        <BusySignal />
      </div>
    )
  }
}

export default StatusBar
