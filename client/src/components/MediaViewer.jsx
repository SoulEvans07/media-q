import React, { Component } from 'react'
import { connect } from 'react-redux'
import mouseTrap from 'react-mousetrap'
import './MediaViewer.scss'

class MediaViewer extends Component {
  componentDidMount() {
    this.props.bindShortcut('esc', this.close)
    this.props.bindShortcut('left', this.prev)
    this.props.bindShortcut('right', this.next)
  }

  componentWillUnmount() {
    this.props.unbindShortcut('esc')
    this.props.unbindShortcut('left')
    this.props.unbindShortcut('right')
  }

  prevent = e => e.stopPropagation()

  step = (dir) => {
    const { filteredStories, selectedMedia, dispatch } = this.props
    let newIndex = selectedMedia.index + dir
    if (newIndex >= filteredStories.length) newIndex = 0
    if (newIndex < 0) newIndex = filteredStories.length - 1

    dispatch({
      type: 'SET_SELECTED_MEDIA',
      payload: { selectedMedia: { index: newIndex, story: filteredStories[newIndex] } }
    })
  }

  next = e => {
    e.stopPropagation()
    this.step(1)
  }

  prev = e => {
    e.stopPropagation()
    this.step(-1)
  }

  close = e => {
    const { dispatch } = this.props
    e.stopPropagation()
    dispatch({ type: 'SET_SELECTED_MEDIA', payload: { selectedMedia: null } })
  }

  render() {
    const DATE_TMP = '-XXXX-XX-XX-XXXXXX'
    const EXT_TMP = '.XXX'
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { selectedMedia } = this.props

    const date = new Date(selectedMedia.story.date)
    const username = selectedMedia.story.src.substring(0, selectedMedia.story.src.length - DATE_TMP.length - EXT_TMP.length)

    return (
      <div
        id="media-viewer"
        onClick={this.close}
        onKeyPress={this.keyHandler}
      >
        <span className="chevron fas fa-chevron-left" onClick={this.prev} />

        <div className="media-container">
          <div className="header">
            <span className="username">{ username }</span>
            <span className="timestamp">{ date.getHours().pad(2) + ':' + date.getMinutes().pad(2) }</span>
          </div>
          { selectedMedia.story.is_video ?
            <video className="media" autoPlay controls
              key={selectedMedia.story.src}
              onClick={this.prevent}
            >
              <source type="video/mp4" src={ URL_BASE + selectedMedia.story.src } />
            </video>
            :
            <img className="media"
              src={ URL_BASE + selectedMedia.story.src }
              alt={ selectedMedia.story.src }
              onClick={e => e.stopPropagation()}
            />
          }
        </div>

        <span className="chevron fas fa-chevron-right" onClick={this.next} />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  filteredStories: state.filteredStories
})

export default mouseTrap(connect(mapStateToProps, null)(MediaViewer))
