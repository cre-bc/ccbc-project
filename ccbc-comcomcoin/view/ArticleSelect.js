import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ScrollView,
  Image,
} from "react-native";
import { Icon } from "react-native-elements";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";

const restdomain = require("./common/constans.js").restdomain;

export default class ArticleSelect extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      categoryList: [],
      screenNo: 14,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    //アクセス情報登録
    this.setAccessLog();

    // 記事API.記事カテゴリ一覧取得処理の呼び出し
    await fetch(restdomain + "/article/findCategoryApp", {
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
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return;
          }
          // 取得したデータをStateに格納
          this.setState({ categoryList: json.data });
        }.bind(this)
      )
      .catch((error) => this.errorApi(error));
  };

  /** 記事照会画面へ遷移 */
  onPressCategory = async (selectCategory) => {
    this.props.navigation.navigate("ArticleRefer", {
      mode: "article",
      selectCategory: selectCategory,
      viewMode: "multi"
    });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "ivory" }}>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- 記事カテゴリ（繰り返し） -- */}
        <View style={{ marginTop: 20 }} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.categoryList.map((item, i) => {
            const btnMargin = item.spe_category_flg === "0" ? 0 : 20;
            const btnColor =
              item.spe_category_flg === "0" ? "#AA0000" : "#00AA00";
            return (
              <TouchableHighlight
                onPress={() => this.onPressCategory(item)}
                key={i}
                style={{ marginTop: btnMargin }}
              >
                <View
                  style={[styles.articleLine, { backgroundColor: btnColor }]}
                >
                  <View style={styles.articleTitleView}>
                    <Image
                      style={{
                        width: 35,
                        height: 35,
                        marginLeft: 10,
                        marginRight: 10,
                      }}
                      source={{
                        uri:
                          restdomain +
                          `/uploads/category/articleSelect/${item.category_file_path}`,
                      }}
                    />
                    <Text style={styles.articleTitleText}>
                      {item.category_nm}
                    </Text>
                  </View>
                  {/* 未読マーク */}
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    {(() => {
                      if (item.midoku_cnt > 0) {
                        return (
                          <View style={styles.nonReadMark}>
                            <Text style={styles.nonReadMarkStr}>
                              {"   " + item.midoku_cnt + "   "}
                            </Text>
                          </View>
                        );
                      }
                    })()}
                  </View>
                  <View
                    style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}
                  >
                    <Icon
                      name="chevron-right"
                      type="font-awesome"
                      color="white"
                    />
                  </View>
                </View>
              </TouchableHighlight>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  articleLine: {
    borderRadius: 20,
    alignItems: "center",
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    // backgroundColor: '#AA0000',
    flexDirection: "row",
  },
  articleTitleView: {
    flexDirection: "row",
    alignItems: "center",
    flex: 6,
  },
  articleTitleText: {
    fontSize: 26,
    color: "white",
    padding: 10,
    flexDirection: "column",
  },
  nonReadMark: {
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#FF3333",
    borderRadius: 50,
    borderColor: "white",
  },
  nonReadMarkStr: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
  },
});
