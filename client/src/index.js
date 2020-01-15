import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import store from './store'

window.store = store

ReactDOM.render(
  <App state={ store.getState() } dispatch={ store.dispatch } />,
  document.getElementById('root')
)
