import { createSelector } from 'reselect';

const selectExamplePageDomain = () => state => state.get('examplePage');

const makeSelectLoading = () =>
  createSelector(selectExamplePageDomain(), substate => substate.get('loading'));

const makeSelectData = () =>
  createSelector(selectExamplePageDomain(), substate => substate.get('data'));

const makeSelectElements = () =>
  createSelector(selectExamplePageDomain(), substate => substate.get('elements'));

const makeSelectSelected = () =>
  createSelector(selectExamplePageDomain(), substate => substate.get('selected'));

const makeSelectTemplates = () => 
  createSelector(selectExamplePageDomain(), substate => substate.get('templates'));

export { makeSelectLoading, makeSelectData, makeSelectElements, makeSelectSelected, makeSelectTemplates };
