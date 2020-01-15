import React, { Component } from 'react'
import './App.scss'

import InstaView from './views/InstaView'
import NavBar from './components/NavBar'

class App extends Component {

  render() {
    return (
      <div className="app">
        <NavBar />
        <InstaView />
      </div>
    )
  }
}

export default App
