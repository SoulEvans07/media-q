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

  render() {
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { stories, search } = this.props

    let filteredStories = stories
    if (filteredStories) {
      filteredStories.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse()

      if (search !== '') {
        filteredStories = filteredStories.filter(story => {
          if (!story.src) console.log('[missing]', story.thumbnail)
          return story.src.indexOf(search) !== -1
        })
      }
    }

    return (
      <div id="insta-view">
        { filteredStories ?
          <div className="story-list">
            { filteredStories.map(story => {
              const date = new Date(story.date)
              const removing = story.state === 'REMOVING'
              console.log(story)
              return (
                <span className={ classNames("story-card", { "removing": removing }) } key={ story.thumbnail }>
                  <img className="story-thumbnail"
                    src={ URL_BASE + story.thumbnail }
                    alt={ story.src }
                    onClick={!removing ? () => console.log(URL_BASE + story.src) : null}
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
  stories: state.stories,
  search: state.search
})

export default connect(mapStateToProps, null)(InstaView)
