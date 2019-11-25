import React from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { Text } from 'react-native-elements'
import moment from 'moment'
import 'moment/locale/ja'
import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain

export default class HomeInformation extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: "",
      comment: "",
      notice_dt: null,
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // 引き継ぎパラメータの取得
    const renban = this.props.navigation.getParam("renban")
    this.state.renban = renban

    // ホームAPI.ComComCoinホームお知らせ情報取得処理の呼び出し
    await fetch(restdomain + '/comcomcoin_home/findHomeInformation', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function (response) {
        return response.json()
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === 'undefined') {
            return
          }
          // 取得したデータをStateに格納
          this.setState({
            renban: renban,
            title: json.data.title,
            comment: json.data.comment,
            notice_dt: json.data.notice_dt
          })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  render() {
    return (
      <View style={styles.container}>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- お知らせ -- */}
        <View style={{ height: "90%" }}>
          <ScrollView>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {/* お知らせ日 */}
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                {moment(new Date(this.state.notice_dt)).format('YYYY/MM/DD')}
              </Text>
            </View>
            <View style={{ marginTop: 20 }}>
              {/* タイトル ＆ コメント */}
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {this.state.title}{'\n'}
              </Text>
              <Text style={{ fontSize: 16 }}>
                {this.state.comment}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF'
  },
  header: {},
  menu_item: {
    flexDirection: 'row',
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30
  },
  menu_icon: {
    width: 50,
    height: 50
  },
  menu_button: {},
  menu_icon_view: {},
  menu_button_view: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10
  }
})
