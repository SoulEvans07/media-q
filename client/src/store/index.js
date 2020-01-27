import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import initialState from './initialState'

const filterAndSortStories = function(stories, search) {
  let filteredStories = []

  if (stories !== null) {
    filteredStories = [...stories]
    filteredStories.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse()

    if (search !== '') {
      filteredStories = filteredStories.filter(story => {
        if (!story.src) console.log('[missing src]', story.thumbnail)
        return story.src.indexOf(search) !== -1
      })
    }
  }

  return filteredStories
}

const setStories = function(state, payload) {
  const filteredStories = filterAndSortStories(payload.stories, state.search)
  return { ...state, stories: payload.stories, filteredStories }
}

const setDates = function(state, payload) {
  return { ...state, dates: payload.dates }
}

const setSearch = function(state, payload) {
  const filteredStories = filterAndSortStories(state.stories, payload.search)
  return { ...state, search: payload.search, filteredStories }
}

const removeStory = function(state, payload) {
  const newStories = [...state.stories]
  const index = newStories.findIndex(el => el.src === payload.story.src)
  newStories.splice(index, 1)
  const filteredStories = filterAndSortStories(newStories, state.search)
  return { ...state, stories: newStories, filteredStories }
}

const setStory = function(state, payload) {
  const newStories = [...state.stories]
  const index = newStories.findIndex(el => el.src === payload.story.src)
  newStories.splice(index, 1)
  newStories.push({ ...payload.story, state: payload.state })
  const filteredStories = filterAndSortStories(newStories, state.search)
  return { ...state, stories: newStories, filteredStories }
}

const setSelectedMedia = function(state, payload) {
  return { ...state, selectedMedia: payload.selectedMedia }
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
    case 'SET_SELECTED_MEDIA':
      return setSelectedMedia(state, action.payload)
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
