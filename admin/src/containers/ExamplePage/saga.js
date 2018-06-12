import request from 'utils/request';
import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest, put, fork, take, cancel, call, select } from 'redux-saga/effects';
import { loadedData, persisted, added, deleted } from './actions';
import { LOAD_DATA, PERSIST, ADD, DEL } from './constants';
import {
  makeSelectSelected
} from './selectors';

export function* loadData() {
  try {
    const elements = yield call(request, '/explorer/elements', { method: 'get' });
    const templates = yield call(request, '/explorer/templates', { method: 'get' });
    console.log(templates);
    yield put(loadedData({
      elements: elements,
      templates: templates
    }));
  } catch(err) {
    strapi.notification.error('Server error');
    console.log(err.response.payload);
  }
}

export function* persist() {
  const selected = yield select(makeSelectSelected());
  try {
    strapi.notification.success('Saved !');
    const data = yield call(request, '/explorer/elements/', {
      method: 'PUT',
      body: JSON.stringify(selected),
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Host': 'strapi'
      }
    }, false, false);
    yield put(persisted(data));
  } catch(err) {
    strapi.notification.error('Server error');
    console.log(err.response.payload);
  }
}

export function* add() {
  const selected = yield select(makeSelectSelected());
  try {
    strapi.notification.success('Added !');
    const data = yield call(request, '/explorer/elements/', {
      method: 'POST',
      body: JSON.stringify(selected),
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Host': 'strapi'
      }
    }, false, false);
    yield put(added(data));
  } catch(err) {
    strapi.notification.error('Server error');
    console.log(err.response.payload);
  }
}

export function* del() {
  const selected = yield select(makeSelectSelected());
  try {
    strapi.notification.success('Deleted !');
    const data = yield call(request, '/explorer/elements/del', {
      method: 'POST',
      body: JSON.stringify(selected),
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Host': 'strapi'
      }
    }, false, false);
    yield put(deleted(data));
  } catch(err) {
    strapi.notification.error('Server error');
    console.log(err.response.payload);
  }
}

export function* defaultSaga() {
  const loadDataWatcher = yield fork(takeLatest, LOAD_DATA, loadData);
  yield fork(takeLatest, PERSIST, persist);
  yield fork(takeLatest, ADD, add);
  yield fork(takeLatest, DEL, del);
  yield take(LOCATION_CHANGE);
  yield cancel(loadDataWatcher);
}

export default defaultSaga;
