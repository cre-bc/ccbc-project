import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TextInput,
  TouchableHighlight,
  AsyncStorage,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import io from "socket.io-client";

import BaseComponent from "./components/BaseComponent";
import ConfirmDialog from "./components/ConfirmDialog";
import AlertDialog from "./components/AlertDialog";
import InAppHeader from "./components/InAppHeader";

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

export default class ChatCoinForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.inputRefs = {};
    this.state = {
      comment: "",
      resultList: [],
      fromShainPk: 0,
      fromShimei: null,
      fromImageFileName: null,
      fromExpoPushToken: null,
      confirmDialogVisible: false,
      confirmDialogMessage: "",
      alertDialogVisible: false,
      alertDialogMessage: "",
      height: 0,
      isProcessing: false,
      chatGroupNm: null,
      resultMemberList: [],
      chatGroupPk: 0,
      screenNo: 19,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
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

    // websocket切断
    if (socket.connected) {
      socket.close();
      socket.disconnect();
    }

    // websocket接続
    socket.connect();

    // 前画面情報取得
    // チャットグループ名
    this.state.chatGroupNm = this.props.navigation.getParam("chatGroupNm");
    // チャット相手(グループ所属メンバー情報)
    this.state.resultMemberList = this.props.navigation.getParam(
      "resultMemberList"
    );
    // チャットグループ
    this.state.chatGroupPk = this.props.navigation.getParam("chatGroupPk");
    this.loadItem();
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

  /** 送信ボタン押下 */
  onClickSend = async () => {
    // 入力チェック
    var alertMessage = "";

    // コメント未入力チェック
    if (
      typeof this.state.comment === "undefined" ||
      (this.state.comment != null && this.state.comment.length === 0)
    ) {
      alertMessage += "コメントを入力してください\n\n";
    }

    // エラーメッセージを設定
    if (alertMessage !== "") {
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage,
      });
      return;
    }

    // 確認ダイアログを表示（YESの場合、send()を実行）
    this.setState({
      confirmDialogVisible: true,
      confirmDialogMessage: "メッセージを通知します。よろしいですか？",
    });
  };

  /** 確認ダイアログでYES押下 */
  send = async () => {
    this.setState({ confirmDialogVisible: false });

    await fetch(restdomain + "/group_chat_push/create", {
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
          if (json.status) {
            // チャットメッセージの送信
            const message = {
              room_id: this.state.chatGroupPk,
              to_shain_pk: this.state.loginShainPk,
              _id: json.t_chat_pk,
              text: this.state.comment,
              createdAt: new Date(),
              imageFileName: this.state.imageFileName,
              userid: this.state.userid,
              chatGroupPk: this.state.chatGroupPk,
            };
            socket.emit("comcomcoin_chat", JSON.stringify(message));
            // storageの削除
            this.removeInfo();
            // チャット画面に遷移
            this.props.navigation.navigate("GroupChatMsg", {
              chatGroupPk: this.state.chatGroupPk,
              chatGroupNm: this.state.chatGroupNm,
            });
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** AsyncStorageから入力内容を読み込み */
  loadItem = async () => {
    try {
      var strageKey =
        this.state.userid + this.state.chatGroupPk + "groupChatPush";
      console.log(strageKey);
      const groupChatPushStrage = await AsyncStorage.getItem(strageKey);
      if (groupChatPushStrage) {
        const groupChatPushInfo = JSON.parse(groupChatPushStrage);
        this.setState({
          comment: groupChatPushInfo["comment"],
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  // コメントの入力テキスト変更時
  handleCommentTextChange = async (comment) => {
    this.setState({ comment });
    try {
      let groupChatPushInfo = {
        comment: comment,
      };
      const groupChatPushStrage = JSON.stringify(groupChatPushInfo);
      // keyはユーザーID（自分） + グループチャットPK + groupChatPush
      var strageKey =
        this.state.userid + this.state.chatGroupPk + "groupChatPush";
      await AsyncStorage.setItem(strageKey, groupChatPushStrage);
    } catch (e) {
      console.log(e);
    }
  };

  /** AsyncStorageから入力内容を削除 */
  removeInfo = async () => {
    try {
      var strageKey =
        this.state.userid + this.state.chatGroupPk + "groupChatPush";
      await AsyncStorage.removeItem(strageKey);
    } catch (error) {
      return;
    }
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

        {/* -- 画面タイトル -- */}
        <View style={[styles.screenTitleView, { flexDirection: "row" }]}>
          {/* 空項目 */}
          <View style={{ flex: 1, alignItems: "flex-start" }} />
          {/* チャット相手 */}
          <View style={{ alignItems: "center" }}>
            <Text style={styles.screenTitleText}>
              {this.props.navigation.getParam("chatGroupNm")}
            </Text>
          </View>
          {/* 空項目 */}
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>

        {/* <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 16 }} />
          <Text
            style={{
              fontSize: 16,
              marginLeft: 16,
              marginTop: 20,
              color: "gray",
            }}
          >
            コメント
          </Text>
          <TextInput
            multiline={true}
            numberOfLines={8}
            scrollEnabled={false}
            style={[styles.inputText, { textAlignVertical: "top" }]}
            value={this.state.comment}
            onChangeText={this.handleCommentTextChange}
          />

          <Text style={{ fontSize: 16 }} />
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <TouchableHighlight onPress={() => this.onClickSend()}>
                <View style={styles.saveButton}>
                  <Image
                    source={require("./../images/push_icon.png")}
                    style={styles.menu_icon}
                  />
                  <View style={styles.articleTitleView}>
                    <Text style={styles.articleTitleText}>送信する</Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </ScrollView>
        {/* </KeyboardAvoidingView> */}

        {/* -- 確認ダイアログ -- */}
        <ConfirmDialog
          modalVisible={this.state.confirmDialogVisible}
          message={this.state.confirmDialogMessage}
          handleYes={this.send.bind(this)}
          handleNo={() => {
            this.setState({ confirmDialogVisible: false });
          }}
          handleClose={() => {
            this.setState({ confirmDialogVisible: false });
          }}
        />

        {/* -- メッセージダイアログ -- */}
        <AlertDialog
          modalVisible={this.state.alertDialogVisible}
          message={this.state.alertDialogMessage}
          handleClose={() => {
            this.setState({ alertDialogVisible: false });
          }}
        />
      </View>
    );
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black",
  },
  inputAndroid: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "ivory",
  },
  menu_icon: {
    width: 25,
    height: 25,
  },
  saveButton: {
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#ff9800",
    flexDirection: "row",
    justifyContent: "center",
  },
  articleTitleView: {
    alignItems: "center",
  },
  articleTitleText: {
    fontSize: 26,
    color: "white",
    padding: 10,
  },
  screenTitleText: {
    fontSize: 18,
    color: "white",
    padding: 10,
    textAlign: "center",
    alignSelf: "center",
  },
  screenTitleView: {
    alignItems: "center",
    backgroundColor: "#ff5622",
  },
  inputText: {
    fontSize: 16,
    color: "black",
    padding: 5,
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
  },
});
