import { LOAD_DATA, LOADED_DATA, SET_ELEMENTS, PERSIST, SET_SELECTED, PERSISTED, ADD, ADDED, DEL, DELETED, SET_TEMPLATES } from './constants';

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

export function setElements(data) {
  return {
    type: SET_ELEMENTS,
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

export function add(data) {
  return {
    type: ADD,
    data
  };
}

export function added() {
  return {
    type: ADDED
  };
}

export function del() {
  return {
    type: DEL
  };
}

export function deleted() {
  return {
    type: DELETED
  };
}

export function setTemplates(data) {
  return {
    type: SET_TEMPLATES,
    data
  };
}
