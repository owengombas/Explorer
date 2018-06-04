import request from 'utils/request';
import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest, put, fork, take, cancel, call } from 'redux-saga/effects';
import { loadedData } from './actions';
import { LOAD_DATA } from './constants';

export function* loadData() {
  try {
    const data = yield call(request, '/explorer/elements', { method: 'get' });
    yield put(loadedData(data));
  } catch(err) {
    console.log(err.response.payload);
  }
}

export function* submit() {
  try {
    const data = yield call(request, '/explorer/elements/', { method: 'post', body: '', params });
    yield put(loadedData(data));
  } catch(err) {
    console.log(err.response.payload);
  }
}

export function* defaultSaga() {
  const loadDataWatcher = yield fork(takeLatest, LOAD_DATA, loadData);
  yield take(LOCATION_CHANGE);
  yield cancel(loadDataWatcher);
}

export default defaultSaga;
