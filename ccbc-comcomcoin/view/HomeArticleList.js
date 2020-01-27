import React from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { Card, ListItem } from 'react-native-elements'
import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain

export default class HomeArticleList extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      mode: "",
      screenTitle: "",
      articleList: []
    }
  }
  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.props.navigation.addListener(
      'willFocus', () => this.onWillFocus())
  }

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // 引き継ぎパラメータの取得
    const mode = this.props.navigation.getParam("mode")
    const screenTitle = (mode === "new" ? "最新の記事" : (mode === "popular" ? "人気の記事" : "お気に入り"))
    this.state.mode = mode
    this.setState({
      mode: mode,
      screenTitle: screenTitle
    })

    // ホームAPI.ComComCoinホーム記事情報取得処理の呼び出し
    await fetch(restdomain + '/comcomcoin_home/findHomeArticleList', {
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
            articleList: json.data
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

        {/* -- 記事 -- */}
        <View style={{ height: "90%" }}>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 22 }}>
              {this.state.screenTitle}
            </Text>
          </View>
          <ScrollView>
            <Card containerStyle={{ padding: 0 }}>
              {this.state.articleList.map((item, i) => {
                return (
                  <ListItem
                    key={i}
                    titleStyle={{ fontSize: 16, marginLeft: 0 }}
                    title={item.title}
                    subtitleStyle={{ fontSize: 14, marginLeft: 0 }}
                    subtitle={item.hashtag_str}
                    roundAvatar
                    // avatar={item.avatar}
                    badge={{
                      value: "♡ " + item.good_cnt,
                      textStyle: { fontSize: 10 }
                    }}
                    onPress={() => this.props.navigation.navigate('ArticleRefer', {
                      mode: "home",
                      selectKijiPk: item.t_kiji_pk
                    })}
                  />
                )
              })}
            </Card>
            {/* スクロールが最下部まで表示されないことの暫定対応... */}
            <View style={{ marginBottom: 80 }} />
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
