import { fromJS } from 'immutable';

import { LOAD_DATA, LOADED_DATA, SET_TREE, SET_SELECTED, PERSISTED } from './constants';

const initialState = fromJS({
  loading: false,
  data: [{}],
  treeData: [{}],
  selected: false
});

function examplePageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DATA:
      return state.set('data', null);
    case LOADED_DATA:
      return state.set('data', action.data).set('treeData', action.data);
    case SET_TREE:
      return state.set('treeData', action.data);
    case SET_SELECTED:
      return state.set('selected', action.data);
    case PERSISTED:
      return;
    default:
      return state;
  }
}

export default examplePageReducer;
