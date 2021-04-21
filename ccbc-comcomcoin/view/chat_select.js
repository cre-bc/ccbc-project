import React from "react";
import * as Notifications from "expo-notifications";
import { StyleSheet, View, ScrollView } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import io from "socket.io-client";

import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

export default class ChatSelectForm extends BaseComponent {
  constructor(props) {
    super();
    this.state = {
      resultList: [],
      screenNo: 10,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // チャットメッセージの受信（websocket）
    socket.off("comcomcoin_chat");
    socket.on(
      "comcomcoin_chat",
      async function (message) {
        // チャットを受信した際に、一覧を再表示する
        await this.findChatUser();
      }.bind(this)
    );

    // 初期表示情報取得処理（gobackで戻る場合に呼ばれるようイベントを関連付け）
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());

    // 画面遷移時処理（後処理）
    this.props.navigation.addListener("willBlur", () => this.onwillBlur());
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    //アクセス情報登録
    this.setAccessLog();

    // アプリの未読件数をクリア
    Notifications.getBadgeCountAsync().then((badgeNumber) => {
      if (badgeNumber !== 0) {
        Notifications.setBadgeCountAsync(0);
      }
    });

    // websocket切断
    if (socket.connected) {
      socket.close();
      socket.disconnect();
    }

    // websocket接続
    socket.connect();

    // チャットルーム（自分の社員PK）に接続
    socket.emit("join", this.state.loginShainPk);
    // チャットルーム（グループPK）に接続)
    socket.emit("join", this.state.chatGroupPk);

    // 初期表示情報取得
    this.findChatUser();
  };

  /** 画面遷移時処理（後処理） */
  onwillBlur = async () => {
    if (!socket.disconnected) {
      // websocket切断
      socket.close();
      socket.disconnect();
    }
  };

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

  /** 画面初期表示情報取得 */
  findChatUser = async () => {
    await fetch(restdomain + "/chat_select/find", {
      method: "POST",
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
          // 検索結果の取得
          var dataList = json.data;
          this.setState({ resultList: dataList });
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** チャットユーザー選択 */
  onPressChatMsgButton = (
    e,
    t_shain_Pk,
    shimei,
    image_file_nm,
    expo_push_token,
    t_chat_group_pk,
    chat_group_nm
  ) => {
    // チャット画面に遷移
    if (t_chat_group_pk > 0) {
      // チャットグループ画面に遷移
      this.props.navigation.navigate("GroupChatMsg", {
        chatGroupPk: t_chat_group_pk,
        chatGroupNm: chat_group_nm,
        // fromExpoPushToken: expo_push_token,
      });
    } else {
      this.props.navigation.navigate("ChatMsg", {
        fromShainPk: t_shain_Pk,
        fromShimei: shimei,
        fromImageFileNm: image_file_nm,
        fromExpoPushToken: expo_push_token,
      });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* -- リスト -- */}
          {/* 未読が0件の場合はバッジを非表示にする */}
          {this.state.resultList.map((n) => {
            if (n.new_info_cnt == 0) {
              if (n.t_chat_group_pk == 0 || n.t_chat_group_pk == null) {
                return (
                  <ListItem
                    key={n.t_shain_pk}
                    roundAvatar
                    title={n.shimei}
                    titleStyle={{ fontSize: 20 }}
                    avatar={
                      <Avatar
                        rounded
                        medium
                        source={{
                          uri: restdomain + `/uploads/${n.image_file_nm}`,
                        }}
                      />
                    }
                    onPress={(e) =>
                      this.onPressChatMsgButton(
                        e,
                        `${n.t_shain_pk}`,
                        `${n.shimei}`,
                        `${n.image_file_nm}`,
                        `${n.expo_push_token}`,
                        `${n.t_chat_group_pk}`,
                        `${n.chat_group_nm}`
                      )
                    }
                  />
                );
              } else {
                return (
                  <ListItem
                    key={n.t_shain_pk}
                    roundAvatar
                    title={n.chat_group_nm}
                    titleStyle={{ fontSize: 20 }}
                    avatar={
                      <Avatar
                        rounded
                        medium
                        source={{
                          uri: restdomain + `/uploads/${n.group_image_file_nm}`,
                        }}
                      />
                    }
                    onPress={(e) =>
                      this.onPressChatMsgButton(
                        e,
                        `${n.t_shain_pk}`,
                        `${n.shimei}`,
                        `${n.image_file_nm}`,
                        `${n.expo_push_token}`,
                        `${n.t_chat_group_pk}`,
                        `${n.chat_group_nm}`
                      )
                    }
                  />
                );
              }
            } else {
              if (n.t_chat_group_pk == 0 || n.t_chat_group_pk == null) {
                return (
                  <ListItem
                    key={n.t_shain_pk}
                    roundAvatar
                    title={n.shimei}
                    titleStyle={{ fontSize: 20 }}
                    avatar={
                      <Avatar
                        rounded
                        medium
                        source={{
                          uri: restdomain + `/uploads/${n.image_file_nm}`,
                        }}
                      />
                    }
                    badge={{
                      value: n.new_info_cnt,
                      textStyle: { color: "#FFFFFF" },
                      containerStyle: { backgroundColor: "#ff5622" },
                    }}
                    onPress={(e) =>
                      this.onPressChatMsgButton(
                        e,
                        `${n.t_shain_pk}`,
                        `${n.shimei}`,
                        `${n.image_file_nm}`,
                        `${n.expo_push_token}`,
                        `${n.t_chat_group_pk}`,
                        `${n.chat_group_nm}`
                      )
                    }
                  />
                );
              } else {
                return (
                  <ListItem
                    key={n.t_shain_pk}
                    roundAvatar
                    title={n.chat_group_nm}
                    titleStyle={{ fontSize: 20 }}
                    avatar={
                      <Avatar
                        rounded
                        medium
                        source={{
                          uri: restdomain + `/uploads/${n.group_image_file_nm}`,
                        }}
                      />
                    }
                    badge={{
                      value: n.new_info_cnt,
                      textStyle: { color: "#FFFFFF" },
                      containerStyle: { backgroundColor: "#ff5622" },
                    }}
                    onPress={(e) =>
                      this.onPressChatMsgButton(
                        e,
                        `${n.t_shain_pk}`,
                        `${n.shimei}`,
                        `${n.image_file_nm}`,
                        `${n.expo_push_token}`,
                        `${n.t_chat_group_pk}`,
                        `${n.chat_group_nm}`
                      )
                    }
                  />
                );
              }
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
    backgroundColor: "ivory",
  },
});
