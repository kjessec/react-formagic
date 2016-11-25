import { createStore } from 'redux';
const initialState = require('./generated.json');

// action.type === UPDATE일 때 state 통채로 갈아끼우기
function myReducer(state = initialState, action) {
  if(action.type === 'UPDATE') return action.data;
  return state;
}

const store = createStore(
  myReducer,
  window.devToolsExtension ? window.devToolsExtension() : f => f
);

export default store;
