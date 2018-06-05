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
import { loadData, setTreeData, persist, setSelected } from './actions';
import { makeSelectLoading, makeSelectData, makeSelectTreeData, makeSelectSelected } from './selectors';
import reducer from './reducer';
import saga from './saga';

export class ExamplePage extends React.Component {
  selected = null;
  constructor(props) {
    super(props);
    props.loadData();
    this.state = {
      edited: {
        _id: '',
        tmp: false,
        title: '',
        fields: []
      }
    };
  }
  handleInputChange = prop => event => {
    const value = event.target.value;
    this.setState({
      edited: {
        ...this.state.edited,
        fields: {
          ...this.state.edited.fields,
          [prop]: value
        }
      }
    });
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
            const newObj = {
              _id: rowInfo.node._id,
              title: rowInfo.node.title,
              fields: rowInfo.node.fields,
              tmp: rowInfo.node
            };
            this.props.setSelected(newObj);
            this.setState({edited: newObj});
            this.forceUpdate();
          }
        })}>
        </SortableTree>
      </div>
    );
  }
  fields () {
    if(this.props.selected !== null) {
      const field = [];
      field.push(
        <div>
          <input class="title" value={this.props.selected.title}/>
        </div>
      );
      for (let prop in this.props.selected.fields) {
        field.push(
          <div>
            <span>{prop}</span>
            <input placeholder={this.props.selected.fields[prop]} onChange={this.handleInputChange(prop)} value={this.state.edited.fields[prop]}/>
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
    const renderBtn = this.props.selected ? (
      <Button
      primary
      onClick={() => {
        this.state.edited.tmp.fields = this.state.edited.fields;
        this.props.setSelected({
          _id: this.props.selected._id,
          title: this.props.selected.title,
          fields: {
            ...this.props.selected.fields,
            ...this.state.edited.fields
          }
        });
        this.props.persist();
      }}
      label="Apply"/>
    ) : <div></div>;
    return (
      <div className={styles.examplePage}>
        <div className="row">
          <div className="col-md-3">
            {this.tree()}
          </div>
          <div className="col-md-9 card">
            <div>
              {selectedElement}
            </div>
            <div>
              {renderBtn}
            </div>
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
  selected: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
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
      persist,
      setSelected
    },
    dispatch,
  );
}

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  data: makeSelectData(),
  treeData: makeSelectTreeData(),
  selected: makeSelectSelected()
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'examplePage', reducer });
const withSaga = injectSaga({ key: 'examplePage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(injectIntl(ExamplePage));
