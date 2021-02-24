import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as myActions from "../actions/count";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {},
});

class ReduxForm extends Component {
  render() {
    return (
      <div>
        <header>
          Links:
          <ul>
            <li>
              <Link to="/redux_count">count</Link>
            </li>
            <li>
              <Link to="/redux_display">display</Link>
            </li>
          </ul>
        </header>
      </div>
    );
  }
}

const mapState = (state) => ({
  count: state.count,
});

const mapDispatch = (dispatch) => ({
  actions: bindActionCreators(myActions, dispatch),
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState, mapDispatch)(ReduxForm)
);
