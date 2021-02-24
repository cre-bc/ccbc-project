import React, { Component } from "react";
import request from "superagent";
import { Redirect } from "react-router-dom";

var createObjectURL =
  (window.URL || window.webkitURL).createObjectURL || window.createObjectURL;

export default class ImageForm extends React.Component {
  constructor(props) {
    super(props);
    const params = this.props.match;
    this.state = {
      status: true,
      loaded: false,
      mode: params.params.mode,
      readonly: false,
      message: "",
      resultList: [],
      id: 1,
      gazo: [],
      filename: "",
      image_src: "",
      gazo_res: [],
      image_src_res: "",
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    // プルダウン用のマスタ読み込み
    request.get("/server/find").end((err, res) => {
      if (err) return;
      // 検索結果表示
      this.setState({ resultList: res.body.data });
    });
  }

  getInitialState() {
    return {
      image_src: "",
    };
  }

  handleChangeFile = (event) => {
    // ①イベントからfileの配列を受け取る
    var files = event.target.files;

    this.setState({ gazo: files[0] });
    this.setState({ filename: files[0].name });

    // ②createObjectURLで、files[0]を読み込む
    var image_url = createObjectURL(files[0]);
    // ③setStateする！
    this.setState({ image_src: image_url });
  };

  /** 登録処理 */
  entry = (event) => {
    // 確認ダイアログ
    if (!window.confirm("登録します。よろしいですか？")) {
      return;
    }
    var form = new FormData();
    form.append("image", this.state.gazo);
    request
      .post("/image/update")
      .send(form)
      .end((err, res) => {
        if (err) return;
        // 登録後処理（通知等）
        this.setState({ readonly: true });
        this.setState({ message: "登録が完了しました。" });
        window.scrollTo(0, 0);
      });
  };

  find = (event) => {
    request
      .get("/image/find")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        this.setState({ image_src_res: res.body.data[0].image });
      });
  };

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

    var image = "";
    if (this.state.image_src_res) {
      image = (
        <img
          src={`http://localhost:3001/uploads/${this.state.image_src_res}`}
        />
      );
    }

    return (
      <div>
        <div>
          <h3>
            <a>{this.state.message}</a>
          </h3>
        </div>
        <div>
          <h3>画像登録</h3>
          <input type="file" ref="file" onChange={this.handleChangeFile} />
          <br />
          <img src={this.state.image_src} />
          <br />
          <button onClick={this.entry.bind(this)} type="button">
            登録
          </button>
        </div>
        <br />
        <div>
          <h3>画像取得</h3>
          <button onClick={this.find.bind(this)} type="button">
            取得
          </button>
          <br />
          {image}
        </div>
      </div>
    );
  }
}
