import React, { Component } from 'react'
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'

import './NavBar.scss'
import 'react-datepicker/dist/react-datepicker.css'

export const getDateString = function(date) {
  return date.getFullYear() + '-' + (date.getMonth()+1).pad(2) + '-' + date.getDate().pad(2)
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
      if (getDateString(selectedDate) === getDateString(new Date)) {
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

    const CustomDateInput = ({ value, onClick }) => (
      <button className="date-input" onClick={ onClick }>
        { value }
      </button>
    )

    return (
      <div id="navbar">
        <button className="refresh-btn" onClick={ () => this.refresh() }>
          <span className="btn-label">Refresh</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" className="btn-icon">
            <path d="m120.6 38.723c-3.312-7.713-7.766-14.367-13.36-19.961-5.595-5.594-12.248-10.05-19.962-13.361-7.713-3.314-15.805-4.97-24.278-4.97-7.984 0-15.71 1.506-23.18 4.521-7.468 3.01-14.11 7.265-19.92 12.751l-10.593-10.511c-1.63-1.684-3.503-2.064-5.622-1.141-2.173.924-3.259 2.527-3.259 4.808v36.5c0 1.412.516 2.634 1.548 3.666 1.033 1.032 2.255 1.548 3.667 1.548h36.5c2.282 0 3.884-1.086 4.807-3.259.923-2.118.543-3.992-1.141-5.622l-11.162-11.243c3.803-3.585 8.148-6.341 13.04-8.27 4.889-1.928 9.994-2.893 15.317-2.893 5.649 0 11.04 1.101 16.17 3.3 5.133 2.2 9.572 5.174 13.32 8.922 3.748 3.747 6.722 8.187 8.922 13.32 2.199 5.133 3.299 10.523 3.299 16.17 0 5.65-1.1 11.04-3.299 16.17-2.2 5.133-5.174 9.573-8.922 13.321-3.748 3.748-8.188 6.722-13.32 8.921-5.133 2.2-10.525 3.3-16.17 3.3-6.464 0-12.574-1.412-18.332-4.236-5.757-2.824-10.618-6.816-14.583-11.977-.38-.543-1-.87-1.874-.979-.815 0-1.494.244-2.037.733l-11.162 11.244c-.434.436-.665.991-.692 1.67-.027.68.15 1.29.53 1.833 5.921 7.17 13.09 12.724 21.509 16.661 8.419 3.937 17.3 5.907 26.642 5.907 8.473 0 16.566-1.657 24.279-4.97 7.713-3.313 14.365-7.768 19.961-13.361 5.594-5.596 10.05-12.248 13.361-19.961 3.313-7.713 4.969-15.807 4.969-24.279 0-8.474-1.657-16.564-4.97-24.277"
              transform="matrix(.12785 0 0 .12786 2.95 2.948)"
            />
          </svg>
        </button>

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
      </div>
    )
  }
}

const mapStateToProps = state => ({
  dates: state.dates
})

export default connect(mapStateToProps, null)(NavBar)
