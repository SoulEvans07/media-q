import React, { Component } from 'react'
import { connect } from 'react-redux'
import './InstaView.scss'

import Loader from '../components/Loader'

class InstaView extends Component {

  componentDidMount() {
    const { dispatch } = this.props
    const dates_url = 'http://localhost:3000/api/insta/story/dates'
    const latest_url = 'http://localhost:3000/api/insta/story/list/latest'

    fetch(dates_url)
    .then(res => res.json())
    .then(data => {
      dispatch({ type: 'SET_DATES', payload: { dates: data } })
    }).catch(e => {
      dispatch({ type: 'SET_DATES', payload: { dates: [] } })
      console.log(e)
    })

    fetch(latest_url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        dispatch({ type: 'SET_STORIES', payload: { stories: [] } })
        console.error(data.error)
      } else {
        dispatch({ type: 'SET_STORIES', payload: { stories: data } })
      }
    }).catch(e => {
      dispatch({ type: 'SET_STORIES', payload: { stories: [] } })
      console.log(e)
    })
  }

  render() {
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { stories, search } = this.props

    let filteredStories = stories
    if (search !== '') {
      filteredStories = stories.filter(story => story.src.indexOf(search) !== -1)
    }

    return (
      <div id="insta-view">
        { filteredStories ?
          <div className="story-list">
            { filteredStories.map(story => (
              <span className="story-card" key={ story.src } title={ story.src }>
                <a href={ URL_BASE + story.src }>
                  <img className="story-thumbnail" src={ URL_BASE + story.thumbnail } alt={ story.src } />
                </a>
              </span>
            ))}
          </div>
          :
          <div className="loading">
            <Loader />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  stories: state.stories,
  search: state.search
})

export default connect(mapStateToProps, null)(InstaView)
