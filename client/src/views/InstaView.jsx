import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import './InstaView.scss'

import Loader from '../components/Loader'

class InstaView extends Component {

  componentDidMount() {
    const { dispatch } = this.props
    const dates_url = 'http://localhost:3000/api/insta/story/dates'
    const latest_url = 'http://localhost:3000/api/insta/story/list/latest'

    fetch(dates_url)
    .then(res => res.json())
    .then(data => dispatch({ type: 'SET_DATES', payload: { dates: data } }))
    .catch(e => dispatch({ type: 'SET_DATES', payload: { dates: [] } }))

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

  deleteStory = (story) => {
    const { dispatch } = this.props
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const delete_url = URL_BASE + story.src

    dispatch({ type: 'SET_STORY', payload: { story, state: 'REMOVING' } })

    fetch(delete_url, { method: 'DELETE' })
    .then(() => {
      dispatch({ type: 'REMOVE_STORY', payload: { story } })
    })
  }

  setSelectedMedia = (index, story) => {
    const { dispatch } = this.props
    dispatch({
      type: 'SET_SELECTED_MEDIA',
      payload: { selectedMedia: { index, story: { ...story } } }
    })
  }

  render() {
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { filteredStories } = this.props

    return (
      <div id="insta-view">
        { filteredStories ?
          <div className="story-list">
            { filteredStories.map((story, index) => {
              const date = new Date(story.date)
              const removing = story.state === 'REMOVING'
              const username = story.thumbnail.substring(0, story.thumbnail.length - "-XXXX-XX-XX-XXXXXX.thumbnail.jpg".length)
              return (
                <span className={ classNames("story-card", { "removing": removing }) }
                  key={ story.thumbnail }
                  title={username}
                >
                  <img className="story-thumbnail"
                    src={ URL_BASE + story.thumbnail }
                    alt={ story.src }
                    onClick={!removing ? () => this.setSelectedMedia(index, story) : null}
                  />
                  <span className="story-control" onClick={() => this.deleteStory(story)}>
                    <span className="icon fas fa-trash-alt" />
                  </span>
                  <span className="timestamp">{date.getHours().pad(2) + ':' + date.getMinutes().pad(2)}</span>
                </span>
              )
            })}
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
  filteredStories: state.filteredStories
})

export default connect(mapStateToProps, null)(InstaView)
