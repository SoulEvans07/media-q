import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
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
    e.stopPropagation()
    const { dispatch } = this.props
    dispatch({ type: 'SET_SELECTED_MEDIA', payload: { selectedMedia: null } })
  }

  openUser = e => {
    e.stopPropagation()
    const { selectedMedia } = this.props
    window.open("https://www.instagram.com/" + selectedMedia.username, '_blank')
  }

  render() {
    const URL_BASE = 'http://localhost:3000/api/insta/story/'
    const { date, username, story } = this.props.selectedMedia

    return (
      <div
        id="media-viewer"
        onClick={this.close}
        onKeyPress={this.keyHandler}
      >
        <span className="chevron fas fa-chevron-left" onClick={this.prev} />

        <div className="media-container">
          <div className="header">
            <span className="username" onClick={this.openUser}>
              { username }
            </span>
            <span className="timestamp">{ date.getHours().pad(2) + ':' + date.getMinutes().pad(2) }</span>
          </div>
          { story.is_video ?
            <video className="media" autoPlay controls
              key={story.src}
              onClick={this.prevent}
            >
              <source type="video/mp4" src={ URL_BASE + story.src } />
            </video>
            :
            <img className="media"
              src={ URL_BASE + story.src }
              alt={ story.src }
              onClick={e => e.stopPropagation()}
            />
          }
        </div>

        <span className="chevron fas fa-chevron-right" onClick={this.next} />
      </div>
    )
  }
}

const getSelectedMedia = (state, props) => props.selectedMedia

const selectedMediaSelector = createSelector([getSelectedMedia],
  selectedMedia => {
    const DATE_TMP = '-XXXX-XX-XX-XXXXXX'
    const EXT_TMP = '.XXX'

    const date = new Date(selectedMedia.story.date)
    const username = selectedMedia.story.src.substring(0, selectedMedia.story.src.length - DATE_TMP.length - EXT_TMP.length)

    return { ...selectedMedia, date, username }
  }
)

const mapStateToProps = (state, props) => ({
  filteredStories: state.filteredStories,
  selectedMedia: selectedMediaSelector(state, props)
})

export default mouseTrap(connect(mapStateToProps, null)(MediaViewer))
