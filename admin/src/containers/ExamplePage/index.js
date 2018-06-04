import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl } from 'react-intl';
import { bindActionCreators, compose } from 'redux';
import SortableTree from 'react-sortable-tree';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';

import Button from 'components/Button';

import styles from './styles.scss';
import { loadData, setTreeData, persist } from './actions';
import { makeSelectLoading, makeSelectData, makeSelectTreeData } from './selectors';
import reducer from './reducer';
import saga from './saga';

export class ExamplePage extends React.Component {
  selected = null;
  constructor(props) {
    super(props);
    props.loadData();
  }
  tree() {
    return (
      <div style={{ height: 500, width: 300}}>
        <SortableTree
        treeData={this.props.treeData}
        onChange={data => this.props.setTreeData(data)}
        theme={FileExplorerTheme}
        canDrag={false}
        generateNodeProps={rowInfo => ({
          onClick: () => {
            this.selected = rowInfo.node;
            this.forceUpdate();
            console.log(rowInfo.node);
          }
        })}>
        </SortableTree>
      </div>
    );
  }
  fields () {
    if(this.selected !== null) {
      const field = [];
      for (let prop in this.selected.fields) {
        field.push(
          <div>
            <span>{prop}</span>
            <input placeholder={this.selected.fields[prop]}/>
          </div>
        );
      }
      return field;
    } else {
      return <div></div>;
    }
  }
  render() {
    const selectedElement = this.fields();
    return (
      <div className={styles.examplePage}>
        <div className="row">
          <div className="col-md-3">
            {this.tree()}
          </div>
          <div className="col-md-9 card">
            {selectedElement}
            <Button
            primary
            onClick={this.props.persist(this.selected)}
            label="Apply"/>
          </div>
        </div>
      </div>
    );
  }
}

ExamplePage.contextTypes = {
  router: PropTypes.object,
};

ExamplePage.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  persist: PropTypes.func,
  setTreeData: PropTypes.func,
  loadData: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadData,
      setTreeData,
      persist
    },
    dispatch,
  );
}

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  data: makeSelectData(),
  treeData: makeSelectTreeData()
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'examplePage', reducer });
const withSaga = injectSaga({ key: 'examplePage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(injectIntl(ExamplePage));
