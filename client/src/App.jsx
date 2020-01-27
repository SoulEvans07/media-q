import React, { Component } from 'react'
import { connect } from 'react-redux'
import './App.scss'

import InstaView from './views/InstaView'
import NavBar from './components/NavBar'
import StatusBar from './components/StatusBar'
import MediaViewer from './components/MediaViewer'

class App extends Component {
  render() {
    const { selectedMedia } = this.props
    return (
      <div className="app">
        <NavBar />
        <InstaView />
        <StatusBar />
        { selectedMedia !== null &&
          <MediaViewer selectedMedia={selectedMedia} />
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  selectedMedia: state.selectedMedia
})

export default connect(mapStateToProps, null)(App)
