import { fromJS } from 'immutable';
import _ from 'lodash';
import { LOAD_DATA, LOADED_DATA, SET_ELEMENTS, SET_SELECTED, PERSISTED, ADDED, DELETED, SET_TEMPLATES } from './constants';

const initialState = fromJS({
  loading: false,
  data: [{}],
  elements: [{}],
  templates: [{}],
  selected: false
});

function examplePageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DATA:
      return state.set('data', null);
    case LOADED_DATA:
      return state.set('elements', action.data.elements).set('templates', _.filter(action.data.elements, {title: 'Templates'})[0]);
    case SET_ELEMENTS:
      return state.set('elements', action.data);
    case SET_TEMPLATES:
      console.log('d', action.data);
      return state.set('templates', action.data);
    case SET_SELECTED:
      return state.set('selected', action.data);
    case PERSISTED:
      return;
    case DELETED:
      return;
    case ADDED:
      return;
    default:
      return state;
  }
}

export default examplePageReducer;
