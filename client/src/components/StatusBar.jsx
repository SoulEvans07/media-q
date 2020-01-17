import React, { Component } from 'react'
import './StatusBar.scss'

import ProgressBar from './ProgressBar'
import BusySignal from './BusySignal'

class StatusBar extends Component {
  constructor() {
    super()

    const progressTimer = setInterval(() => {
      const { progress } = this.state
      if (progress < 100) {
        this.setState({ progress: progress + 1 })
      } else {
        this.setState({ progress: 0 })
      }
    }, 100)

    this.state = {
      progress: 0,
      timer: progressTimer
    }
  }


  render() {
    return (
      <div id="status-bar">
        <span onClick={() => clearInterval(this.state.timer)}>Status bar</span>
        <ProgressBar style={{ margin: "0 5px" }} progress={ this.state.progress }/>
        <BusySignal />
      </div>
    )
  }
}

export default StatusBar
