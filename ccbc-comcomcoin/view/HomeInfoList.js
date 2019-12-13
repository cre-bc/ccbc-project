import React from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { Card, ListItem } from 'react-native-elements'
import moment from 'moment'
import 'moment/locale/ja'
import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain

export default class HomeInfoList extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      inforList: []
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // ホームAPI.ComComCoinホームお知らせ一覧取得処理の呼び出し
    await fetch(restdomain + '/comcomcoin_home/findHomeInfoList', {
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
            inforList: json.data
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
            <Card containerStyle={{ padding: 0 }}>
              {this.state.inforList.map((item, i) => {
                return (
                  <ListItem
                    key={i}
                    titleStyle={{ fontSize: 12, marginLeft: 0 }}
                    title={item.title}
                    subtitleStyle={{ fontSize: 10, marginLeft: 0 }}
                    subtitle={moment(new Date(item.notice_dt)).format('YYYY/MM/DD')}
                    onPress={() => this.props.navigation.navigate('HomeInformation', {
                      renban: item.renban
                    })} />
                )
              })}
            </Card>
            {/* スクロールが最下部まで表示されないことの暫定対応... */}
            <View style={{ marginBottom: 80 }} />
          </ScrollView>
        </View>
      </View >
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF'
  }
})
