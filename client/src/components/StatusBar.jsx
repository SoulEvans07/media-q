import React, { Component } from 'react'
import { connect } from 'react-redux'
import socketIO from 'socket.io-client'

import './StatusBar.scss'

import ProgressBar from './ProgressBar'
import BusySignal from './BusySignal'
import { getDateString } from '../helpers'

class StatusBar extends Component {
  constructor() {
    super()

    this.state = {
      progress: 0,
      process: 'Status bar'
    }
  }

  componentDidMount() {
    const { selectedDate, dispatch } = this.props
    const dates_url = 'http://localhost:3333/api/insta/story/dates'
    const stories_url = 'http://localhost:3333/api/insta/story/list/' + getDateString(selectedDate)

    const io = socketIO('http://localhost:3333')
    io.on('download', data => {
      if (data.numberOfDone === 0) {
        this.setState({ process: 'Downloading...' })
      }

      if (data.numberOfDone === data.userCount) {
        this.setState({ process: 'Done!' })
        fetch(dates_url)
        .then(res => res.json())
        .then(data => dispatch({ type: 'SET_DATES', payload: { dates: data } }))
        .catch(e => dispatch({ type: 'SET_DATES', payload: { dates: [] } }))

        if (getDateString(selectedDate) === getDateString(new Date())) {
          fetch(stories_url)
          .then(res => res.json())
          .then(res => dispatch({ type: 'SET_STORIES', payload: { stories: res } }))
          .catch(e => dispatch({ type: 'END_REFRESH' }))
        } else {
          dispatch({ type: 'END_REFRESH' })
        }
      }

      this.setState({ progress: Math.round(data.numberOfDone / data.userCount * 100)})
    })
  }


  render() {
    return (
      <div id="status-bar">
        <span>{ this.state.process }</span>
        <ProgressBar style={{ margin: "0 5px" }} progress={ this.state.progress }/>
        <BusySignal />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  selectedDate: state.selectedDate
})

export default connect(mapStateToProps, null)(StatusBar)
