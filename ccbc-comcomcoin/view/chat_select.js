import React from "react"
import { StyleSheet, View, ScrollView } from "react-native"
import { ListItem, Avatar } from "react-native-elements"
import io from "socket.io-client"

import BaseComponent from "./components/BaseComponent"
import InAppHeader from "./components/InAppHeader"

const restdomain = require("./common/constans.js").restdomain
const restdomain_ws = require("./common/constans.js").restdomain_ws
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] })

export default class ChatSelectForm extends BaseComponent {
  constructor(props) {
    super()
    this.state = {
      resultList: []
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // 初期表示情報取得処理（gobackで戻る場合に呼ばれるようイベントを関連付け）
    this.props.navigation.addListener("willFocus", () => this.onWillFocus())
  }

  /** コンポーネントのアンマウント時処理 */
  componentWillUnmount = async () => {
    if (!socket.disconnected) {
      // websocket切断
      socket.disconnect()
    }
  }

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // チャットを受信した際に、一覧を再表示する
    if (!socket.connected) {
      // websocket接続
      socket.connect()
    }

    // チャットメッセージの受信（websocket）
    socket.on("comcomcoin_chat",
      async function (message) {
        await this.findChatUser()
      }.bind(this)
    )

    // チャットルーム（自分の社員PK）に接続
    socket.emit("join", this.state.loginShainPk)

    // 初期表示情報取得
    this.findChatUser()
  }

  /** 画面初期表示情報取得 */
  findChatUser = async () => {
    await fetch(restdomain + "/chat_select/find", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" })
    })
      .then(function (response) {
        return response.json()
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return
          }
          // 検索結果の取得
          var dataList = json.data
          this.setState({ resultList: dataList })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** チャットユーザー選択 */
  onPressChatMsgButton = (e, t_shain_Pk, shimei, image_file_nm, expo_push_token) => {
    // チャット画面に遷移
    this.props.navigation.navigate("ChatMsg", {
      fromShainPk: t_shain_Pk,
      fromShimei: shimei,
      fromImageFileNm: image_file_nm,
      fromExpoPushToken: expo_push_token
    })
  }

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
                      `${n.image_file_nm}`,
                      `${n.expo_push_token}`
                    )
                  }
                />
              )
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
                      `${n.image_file_nm}`,
                      `${n.expo_push_token}`
                    )
                  }
                />
              )
            }
          })}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "ivory"
  }
})
