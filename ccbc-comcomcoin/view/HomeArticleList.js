import React from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { Divider, ListItem } from 'react-native-elements'
import Spinner from 'react-native-loading-spinner-overlay'
import moment from 'moment'
import 'moment/locale/ja'

import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain

export default class HomeArticleList extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      isProcessing: false,
      mode: "",
      screenTitle: "",
      articleList: []
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.setState({ isProcessing: true })

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
          if (typeof json.data === 'undefined') {
            // 結果が取得できない場合は終了
          } else {
            // 取得したデータをStateに格納
            this.setState({ articleList: json.data })
          }
        }.bind(this)
      )
      .catch(error => console.error(error))

    this.setState({ isProcessing: false })
  }

  render() {
    return (
      <View style={styles.container}>
        {/* -- 処理中アニメーション -- */}
        <Spinner
          visible={this.state.isProcessing}
          textContent={'Processing…'}
          textStyle={styles.spinnerTextStyle}
        />

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
            <Divider style={{ backgroundColor: "silver", height: 1.5, marginTop: 5 }} />
            {this.state.articleList.map((item, i) => {
              var avatar = ((item.file_path === "" || item.file_path === null) ? require('./../images/icon-noimage.png') : { uri: restdomain + `/uploads/article/${item.file_path}` })
              return (
                <ListItem
                  key={i}
                  titleStyle={{ fontSize: 18, marginLeft: 20 }}
                  title={item.title}
                  titleNumberOfLines={2}
                  subtitleStyle={{ fontSize: 16, marginLeft: 20 }}
                  subtitle={moment(new Date(item.post_dt)).format('YYYY/MM/DD') + "　" + item.hashtag_str}
                  // roundAvatar
                  // avatar={{ uri: restdomain + `/uploads/article/${item.file_path}` }}
                  // avatar={require('./../images/icon-noimage.png')}
                  avatar={avatar}
                  avatarContainerStyle={{ padding: 5, marginLeft: 5 }}
                  avatarStyle={{ width: 60, height: 60 * 3 / 4 }}
                  badge={{
                    value: "☺︎ " + item.good_cnt,
                    textStyle: { fontSize: 12 }
                  }}
                  onPress={() => this.props.navigation.navigate('ArticleRefer', {
                    mode: "home",
                    selectKijiPk: item.t_kiji_pk
                  })}
                />
              )
            })}
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
    flex: 1,
    backgroundColor: 'ivory'
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
  },
  spinnerTextStyle: {
    color: '#FFF',
    fontSize: 18
  },
})
