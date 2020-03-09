import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";
import io from "socket.io-client";

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

export default class ChatSelectForm extends BaseComponent {
  constructor(props) {
    super();
    this.state = {
      resultList: [],
      userid: null,
      password: null,
      loginShainPk: 0,
      imageFileName: null,
      shimei: null,
      kengenCd: null
    };
    this.props = props;
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    if (!socket.disconnected) {
      socket.disconnect();
    }
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());
  };

  /** コンポーネントのマウント時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    /** テスト用 */
    /**======================================== */
    // this.setState({ userid: "1001" });
    // this.setState({ password: "5555" });
    // this.setState({ loginShainPk: 1 });
    // this.state.loginShainPk = 2;
    /**======================================== */

    // 初期表示情報取得
    this.findChatUser();
  };

  //画面初期表示情報取得
  findChatUser = async () => {
    await fetch(restdomain + "/chat_select/find", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" })
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
          // 検索結果の取得
          var dataList = json.data;
          this.setState({ resultList: dataList });
        }.bind(this)
      )
      .catch(error => console.error(error));
  };

  /** チャットユーザー選択 */
  onPressChatMsgButton = (e, t_shain_Pk, shimei, image_file_nm) => {
    // 画面遷移
    this.props.navigation.navigate("ChatMsg", {
      fromShainPk: t_shain_Pk,
      shimei: shimei,
      image_file_nm: image_file_nm
    });
  };

  render() {
    return (
      <View style={styles.container}>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        <ScrollView>
          {/* -- リスト -- */}
          {/* 未読が0件の場合はバッジを非表示にする */}
          {this.state.resultList.map(n => {
            if (n.new_info_cnt == 0) {
              return (
                <ListItem
                  key={n.t_shain_pk}
                  roundAvatar
                  title={n.shimei}
                  titleStyle={{ fontSize: 20 }}
                  avatar={<Avatar rounded medium source={{ uri: restdomain + `/uploads/${n.image_file_nm}` }} />}
                  onPress={e =>
                    this.onPressChatMsgButton(
                      e,
                      `${n.t_shain_pk}`,
                      `${n.shimei}`,
                      `${n.image_file_nm}`
                    )
                  }
                />
              );
            } else {
              return (
                <ListItem
                  key={n.t_shain_pk}
                  roundAvatar
                  title={n.shimei}
                  titleStyle={{ fontSize: 20 }}
                  avatar={<Avatar rounded medium source={{ uri: restdomain + `/uploads/${n.image_file_nm}` }} />}
                  badge={{
                    value: n.new_info_cnt,
                    textStyle: { color: "#FFFFFF" },
                    containerStyle: { backgroundColor: "#ff5622" }
                  }}
                  onPress={e =>
                    this.onPressChatMsgButton(
                      e,
                      `${n.t_shain_pk}`,
                      `${n.shimei}`,
                      `${n.image_file_nm}`
                    )
                  }
                />
              );
            }
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "ivory"
  }
});
