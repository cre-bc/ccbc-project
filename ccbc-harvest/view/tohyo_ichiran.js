import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  AsyncStorage
} from 'react-native'
import { Header, Button, Icon, ListItem } from 'react-native-elements'
import moment from 'moment'
import 'moment/locale/ja'

const restdomain = require('./common/constans.js').restdomain

export default class TohyoIchiran extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saveFlg: false,
      group_id: '',
      db_name: '',
      bc_addr: '',
      resultList: []
    }
  }

  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    var loginInfo = await this.getLoginInfo()

    this.setState({ userid: loginInfo['userid'] })
    this.setState({ password: loginInfo['password'] })
    this.setState({ tShainPk: loginInfo['tShainPk'] })
    this.setState({ imageFileName: loginInfo['imageFileName'] })
    this.setState({ shimei: loginInfo['shimei'] })
    this.setState({ kengenCd: loginInfo['kengenCd'] })

    var groupInfo = await this.getGroupInfo()
    this.setState({ saveFlg: groupInfo['saveFlg'] })
    this.setState({ group_id: groupInfo['group_id'] })
    this.setState({ db_name: groupInfo['db_name'] })
    this.setState({ bc_addr: groupInfo['bc_addr'] })

    // 初期表示情報取得
    this.findTohyoIchiran()
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

  // 投票一覧情報検索（API呼び出し）
  findTohyoIchiran = async () => {
    await fetch(restdomain + '/tohyo_ichiran/find2', {
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
          // 検索結果の取得
          var dataList = json.data
          this.setState({ resultList: dataList })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }
  // 投票照会画面遷移
  onPressTohyoShokaiButton = (e, senkyoNm, tSenkyoPk) => {
    // パラメータ設定
    let tohyoShokaiInfo = {
      senkyoNm: senkyoNm,
      tSenkyoPk: tSenkyoPk
    }
    this.setTohyoShokaiInfo(JSON.stringify(tohyoShokaiInfo))
    // 画面遷移
    this.props.navigation.navigate('TohyoShokai')
  }
  setTohyoShokaiInfo = async tohyoShokaiInfo => {
    try {
      await AsyncStorage.removeItem('tohyoShokaiInfo')
      await AsyncStorage.setItem('tohyoShokaiInfo', tohyoShokaiInfo)
    } catch (error) {
      alert(error)
      return
    }
  }
  keyExtractor = (item, index) => index
  render() {
    return (
      <View style={styles.container}>
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
        <ScrollView>
          <FlatList
            keyExtractor={this.keyExtractor}
            data={this.state.resultList}
            extraData={this.state.resultList}
            renderItem={({ item }) => (
              <ListItem
                key={item.t_senkyo_pk}
                title={item.senkyo_nm}
                subtitle={
                  moment(new Date(item.tohyo_kaishi_dt))
                    .add(1, 'days')
                    .format('YYYY/MM/DD') +
                  ' ～ ' +
                  moment(new Date(item.tohyo_shuryo_dt))
                    .add(1, 'days')
                    .format('YYYY/MM/DD')
                }
                onPress={e =>
                  this.onPressTohyoShokaiButton(
                    e,
                    `${item.senkyo_nm}`,
                    `${item.t_senkyo_pk}`
                  )
                }
              />
            )}
          />
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
    width: 80
  },
  target_avatar_view: {
    justifyContent: 'center',
    marginLeft: 10
  },
  target_name_view: {
    flexDirection: 'column',
    marginLeft: 10,
    justifyContent: 'center'
  },
  target_title_view: {
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 20
  },
  target_coin_view: {
    marginLeft: 0
  },
  target_total_coin_view: {
    marginLeft: 10
  },
  rating_item: {
    flexDirection: 'row'
  },
  rating_title_view: {
    justifyContent: 'center',
    marginLeft: 0
  },
  rating_point_view: {
    justifyContent: 'center'
  },
  rating_value_view: {
    flexDirection: 'column',
    marginLeft: 10
  }
})
