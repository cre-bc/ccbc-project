import React, { Component } from "react";
import request from "superagent";
import { Redirect } from "react-router-dom";

const restdomain = require("../common/constans.js").restdomain;

export default class DbForm extends Component {
  constructor(props) {
    super(props);
    const params = this.props.match;
    this.state = {
      status: true,
      loaded: false,
      mode: params.params.mode,
      readonly: false,
      resultList: [],
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    // プルダウン用のマスタ読み込み
    request.get(restdomain + "/server/find").end((err, res) => {
      if (err) return;
      // 検索結果表示
      this.setState({ resultList: res.body.data });
    });
  }

  render() {
    // 検索結果リスト
    const resultList = this.state.resultList.map((data) => (
      <div>
        ID ： {data.id}
        <br />
        名前 ： {data.name}
        <br />
        パスワード ： {data.pass}
        <hr />
      </div>
    ));

    return <div>{resultList}</div>;
  }
}
