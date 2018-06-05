import request from 'utils/request';
import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest, put, fork, take, cancel, call, select } from 'redux-saga/effects';
import { loadedData, persisted } from './actions';
import { LOAD_DATA, PERSIST } from './constants';
import {
  makeSelectSelected
} from './selectors';

export function* loadData() {
  try {
    const data = yield call(request, '/explorer/elements', { method: 'get' });
    yield put(loadedData(data));
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

export function* defaultSaga() {
  const loadDataWatcher = yield fork(takeLatest, LOAD_DATA, loadData);
  yield fork(takeLatest, PERSIST, persist);
  yield take(LOCATION_CHANGE);
  yield cancel(loadDataWatcher);
}

export default defaultSaga;
