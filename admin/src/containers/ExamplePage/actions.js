import { LOAD_DATA, LOADED_DATA, SET_TREE, PERSIST, SET_SELECTED, PERSISTED } from './constants';

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

export function persist() {
  return {
    type: PERSIST
  };
}

export function setSelected(data) {
  return {
    type: SET_SELECTED,
    data
  };
}

export function persisted(data) {
  return {
    type: PERSISTED,
    data
  };
}
