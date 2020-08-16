import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  AsyncStorage,
  Image,
  TouchableOpacity
} from 'react-native'
import { Header, Icon, Avatar, Card } from 'react-native-elements'

const restdomain = require('./common/constans.js').restdomain

export default class TohyoShokai extends Component {
  constructor(props) {
    super()
    this.state = {
      resultList: [],
      saveFlg: false,
      group_id: '',
      db_name: '',
      bc_addr: ''
    }
    this.props = props
  }

  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    var loginInfo = await this.getLoginInfo()
    this.setState({ userid: loginInfo['userid'] })
    this.setState({ password: loginInfo['password'] })
    this.setState({ tShainPk: loginInfo['tShainPk'] })
    this.state.tShainPk = Number(loginInfo['tShainPk'])
    this.setState({ imageFileName: loginInfo['imageFileName'] })
    this.setState({ shimei: loginInfo['shimei'] })
    this.setState({ kengenCd: loginInfo['kengenCd'] })

    var groupInfo = await this.getGroupInfo()
    this.setState({ saveFlg: groupInfo['saveFlg'] })
    this.setState({ group_id: groupInfo['group_id'] })
    this.setState({ db_name: groupInfo['db_name'] })
    this.setState({ bc_addr: groupInfo['bc_addr'] })

    var tohyoShokaiInfo = await this.getTohyoShokaiInfo()
    this.setState({ senkyoNm: tohyoShokaiInfo['senkyoNm'] })
    this.setState({ tSenkyoPk: tohyoShokaiInfo['tSenkyoPk'] })
    this.state.tSenkyoPk = Number(tohyoShokaiInfo['tSenkyoPk'])

    // 初期表示情報取得
    this.findTohyoShokai()
  }

  getGroupInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('groupInfo'))
    } catch (error) {
      return
    }
  }

  getLoginInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('loginInfo'))
    } catch (error) {
      return
    }
  }
  onPressLogoutButton = () => {
    AsyncStorage.removeItem('groupInfo')
    this.props.navigation.navigate('LoginGroup')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }

  // 投票照会情報取得（前画面からのパラメータ）
  getTohyoShokaiInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('tohyoShokaiInfo'))
    } catch (error) {
      return
    }
  }
  // 投票照会情報検索（API呼び出し）
  findTohyoShokai = async () => {
    await fetch(restdomain + '/tohyo_shokai_kobetsu/find', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function(response) {
        return response.json()
      })
      .then(
        function(json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === 'undefined') {
            return
          }
          // 検索結果の取得
          var dataList = json.data
          this.setState({ resultList: dataList })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }
  // 投票照会詳細画面遷移
  onPressTarget = (
    e,
    tPresenterPk,
    rank,
    totalcoin,
    shimei,
    title,
    imageFileNm
  ) => {
    // パラメータ設定
    let tohyoShokaiShosaiInfo = {
      senkyoNm: this.state.senkyoNm,
      tSenkyoPk: this.state.tSenkyoPk,
      tPresenterPk: tPresenterPk,
      tRank: rank,
      tTotalcoin: totalcoin,
      tShimei: shimei,
      tTitle: title,
      tImageFileNm: imageFileNm
    }
    this.setTohyoShokaiShosaiInfo(JSON.stringify(tohyoShokaiShosaiInfo))
    // 画面遷移
    this.props.navigation.navigate('TohyoShokaiShosai')
  }
  // 投票照会詳細情報設定（次画面へのパラメータ）
  setTohyoShokaiShosaiInfo = async tohyoShokaiShosaiInfo => {
    try {
      await AsyncStorage.removeItem('tohyoShokaiShosaiInfo')
      await AsyncStorage.setItem('tohyoShokaiShosaiInfo', tohyoShokaiShosaiInfo)
    } catch (error) {
      alert(error)
      return
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          leftComponent={
            <Icon
              name={'home'}
              type={'font-awesome'}
              color="#fff"
              onPress={this.onPressMenuButton}
            />
          }
          centerComponent={
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <View>
                <Image source={require('./../images/HARVEST3.png')} />
              </View>
            </View>
          }
          rightComponent={
            <Icon
              name={'sign-out'}
              type={'font-awesome'}
              color="#fff"
              onPress={this.onPressLogoutButton}
            />
          }
          style={styles.header}
        />
        <Text style={{ fontSize: 18 }}>
          {'　'}
          {this.state.senkyoNm}
        </Text>
        <ScrollView>
          {this.state.resultList.map(n => {
            return (
              <Card>
                <TouchableOpacity
                  onPress={e =>
                    this.onPressTarget(
                      e,
                      `${n.t_presenter_pk}`,
                      `${Number(n.rank) + 1}`,
                      `${n.sumCoin}`,
                      `${n.shimei}`,
                      `${n.title}`,
                      `${n.image_file_nm}`
                    )
                  }
                >
                  <View style={styles.targe_item}>
                    <View style={styles.target_rank_view}>
                      {(() => {
                        if (n.rank === '0') {
                          return (
                            <Avatar
                              large
                              rounded
                              source={require('./../images/medal_g_n.png')}
                              activeOpacity={0.7}
                            />
                          )
                        } else if (n.rank === '1') {
                          return (
                            <Avatar
                              large
                              rounded
                              source={require('./../images/medal_s_n.png')}
                              activeOpacity={0.7}
                            />
                          )
                        } else if (n.rank === '2') {
                          return (
                            <Avatar
                              large
                              rounded
                              source={require('./../images/medal_c_n.png')}
                              activeOpacity={0.7}
                            />
                          )
                        } else {
                          return (
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 16
                              }}
                            >
                              {'\n'}
                              NO.
                              <Text style={{ fontSize: 24 }}>
                                {Number(n.rank) + 1}
                              </Text>
                            </Text>
                          )
                        }
                      })()}
                      <Text style={{ textAlign: 'center' }}>
                        {n.sumCoin}
                        コイン
                      </Text>
                    </View>
                    <View style={styles.target_avatar_view}>
                      <Avatar
                        large
                        rounded
                        source={{
                          uri: restdomain + `/uploads/${n.image_file_nm}`
                        }}
                        activeOpacity={0.7}
                      />
                    </View>
                    <View style={styles.target_name_view}>
                      <Text style={{ fontSize: 18 }}>{n.shimei}</Text>
                      <Text style={{ fontSize: 12 }}>{n.title}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            )
          })}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF'
  },
  header: {},
  targe_item: {
    flexDirection: 'row',
    marginTop: 0,
    marginLeft: 0,
    marginRight: 30
  },
  target_rank_view: {
    flex: 1,
    justifyContent: 'center'
  },
  target_avatar_view: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10
  },
  target_name_view: {
    flex: 1.5,
    flexDirection: 'column',
    marginLeft: 10,
    justifyContent: 'center'
  }
})
