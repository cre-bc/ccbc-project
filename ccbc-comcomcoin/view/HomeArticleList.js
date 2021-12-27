import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Divider, ListItem } from "react-native-elements";
import Spinner from "react-native-loading-spinner-overlay";
import moment from "moment";
import "moment/locale/ja";

import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";

const restdomain = require("./common/constans.js").restdomain;

export default class HomeArticleList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      mode: "",
      screenTitle: "",
      articleList: [],
      screenNo: 0,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.setState({ isProcessing: true });

    this.props.navigation.addListener("willFocus", () => this.onWillFocus());
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    // 引き継ぎパラメータの取得
    const mode = this.props.navigation.getParam("mode");
    const screenTitle =
      mode === "new"
        ? "最新の記事"
        : mode === "unread"
          ? "未読レスの記事"
          : mode === "my"
            ? "My記事リスト"
            : "お気に入り";
    this.state.mode = mode;
    this.setState({
      mode: mode,
      screenTitle: screenTitle,
    });
    if (screenTitle === "最新の記事") {
      this.state.screenNo = 8;
    } else if (screenTitle === "未読レスの記事") {
      this.state.screenNo = 9;
    } else {
      this.state.screenNo = 17;
    }

    //アクセス情報登録
    this.setAccessLog();

    // ホームAPI.ComComCoinホーム記事情報取得処理の呼び出し
    await fetch(restdomain + "/comcomcoin_home/findHomeArticleList", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        async function (json) {
          // API戻り値の確認
          if (!await this.checkApiResult(json)) {
            return;
          }
          if (typeof json.data === "undefined") {
            // 結果が取得できない場合は終了
          } else {
            // 取得したデータをStateに格納
            this.setState({ articleList: json.data });
          }
        }.bind(this)
      )
      .catch((error) => this.errorApi(error));

    this.setState({ isProcessing: false });
  };

  render() {
    return (
      <View style={styles.container}>
        {/* -- 処理中アニメーション -- */}
        <Spinner
          visible={this.state.isProcessing}
          textContent={"Processing…"}
          textStyle={styles.spinnerTextStyle}
        />

        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- 記事 -- */}
        <View style={{ height: "90%" }}>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ fontSize: 22 }}>{this.state.screenTitle}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Divider
              style={{ backgroundColor: "silver", height: 1.5, marginTop: 5 }}
            />
            {this.state.articleList.map((item, i) => {
              var cnt =
                item.res_cnt < 10
                  ? item.res_cnt + " "
                  : item.res_cnt > 99
                    ? "99"
                    : item.res_cnt;

              var mode = this.props.navigation.getParam("mode");
              var comcompark = 5;
              var lifehack = 1;
              var culture = 2;
              var information = 3;
              var eat = 4;
              var eventplan = 7;
              var convenience = 8;
              var relay = 50;

              if (mode === "my") {
                var avatarStyleWidth = 50;
                var avatarStyleHeight = 50;
              } else {
                var avatarStyleWidth = 60;
                var avatarStyleHeight = 45;
              }

              var avatar =
                item.file_path === "" || item.file_path === null
                  ? require("./../images/icon-noimage.png")
                  : { uri: restdomain + `/uploads/article/${item.file_path}` };

              // modeが「my」の場合、カテゴリー別でサムネをアイコンに設定
              avatar =
                // 「ComComひろば」の場合
                mode === "my" && item.t_kiji_category_pk === comcompark
                  ? {
                    uri: restdomain + `/uploads/category/list/comcompark.png`,
                  }
                  : // 「イベント企画」の場合
                  mode === "my" && item.t_kiji_category_pk === lifehack
                    ? {
                      uri: restdomain + `/uploads/category/list/lifehack.png`,
                    }
                    : // 「カルチャー」の場合
                    mode === "my" && item.t_kiji_category_pk === culture
                      ? {
                        uri: restdomain + `/uploads/category/list/culture.png`,
                      }
                      : // 「イベントinfo」の場合
                      mode === "my" && item.t_kiji_category_pk === information
                        ? {
                          uri: restdomain + `/uploads/category/list/infomation.png`,
                        }
                        : // 「おいしいお店」の場合
                        mode === "my" && item.t_kiji_category_pk === eat
                          ? { uri: restdomain + `/uploads/category/list/eat.png` }
                          : // 「イベント★企画」の場合
                          mode === "my" && item.t_kiji_category_pk === eventplan
                            ? {
                              uri: restdomain + `/uploads/category/list/event.png`,
                            }
                            : // 「社内コンビニ」の場合
                            mode === "my" && item.t_kiji_category_pk === convenience
                              ? {
                                uri:
                                  restdomain + `/uploads/category/list/convenience.png`,
                              }
                              : // 「記事投稿リレー」の場合
                              mode === "my" && item.t_kiji_category_pk === relay
                                ? {
                                  uri: restdomain + `/uploads/category/list/relay.png`,
                                }
                                : // 何もしない
                                avatar;

              return (
                <ListItem
                  key={i}
                  titleStyle={{ fontSize: 18, marginLeft: 20 }}
                  title={item.title}
                  titleNumberOfLines={2}
                  subtitleStyle={{ fontSize: 16, marginLeft: 20 }}
                  subtitle={
                    moment(new Date(item.post_dt)).format("YYYY/MM/DD") +
                    "　" +
                    item.hashtag_str
                  }
                  // roundAvatar
                  // avatar={{ uri: restdomain + `/uploads/article/${item.file_path}` }}
                  // avatar={require('./../images/icon-noimage.png')}
                  avatar={avatar}
                  avatarContainerStyle={{ padding: 5, marginLeft: 5 }}
                  avatarStyle={{
                    width: avatarStyleWidth,
                    height: avatarStyleHeight,
                  }}
                  badge={{
                    value: "レス " + cnt,
                    containerStyle: { width: 65 },
                    textStyle: { fontSize: 12 },
                  }}
                  onPress={() =>
                    this.props.navigation.navigate("ArticleRefer", {
                      mode: "home",
                      selectKijiPk: item.t_kiji_pk,
                      viewMode: "multi",
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
  header: {},
  menu_item: {
    flexDirection: "row",
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30,
  },
  menu_icon: {
    width: 50,
    height: 50,
  },
  menu_button: {},
  menu_icon_view: {},
  menu_button_view: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10,
  },
  spinnerTextStyle: {
    color: "#FFF",
    fontSize: 18,
  },
});
