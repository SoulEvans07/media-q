import React, { Component } from 'react'
import './InstaView.scss'

import Loader from '../components/Loader'

class InstaView extends Component {
  constructor() {
    super()

    this.state = {
      stories: null
    }
  }

  componentDidMount() {
    const url = 'http://localhost:3000/api/insta/story/list/2020-01-16'

    fetch(url)
    .then(res => res.json())
    .then(res => {
      if (res.error) {
        this.setState({ stories: [] })
        console.error(res.error)
      } else {
        this.setState({ stories: Object.values(res) })
      }
    })
  }

  render() {
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { stories } = this.state

    return (
      <div id="insta-view">
        { stories ?
          <div className="story-list">
            { stories.map(story => (
              <span className="story-card" key={ story.src }>
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

export default InstaView
