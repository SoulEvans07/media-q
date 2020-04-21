import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import classNames from 'classnames'

import './InstaView.scss'

import Loader from '../components/Loader'

class InstaView extends Component {

  componentDidMount() {
    const { dispatch } = this.props
    const dates_url = 'http://localhost:3333/api/insta/story/dates'
    const latest_url = 'http://localhost:3333/api/insta/story/list/latest'

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
    const URL_BASE = 'http://localhost:3333/api/insta/story/'
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
    const URL_BASE = 'http://localhost:3333/api/insta/story/'
    const { filteredStories } = this.props

    return (
      <div id="insta-view">
        { filteredStories ?
          <div className="story-list">
            { filteredStories.map((story, index) => (
              <span className={ classNames("story-card", { "removing": story.isRemoving }) }
                key={ story.thumbnail }
                title={ story.username }
              >
                <img className="story-thumbnail"
                  src={ URL_BASE + story.thumbnail }
                  alt={ story.src }
                  onClick={!story.isRemoving ? () => this.setSelectedMedia(index, story) : null}
                />
                <span className="story-control" onClick={() => this.deleteStory(story)}>
                  <span className="icon fas fa-trash-alt" />
                </span>
                <span className="timestamp">{story.date.getHours().pad(2) + ':' + story.date.getMinutes().pad(2)}</span>
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


const getFilteredStories = state => state.filteredStories

const filteredStoriesSelector = createSelector([getFilteredStories],
  filteredStories => {
    const isWin = navigator.appVersion.indexOf("Win") != -1
    if (!filteredStories) return filteredStories

    const DATE_TMP = '-XXXX-XX-XX-XXXXXX'
    const EXT_TMP = '.XXX'

    let newFilteredStories = [...filteredStories]
    const errors = { src: [], thumb: [] }
    newFilteredStories = newFilteredStories.map(story => {
      if (!story.src) {
        errors.src.push(story.thumbnail)
        return
      }
      if (!story.thumbnail) {
        errors.thumb.push(story.src)
        return
      }

      const date = new Date(story.date)
      const username = story.src.substring(0, story.src.length - DATE_TMP.length - EXT_TMP.length)
      const isRemoving = story.state === 'REMOVING'

      return { ...story, date, username, isRemoving }
    })

    let errorMessage = null
    if (errors.src.length > 0) {
      errorMessage = 'Missing source for: \n' + errors.src.join(' ')
    }
    if (errors.thumb.length > 0) {
      const l = errors.thumb[0].length
      const dateFolder = errors.thumb[0].substr(l - DATE_TMP.length + 1 - EXT_TMP.length, 'XXXX-XX-XX'.length)
      const command = `cd $HOME/workspace/media-q/server/target/instagram/stories/${dateFolder} ${isWin ? ';' : '&&'} rm `

      const separator = isWin ? ', ' : ' '

      if (!errorMessage) errorMessage = 'Missing thumbnail for: \n' + command + errors.thumb.join(separator)
      else errorMessage += '\n\nMissing thumbnail for: \n' + command + errors.thumb.join(separator)
    }
    if (errorMessage) {
      throw new Error(errorMessage)
    }


    return newFilteredStories
  }
)

const mapStateToProps = state => ({
  filteredStories: filteredStoriesSelector(state)
})

export default connect(mapStateToProps, null)(InstaView)
