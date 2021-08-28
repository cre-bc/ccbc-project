import React from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Divider, ListItem } from "react-native-elements";
import moment from "moment";
import "moment/locale/ja";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";

const restdomain = require("./common/constans.js").restdomain;

export default class HomeInfoList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      kanrika_flg: "0",
      title: "お知らせ",
      inforList: [],
      screenNo: 6,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // 初期表示情報取得処理（gobackで戻る場合に呼ばれるようイベントを関連付け）
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    //アクセス情報登録
    this.setAccessLog();

    // 引き継ぎパラメータの取得
    const kanrika_flg = this.props.navigation.getParam("kanrika_flg");
    this.state.kanrika_flg = kanrika_flg;
    if (kanrika_flg == "1") {
      this.setState({ title: "管理課より" });
    }

    // ホームAPI.ComComCoinホームお知らせ一覧取得処理の呼び出し
    await fetch(restdomain + "/comcomcoin_home/findHomeInfoList", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return;
          }
          // 取得したデータをStateに格納
          this.setState({
            inforList: json.data,
          });
        }.bind(this)
      )
      .catch((error) => console.error(error));
  }

  /** アクセス情報登録 */
  setAccessLog = async () => {
    await fetch(restdomain + "/access_log/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .catch((error) => console.error(error));
  };

  render() {
    return (
      <View style={styles.container}>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- お知らせ -- */}
        <View style={{ height: "90%" }}>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ fontSize: 22 }}>{this.state.title}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Divider
              style={{ backgroundColor: "silver", height: 1.5, marginTop: 5 }}
            />
            {this.state.inforList.map((item, i) => {
              let new_style = "black";
              if (item.new_flg == "new") {
                new_style = "blue";
              }
              return (
                <ListItem
                  key={i}
                  titleStyle={{ fontSize: 18, marginLeft: 0, color: new_style }}
                  title={item.title}
                  titleNumberOfLines={2}
                  subtitleStyle={{ fontSize: 16, marginLeft: 0 }}
                  subtitle={moment(new Date(item.notice_dt)).format(
                    "YYYY/MM/DD"
                  )}
                  onPress={() =>
                    this.props.navigation.navigate("HomeInformation", {
                      renban: item.renban,
                    })
                  }
                />
              );
            })}
            {/* スクロールが最下部まで表示されないことの暫定対応... */}
            <View style={{ marginBottom: 80 }} />
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "ivory",
  },
});
