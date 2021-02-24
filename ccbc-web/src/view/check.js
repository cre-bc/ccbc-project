import React, { Component } from "react";
import request from "superagent";
import { Redirect, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {},
});

class CheckForm extends Component {
  state = {
    msg: "",
    inputtext: "",
    aaa: "aaa",
  };

  onClick = (event) => {
    this.setState({ msg: "" });
    var test = document.getElementById("test").value;
    this.setState({ inputtext: test });
    this.state.inputtext = test;

    request
      .post("/server/check")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          this.setState({ msg: "予期せぬエラーです。" });
          return;
        }
        var result = res.body.status;
        if (result) {
          window.location.href = "/check_success";
        } else {
          this.setState({ msg: "入力エラーです。testを入力してください。" });
        }
      });
  };

  render() {
    return (
      <div>
        <label>"test"を入力したら画面遷移する</label>
        <br />
        <input type="text" id="test" />
        <br />
        <button onClick={this.onClick} type="button">
          チェック
        </button>
        <br />
        {this.state.msg}
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(CheckForm);
