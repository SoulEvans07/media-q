import React, { Component } from 'react'
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import classnames from 'classnames'

import './NavBar.scss'
import 'react-datepicker/dist/react-datepicker.css'

import { getDateString } from '../helpers'

class CustomDateInput extends Component {
  render() {
    const { value, onClick } = this.props
    return (
      <button className="date" onClick={ onClick }>
        { value }
      </button>
    )
  }
}

class NavBar extends Component {
  constructor() {
    super()

    this.state = {
      status: null
    }
  }

  refresh = () => {
    const { dispatch, selectedDate } = this.props

    const dates_url = 'http://localhost:3333/api/insta/story/dates'
    const refresh_url = 'http://localhost:3333/api/insta/story/refresh'
    const stories_url = 'http://localhost:3333/api/insta/story/list/' + getDateString(selectedDate)

    dispatch({ type: 'START_REFRESH' })

    fetch(refresh_url)
    .then(res => res.json())
    .catch(e => dispatch({ type: 'END_REFRESH' }))
  }

  setDate = (date) => {
    const { dispatch } = this.props
    dispatch({ type: 'SET_SELECTED_DATE', payload: { selectedDate: date } })

    const stories_url = 'http://localhost:3333/api/insta/story/list/' + getDateString(date)

    fetch(stories_url)
    .then(res => res.json())
    .then(res => dispatch({ type: 'SET_STORIES', payload: { stories: res } }))
    .catch(e => dispatch({ type: 'SET_STORIES', payload: { stories: [] } }))
  }

  nextDate = (dir) => {
    const { dates, selectedDate } = this.props
    if (!dates) return null

    const index = dates.indexOf(getDateString(selectedDate))
    const next = index + dir

    return (index !== -1 && next >= 0 && next < dates.length) ? dates[next] : null
  }

  prev = () => {
    const next = this.nextDate(-1)
    if (next) this.setDate(new Date(Date.parse(next)))
  }

  next = () => {
    const next = this.nextDate(+1)
    if (next) this.setDate(new Date(Date.parse(next)))
  }

  render() {
    const { dates, stories_loading, dispatch, selectedDate } = this.props

    const dateList = dates ? dates.map(d => Date.parse(d)) : [ new Date() ]

    return (
      <div id="navbar">
        <img className="logo"
          alt="logo"
          src="/grey-q.png"
          onClick={() => window.location.reload()}
        />

        <div className="date-input">
          <div className={classnames("date-controls left", {disabled: !this.nextDate(-1)})}
            onClick={() => this.prev()}
          >
            <span className="fas fa-chevron-left" />
          </div>
          <DatePicker
            selected={selectedDate}
            dateFormat="yyyy-MM-dd"
            includeDates={dateList}
            customInput={<CustomDateInput />}
            onChange={date => this.setDate(date)}
          />
          <div className={classnames("date-controls right", {disabled: !this.nextDate(+1)})}
            onClick={() => this.next()}
          >
            <span className="fas fa-chevron-right" />
          </div>
        </div>

        <input className="search-box" placeholder="Search"
          onChange={el => { dispatch({ type: 'SET_SEARCH', payload: { search: el.target.value } }) }}
        />

        <button className={classnames("refresh-btn", { loading: stories_loading })}
          onClick={ !stories_loading ? () => this.refresh() : null }
        >
          <span className="btn-label">Sync</span>
          <span className="fas fa-sync-alt btn-icon" />
        </button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  dates: state.dates,
  stories_loading: state.stories_loading,
  selectedDate: state.selectedDate
})

export default connect(mapStateToProps, null)(NavBar)
