import { LOAD_DATA, LOADED_DATA, SET_TREE, PERSIST } from './constants';

export function loadData() {
  return {
    type: LOAD_DATA,
  };
}

export function loadedData(data) {
  return {
    type: LOADED_DATA,
    data
  };
}

export function setTreeData(data) {
  return {
    type: SET_TREE,
    data
  };
}

export function persist(data) {
  return {
    type: PERSIST
  };
}
