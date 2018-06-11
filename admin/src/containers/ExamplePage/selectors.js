import { createSelector } from 'reselect';

/**
 * Direct selector to the examplePage state domain
 */
const selectExamplePageDomain = () => state => state.get('examplePage');

/**
 * Default selector used by HomePage
 */

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
