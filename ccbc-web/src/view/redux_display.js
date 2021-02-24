import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {},
});

class ReduxDisplayForm extends Component {
  handleClick = (event) => {
    this.props.history.push("/redux_display2");
  };
  render() {
    const { count } = this.props;

    return (
      <div style={{ width: "300px", marginLeft: "200px" }}>
        {count.number}
        <div>
          <br />
          <button onClick={this.handleClick}>遷移</button>
        </div>
      </div>
    );
  }
}

const mapState = (state) => ({
  count: state.count,
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState)(ReduxDisplayForm)
);
