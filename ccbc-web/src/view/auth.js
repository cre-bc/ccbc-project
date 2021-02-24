import React, { Component } from "react";
import { Route, Redirect, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

class Auth extends Component {
  static PropTypes = {
    user: PropTypes.string,
  };

  componentWillMount() {
    this.userWillTransfer();
  }

  userWillTransfer() {
    if (!sessionStorage.getItem("sessionId")) {
      this.setState({ isAuthenticated: false });
    } else {
      this.setState({ isAuthenticated: true });
    }
  }

  render() {
    return this.state.isAuthenticated ? (
      <Route children={this.props.children} />
    ) : (
      <Redirect to={"/"} />
    );
  }
}

export default withRouter(Auth);
