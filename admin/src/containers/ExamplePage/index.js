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
import InputText from 'components/InputText';

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
  handleInputChangeTitle = event => {
    const value = event.target.value;
    this.setState({
      edited: {
        ...this.state.edited,
        title: value
      }
    });
  }
  tree() {
    return (
      <div style={{ height: 500}}>
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
        <div className="col-md-12">
          <input className={styles.title} onChange={this.handleInputChangeTitle} value={this.state.edited.title}/>
        </div>
      );
      for (let prop in this.props.selected.fields) {
        field.push(
          <div>
            <div className="col-md-3">
              <h2>{prop}</h2>
            </div>
            <div className={styles.mb_25 + ' col-md-12'}>
              <InputText
              styles={styles}
              key={prop}
              name={prop}
              inputDescription={prop}
              placeholder={this.props.selected.fields[prop]}
              onChange={this.handleInputChange(prop)}
              value={this.state.edited.fields[prop]}></InputText>
            </div>
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
        this.state.edited.tmp.title = this.state.edited.title;
        this.state.edited.tmp.fields = this.state.edited.fields;
        this.props.setSelected({
          _id: this.props.selected._id,
          title: this.state.edited.title,
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
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3">
                {this.tree()}
              </div>
              <div className={styles.card + ' col-md-9'}>
                <div>
                  {selectedElement}
                </div>
                <div className="col-md-12">
                  {renderBtn}
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
