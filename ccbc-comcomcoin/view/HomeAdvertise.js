import React from 'react'
import { StyleSheet, View, Image, ScrollView, Dimensions } from 'react-native'
import { Text } from 'react-native-elements'
import Hyperlink from 'react-native-hyperlink'
import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain
const windowWidth = Dimensions.get('window').width

export default class HomeAdvertise extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      renban: "",
      file_path: "",
      comment: ""
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // 引き継ぎパラメータの取得
    const renban = this.props.navigation.getParam("renban")
    this.state.renban = renban

    // ホームAPI.ComComCoinホーム広告情報取得処理の呼び出し
    await fetch(restdomain + '/comcomcoin_home/findHomeAdvertise', {
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
            file_path: json.data.file_path,
            comment: json.data.comment
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

        {/* -- 広告 -- */}
        <View style={{ height: "90%" }}>
          <ScrollView>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {/* 画像 */}
              <Image resizeMode="contain" flexDirection="row" alignItems="center"
                source={{ uri: restdomain + `/uploads/advertise/${this.state.file_path}` }}
                resizeMode="cover"
                style={{ height: windowWidth * 9 / 16, width: windowWidth }} />
            </View>
            <View style={{ marginTop: 10, padding: 10 }}>
              {/* コメント */}
              <Hyperlink linkDefault={true} linkStyle={{ color: '#2980b9', textDecorationLine: 'underline' }}>
                <Text selectable style={{ fontSize: 18, lineHeight: 18 * 1.5 }}>
                  {this.state.comment}
                </Text>
              </Hyperlink>
            </View>
            {/* スクロールが最下部まで表示されないことの暫定対応... */}
            <View style={{ marginBottom: 50 }} />
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5FCFF'
    backgroundColor: "ivory"
  }
})
