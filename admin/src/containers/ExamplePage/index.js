import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl } from 'react-intl';
import { bindActionCreators, compose } from 'redux';
import SortableTree, {addNodeUnderParent, removeNodeAtPath} from 'react-sortable-tree';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import id from 'bson-objectid';
import _ from 'lodash';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';

import InputSelect from 'components/InputSelect';
import Wysiwyg from 'components/Wysiwyg';
import Button from 'components/Button';
import InputText from 'components/InputText';
import InputNumber from 'components/InputNumber';
import InputToggle from 'components/InputToggle';
import PopUpWarning from 'components/PopUpWarning';

import styles from './styles.scss';
import { loadData, setElements, persist, setSelected, add, del, setTemplates } from './actions';
import { makeSelectLoading, makeSelectData, makeSelectElements, makeSelectSelected, makeSelectTemplates } from './selectors';
import reducer from './reducer';
import saga from './saga';

const types = [
  'Markdown',
  'Short',
  'Bool',
  'Number'
];

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
      showModalElement: false,
      showModalField: false,
      toDeleteField: {},
      toDeleteElement: {},
      update: true
    };
  }
  handleInputChange = (prop, type = 'string') => event => {
    let value = event.target.value;
    switch (type) {
      case 'number':
        value = parseInt(value);
        if (isNaN(value)) {
          value = this.state.edited.fields[prop].value;
        }
        break;
    }
    this.setState({
      edited: {
        ...this.state.edited,
        fields: {
          ...this.state.edited.fields,
          [prop]: {
            type: this.state.edited.fields[prop].type,
            value: value
          }
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
  updateTemplates() {
    this.props.setTemplates(_.find(this.props.elements, {title: 'Templates'}));
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
    const newObj = obj !== null ? this.getSelectedProps(obj) : obj;
    this.updateTemplates();
    this.setState({edited: newObj});
    this.props.setSelected(newObj);
    this.forceUpdate();
  }
  addNew = (parent, parentKey, getNodeKey) => {
    const strId = id().str;
    const newFile = {
      _id: strId,
      title: strId,
      parent: parent,
      fields: {},
      tmp: {}
    };
    newFile.fields[id().str] = {
      value: '',
      type: 'markdown'
    };
    this.props.setElements(
      addNodeUnderParent({
        treeData: this.props.elements,
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
        label="New page"
        primary
        className={styles.fullWidth}
        style={{marginBottom: 15}}
        onClick={() => {
          this.addNew([], null, getNodeKey);
        }}/>
        </div>
        <div className="col-md-12" style={{ height: 500, margin: '1em .5em 0 1em'}}>
          <SortableTree
          ref="sortableTree"
          style={{overflowX: 'auto', width: 'auto'}}
          className={styles.treeOver}
          onMoveNode={this.handleMoveNode}
          treeData={this.props.elements}
          onChange={data => this.props.setElements(data)}
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
              rowInfo.node.parent[0] && rowInfo.node.parent[0] === this.props.templates._id ? 
              <div></div> : <button onClick={() => {this.addNew(rowInfo.node._id, rowInfo.path[rowInfo.path.length - 1], getNodeKey);}}>+</button>,
              rowInfo.node._id !== this.props.templates._id ? <button onClick={() => {
                this.updateView(rowInfo.node);
                this.setState({toDeleteElement: rowInfo, showModalElement: true});
              }}>-</button> : <div></div>
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
  getFieldByType (prop) {
    const val = this.state.edited.fields[prop];
    switch(val.type) {
      case 'markdown':
        return (<Wysiwyg
        resetProps={true}
        styles={styles}
        key={this.state.edited._id + prop + this.state.update}
        name={prop}
        inputDescription={prop}
        placeholder="Your value..."
        onChange={this.handleInputChange(prop)}
        value={this.state.edited.fields[prop].value}/>);
      case 'short':
        return (<InputText
        name={prop}
        placeholder={'Your value...'}
        onChange={this.handleInputChange(prop)}
        value={this.state.edited.fields[prop].value}/>);
      case 'number':
        return (<InputNumber
        name={prop}
        placeholder={'Your value...'}
        onChange={this.handleInputChange(prop, 'number')}
        value={parseInt(this.state.edited.fields[prop].value)}/>);
      case 'bool':
        return (<InputToggle
          value={Boolean(this.state.edited.fields[prop].value)}
          onChange={this.handleInputChange(prop, 'bool')}/>);
          
    }
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
          <div className={styles.mb_50}>
            <div className="row">
              <div className="col-md-12">
                <input className={styles.prop} value={prop} onChange={this.handleInputChangeProp(prop)}/>
                <InputSelect
                selectOptions={
                  types.map(type => {
                    return {
                      id: type,
                      name: type,
                      value: type,
                      selected: type.toLowerCase() === this.state.edited.fields[prop].type
                    };
                  })
                }
                onChange={(event) => {
                  this.state.edited.fields[prop].type = event.target.value.toLowerCase();
                  this.forceUpdate();
                }}></InputSelect>
              </div>
            </div>
            <div className={styles.relative + ' row'}>
              <div className='col-md-12'>
                {this.getFieldByType(prop)}
              </div>
              <div className={styles.btnDeleteGrp}>
                <button
                className={styles.btnDelete}
                onClick={() => {
                  this.setState({toDeleteField: prop, showModalField: true});
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
          <h2>Import a template</h2>
          <InputSelect
          name="import"
          onChange={(event) => {
            const element = _.filter(this.props.templates.children, {title: event.target.value})[0];
            this.setState({edited: {
              ...this.state.edited,
              fields: {
                ...this.state.edited.fields,
                ...element.fields
              }
            }});
          }}
          value='Select...'
          selectOptions={['Select...', ...(this.props.templates.children.map(obj => obj['title']))]}
          placeholder='Select...'/>
        </div>
        <div className={styles.mb_25}>
          <Button
          primary
          label="+"
          onClick={() => {
            this.state.edited.fields[id().str] = {
              value: '',
              type: 'markdown'
            };
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
        { /*
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
        */}
      </div>
    ) : <div></div>;
    return (
      <div className={styles.examplePage}>
      <PopUpWarning
          isOpen={this.state.showModalElement}
          toggleModal={() => this.setState({ showModalElement: !this.state.showModalElement })}
          popUpWarningType="danger"
          onConfirm={() => {
            this.props.setElements(
              removeNodeAtPath({
                treeData: this.props.elements,
                path: this.state.toDeleteElement.path,
                getNodeKey
              })
            );
            this.state.toDeleteElement.node.deleted = true;
            this.props.del();
            this.updateView(Object.assign({}, defaultState));
            this.setState({showModalElement: false});
          }}
        />
        <PopUpWarning
          isOpen={this.state.showModalField}
          toggleModal={() => this.setState({ showModalField: !this.state.showModalField })}
          popUpWarningType="danger"
          onConfirm={() => {
            this.setState({
              edited: {
                ...this.state.edited,
                fields: this.removeKey(this.state.edited.fields, this.state.toDeleteField)
              }
            });
            this.setState({showModalField: false});
          }}
        />
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3" style={{paddingLeft: 30, paddingTop: 15}}>
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
  setTemplates: PropTypes.func,
  templates: PropTypes.array,
  del: PropTypes.func,
  add: PropTypes.func,
  persist: PropTypes.func,
  setElements: PropTypes.func,
  loadData: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setTemplates,
      loadData,
      setElements,
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
  elements: makeSelectElements(),
  selected: makeSelectSelected(),
  templates: makeSelectTemplates()
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'examplePage', reducer });
const withSaga = injectSaga({ key: 'examplePage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(injectIntl(ExamplePage));
