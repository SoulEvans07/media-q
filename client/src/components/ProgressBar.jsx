import React, { Component } from 'react'
import './ProgressBar.scss'


class ProgressBar extends Component {
  constructor() {
    super()
    
    this.state = { progress: 0 }
  }

  static getDerivedStateFromProps(newProps, newState) {
    const { progress } = newProps
    return { progress: Math.min(progress, 100) }
  }

  render() {
    const { style } = this.props
    const { progress } = this.state

    return (
      <div className="progress-bar" style={ style }>
        <span className="fill" style={{ width: progress + '%' }} />
      </div>
    )
  }
}

export default ProgressBar
