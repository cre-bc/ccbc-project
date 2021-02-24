import React, { Component } from "react";
import request from "superagent";
import { Redirect } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {},
});

class CheckSuccessForm extends Component {
  render() {
    return <div>入力チェック成功！</div>;
  }
}

export default withStyles(styles, { withTheme: true })(CheckSuccessForm);
