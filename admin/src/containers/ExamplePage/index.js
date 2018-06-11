import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl } from 'react-intl';
import { bindActionCreators, compose } from 'redux';
import SortableTree, {addNodeUnderParent, removeNodeAtPath} from 'react-sortable-tree';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import id from 'bson-objectid';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';

import Wysiwyg from 'components/Wysiwyg';
import Button from 'components/Button';
import InputText from 'components/InputText';
import PopUpWarning from 'components/PopUpWarning';

import styles from './styles.scss';
import { loadData, setTreeData, persist, setSelected, add, del } from './actions';
import { makeSelectLoading, makeSelectData, makeSelectTreeData, makeSelectSelected } from './selectors';
import reducer from './reducer';
import saga from './saga';

const defaultState = {
  _id: '',
  parent: [],
  tmp: {},
  title: 'Nothing is selected',
  fields: []
};

export class ExamplePage extends React.Component {
  constructor(props) {
    super(props);
    props.loadData();
    this.state = {
      edited: Object.assign({}, defaultState),
      showModal: false,
      toDelete: {},
      update: true
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
  handleInputChangeProp = prop => event => {
    const newProp = event.target.value;
    const newObj = {};
    for (const [key, value] of Object.entries(this.state.edited.fields)) {
      if (key !== prop) {
        newObj[key] = value;
      } else {
        newObj[newProp] = value;
      }
    }
    this.state.edited.tmp.fields = newObj;
    this.state.edited.fields = newObj;
    this.forceUpdate();
  }
  handleInputChangeTitle = event => {
    const value = event.target.value;
    this.setState({
      edited: {
        ...this.state.edited,
        title: value
      }
    });
  }
  handleMoveNode = ({node, nextParentNode}) => {
    if (nextParentNode) {
      node.parent[0] = nextParentNode._id;
    } else {
      node.parent = [];
    }
    this.updateView(node);
    this.persistData();
  }
  getSelectedProps = (obj) => {
    let m = {
      _id: obj._id,
      parent: obj.parent,
      title: obj.title,
      fields: obj.fields,
      tmp: obj
    };
    return m;
  }
  updateView = (obj) => {
    console.log(obj)
    const newObj = obj !== null ? this.getSelectedProps(obj) : obj;
    this.setState({edited: newObj});
    this.props.setSelected(newObj);
    this.forceUpdate();
  }
  addNew = (parent, parentKey, getNodeKey) => {
    const newFile = {
      _id: id().str,
      title: 'New',
      parent: parent,
      fields: {
        New: ''
      },
      tmp: {}
    };
    this.props.setTreeData(
      addNodeUnderParent({
        treeData: this.props.treeData,
        parentKey: parentKey,
        expandParent: true,
        getNodeKey,
        newNode: newFile,
      }).treeData
    );
    this.updateView(newFile);
    this.props.add(newFile);
    this.forceUpdate();
  }
  tree() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    return (
      <div className="row">
        <div className="col-md-12">
        <Button
        label="New"
        primary
        className={styles.fullWidth}
        onClick={() => {
          this.addNew([], null, getNodeKey);
        }}/>
        </div>
        <div className="col-md-12" style={{ height: 500, margin: '1em .5em 0 1em'}}>
          <SortableTree
          ref="sortableTree"
          onMoveNode={this.handleMoveNode}
          treeData={this.props.treeData}
          onChange={data => this.props.setTreeData(data)}
          theme={FileExplorerTheme}
          className='tree'
          scaffoldBlockPxWidth={20}
          generateNodeProps={rowInfo => ({
            onClick: () => {
              if (!rowInfo.node.deleted) {
                this.updateView(rowInfo.node);
              }
            },
            buttons: [
              <button onClick={() => {
                this.addNew(rowInfo.node._id, rowInfo.path[rowInfo.path.length - 1], getNodeKey);
              }}>+</button>,
              <button onClick={() => {
                this.updateView(rowInfo.node);
                this.setState({toDelete: rowInfo, showModal: true});
              }}>-</button>
            ]
          })}>
          </SortableTree>
        </div>
      </div>
    );
  }
  removeKey(obj, deleteKey) {
    let clone = Object.assign({}, obj);
    delete clone[deleteKey];
    return clone;
  }
  fields () {
    if (this.state.edited._id !== '') {
      const field = [];
      field.push(
        <div>
          <input disabled={!this.state.edited.tmp} className={styles.title} onChange={this.handleInputChangeTitle} value={this.state.edited.title}/>
        </div>
      );
      for (let prop in this.state.edited.fields) {
        field.push(
          <div className={styles.mb_25}>
            <div className="row">
              <div className="col-md-12">
                <input className={styles.prop} value={prop} onChange={this.handleInputChangeProp(prop)}/>
              </div>
            </div>
            <div className={styles.relative + ' row'}>
              <div className='col-md-12'>
                <Wysiwyg
                resetProps={true}
                styles={styles}
                key={this.state.edited._id + prop + this.state.update}
                name={prop}
                inputDescription={prop}
                placeholder="Your value..."
                onChange={this.handleInputChange(prop)}
                value={this.state.edited.fields[prop]}/>
              </div>
              <div className={styles.btnDeleteGrp}>
                <button
                className={styles.btnDelete}
                onClick={() => {
                  this.setState({
                    edited: {
                      ...this.state.edited,
                      fields: this.removeKey(this.state.edited.fields, prop)
                    }
                  });
                }}>-</button>
              </div>
            </div>
          </div>
        );
      }
      return field;
    } else {
      return <div></div>;
    }
  }
  persistData = () => {
    this.state.edited.tmp.title = this.state.edited.title;
    this.state.edited.tmp.fields = this.state.edited.fields;
    this.props.setSelected(this.state.edited);
    this.props.persist();
  }
  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    const selectedElement = this.fields();
    const renderBtn = (!!this.props.selected && this.props.selected._id !== '') ? (
      <div>
        <div className={styles.mb_25}>
          <Button
          primary
          label="+"
          onClick={() => {
            this.state.edited.fields[`New ${Object.keys(this.state.edited.fields).length}`] = '';
            this.fields();
            this.forceUpdate();
          }}/>
        </div>
        <div className={styles.mb_25}>
          <Button
          primary
          disabled={this.props.selected ? (this.props.selected._id === undefined) : true}
          onClick={() => {
            this.persistData();
          }}
          label="Apply"/>
        </div>
        <div className={styles.mb_25}>
          <Button
          primary
          onClick={() => {
            console.log('a', this.props.selected);
            this.updateView(this.props.selected);
            this.setState({update: !this.state.update});
          }}
          label="Cancel"/>
        </div>
      </div>
    ) : <div></div>;
    return (
      <div className={styles.examplePage}>
      <PopUpWarning
          isOpen={this.state.showModal}
          toggleModal={() => this.setState({ showModal: !this.state.showModal })}
          popUpWarningType="danger"
          onConfirm={() => {
            this.props.setTreeData(
              removeNodeAtPath({
                treeData: this.props.treeData,
                path: this.state.toDelete.path,
                getNodeKey
              })
            );
            this.state.toDelete.node.deleted = true;
            this.props.del();
            this.updateView(Object.assign({}, defaultState));
            this.setState({showModal: false});
          }}
        />
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3">
                {this.tree()}
              </div>
              <div className={styles.card + ' col-md-9'}>
                <div className="row">
                  <div className="col-md-12">
                    {selectedElement}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    {renderBtn}
                  </div>
                </div>
              </div>
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
  del: PropTypes.func,
  add: PropTypes.func,
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
      setSelected,
      add,
      del
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
