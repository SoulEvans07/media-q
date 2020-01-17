import React, { Component } from 'react'
import './App.scss'

import InstaView from './views/InstaView'
import NavBar from './components/NavBar'
import StatusBar from './components/StatusBar'

class App extends Component {

  render() {
    return (
      <div className="app">
        <NavBar />
        <InstaView />
        <StatusBar />
      </div>
    )
  }
}

export default App
