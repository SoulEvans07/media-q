import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import initialState from './initialState'

const setStories = function(state, payload) {
  return { ...state, stories: payload.stories /*.map(s => { s.date = new Date(s.date); return s })*/ }
}

const setDates = function(state, payload) {
  return { ...state, dates: payload.dates }
}

const setSearch = function(state, payload) {
  return { ...state, search: payload.search }
}

const removeStory = function(state, payload) {
  const newStories = [...state.stories]
  const index = newStories.findIndex(el => el.src === payload.story.src)
  newStories.splice(index, 1)
  return { ...state, stories: newStories }
}

const setStory = function(state, payload) {
  const newStories = [...state.stories]
  const index = newStories.findIndex(el => el.src === payload.story.src)
  newStories.splice(index, 1)
  newStories.push({ ...payload.story, state: payload.state })
  return { ...state, stories: newStories }
}

const rootReducer = function(state, action) {
  switch (action.type) {
    case 'SET_STORY':
      return setStory(state, action.payload)
    case 'SET_STORIES':
      return setStories(state, action.payload)
    case 'SET_DATES':
      return setDates(state, action.payload)
    case 'SET_SEARCH':
      return setSearch(state, action.payload)
    case 'REMOVE_STORY':
      return removeStory(state, action.payload)
    default:
      return state
  }
}


const localstorage_object = 'media-q-state'
const loadState = function() {
  try {
    const serializedState = localStorage.getItem(localstorage_object);
    if (serializedState === null) {
      return initialState
    }
    return { ...initialState, ...JSON.parse(serializedState) }
  } catch (err) {
    return initialState
  }
}

const store = createStore(rootReducer, initialState /*loadState()*/, applyMiddleware(thunk))

store.subscribe(() => {
  const currentState = store.getState()
  const serializedState = JSON.stringify(currentState)
  localStorage.setItem(localstorage_object, serializedState)
})

export default store
