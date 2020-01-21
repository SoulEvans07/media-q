import React, { Component } from 'react'
import { connect } from 'react-redux'
import './InstaView.scss'

import Loader from '../components/Loader'

class InstaView extends Component {

  componentDidMount() {
    const { dispatch } = this.props
    const url = 'http://localhost:3000/api/insta/story/list/latest'

    fetch(url)
    .then(res => res.json())
    .then(res => {
      if (res.error) {
        dispatch({ type: 'SET_STORIES', payload: { stories: [] } })
        console.error(res.error)
      } else {
        dispatch({ type: 'SET_STORIES', payload: { stories: res } })
      }
    }).catch(e => {
      dispatch({ type: 'SET_STORIES', payload: { stories: [] } })
      console.log(e)
    })
  }

  render() {
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { stories } = this.props

    return (
      <div id="insta-view">
        { stories ?
          <div className="story-list">
            { stories.map(story => (
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
  stories: state.stories
})

export default connect(mapStateToProps, null)(InstaView)
