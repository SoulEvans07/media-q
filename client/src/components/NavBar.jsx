import React, { Component } from 'react'
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'

import './NavBar.scss'
import 'react-datepicker/dist/react-datepicker.css'

export const getDateString = function(date) {
  return date.getFullYear() + '-' + (date.getMonth()+1).pad(2) + '-' + date.getDate().pad(2)
}

class CustomDateInput extends Component {
  render() {
    const { value, onClick } = this.props
    return (
      <button className="date-input" onClick={ onClick }>
        { value }
      </button>
    )
  }
}

class NavBar extends Component {
  constructor() {
    super()

    this.state = {
      status: null,
      selectedDate: new Date()
    }
  }

  refresh = () => {
    const { dispatch } = this.props
    const { selectedDate } = this.state

    const refresh_url = 'http://localhost:3000/api/insta/story/refresh'
    const stories_url = 'http://localhost:3000/api/insta/story/list/' + getDateString(selectedDate)

    fetch(refresh_url)
    .then(res => res.json())
    .then(() => {
      if (getDateString(selectedDate) === getDateString(new Date())) {
        fetch(stories_url)
        .then(res => res.json())
        .then(res => dispatch({ type: 'SET_STORIES', payload: { stories: res } }))
      }
    })
  }

  setDate = (date) => {
    this.setState({ selectedDate: date })

    const { dispatch } = this.props
    const stories_url = 'http://localhost:3000/api/insta/story/list/' + getDateString(date)

    fetch(stories_url)
    .then(res => res.json())
    .then(res => dispatch({ type: 'SET_STORIES', payload: { stories: res } }))
  }

  render() {
    const { selectedDate } = this.state
    const { dates, dispatch } = this.props

    const dateList = dates ? dates.map(d => Date.parse(d)) : [ new Date() ]

    return (
      <div id="navbar">
        <img className="logo" src="/purple-q.png" alt="logo"/>

        <DatePicker
          selected={selectedDate}
          dateFormat="yyyy-MM-dd"
          includeDates={dateList}
          customInput={<CustomDateInput />}
          onChange={date => this.setDate(date)}
        />

        <input className="search-box" placeholder="Search"
          onChange={el => { dispatch({ type: 'SET_SEARCH', payload: { search: el.target.value } }) }}
        />

        <button className="refresh-btn" onClick={ () => this.refresh() }>
          <span className="btn-label">Sync</span>
          <span className="fas fa-sync-alt btn-icon" />
        </button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  dates: state.dates
})

export default connect(mapStateToProps, null)(NavBar)
