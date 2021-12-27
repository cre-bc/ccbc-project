import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  AsyncStorage,
  ScrollView
} from 'react-native'
import {
  Header,
  Button,
  Icon,
  Avatar,
  Rating,
  FormLabel,
  FormInput,
  Card
} from 'react-native-elements'
import { Provider, connect } from 'react-redux' // 5.0.6
import { createStore, bindActionCreators } from 'redux' // 3.7.2
import * as myActions from '../actions/sampleReducer'
import StarRating from 'react-native-star-rating'
import BaseComponent from "./components/BaseComponent"

const restdomain = require('./common/constans.js').restdomain

class CommentShokai extends BaseComponent {
  state = {
    completed: {},
    comment: {},
    haifuCoin: 150,
    tohyoCoin: 0,
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    checkedA: true,
    checkedB: true,
    checkedF: true,
    value: 'female',
    age: '',
    name: 'hai',
    name2: 'Cat in the Hat',
    age2: '',
    multiline: 'Controlled',
    currency: 'EUR',
    name3: 'Composed TextField',
    tTohyoPk: null,
    tZoyoPk: null,
    title: '',
    tohyosha: '',
    coin: 0,
    saveFlg: false,
    group_id: '',
    db_name: '',
    bc_addr: ''
  }

  constructor(props) {
    super(props)
  }

  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // 遷移元画面からの引き渡しパラメータ
    const { coinShokai } = this.props
    if (coinShokai.tTohyoPk != null) {
      this.state.tTohyoPk = Number(coinShokai.tTohyoPk)
    }
    if (coinShokai.tZoyoPk != null) {
      this.state.tZoyoPk = Number(coinShokai.tZoyoPk)
    }
    this.state.title = coinShokai.title
    this.state.tohyosha = coinShokai.tohyosha
    this.state.coin = coinShokai.coin
    this.setState({ coin: coinShokai.coin })

    await fetch(restdomain + '/comment_shokai/find', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function (response) {
        return response.json()
      })
      .then(
        async function (json) {
          // API戻り値の確認
          if (!await this.checkApiResult(json)) {
            return
          }
          // 結果が取得できない場合は終了
          if (typeof json.data === 'undefined') {
            return
          }
          var resList = json.data
          this.setState({ resultList: resList })
        }.bind(this)
      )
      .catch((error) => this.errorApi(error))
  }

  onPressLogoutButton = () => {
    AsyncStorage.removeItem('groupInfo')
    this.props.navigation.navigate('LoginGroup')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }

  render() {
    const { coinShokai } = this.props

    var resList = this.state.resultList.map((data, i) => {
      if (coinShokai.tTohyoPk != null) {
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
              <Card>
                <Text style={{ fontSize: 16 }}>
                  投票・コイン贈与：
                  {this.state.title}
                  {'\n'}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  投票（授与）者　：
                  {this.state.tohyosha}
                  {'\n'}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  受領コイン　　　：
                  {this.state.coin} コイン
                  {'\n'}
                </Text>
                <View style={styles.rating_item}>
                  <View style={styles.rating_title_view}>
                    <Text style={{ fontSize: 12 }}>資料作成：</Text>
                  </View>
                  <View style={styles.rating_point_view}>
                    <Text style={{ fontSize: 14 }}>{data.hyoka1}点</Text>
                  </View>
                  <View style={styles.airbngrating_value_view}>
                    <StarRating
                      disabled={true}
                      maxStars={10}
                      rating={data.hyoka1}
                      starSize={20}
                      emptyStarColor={'orange'}
                      fullStarColor={'orange'}
                    />
                  </View>
                </View>
                <View style={styles.rating_item}>
                  <View style={styles.rating_title_view}>
                    <Text style={{ fontSize: 12 }}>発表力　：</Text>
                  </View>
                  <View style={styles.rating_point_view}>
                    <Text style={{ fontSize: 14 }}>{data.hyoka2}点</Text>
                  </View>
                  <View style={styles.airbngrating_value_view}>
                    <StarRating
                      disabled={true}
                      maxStars={10}
                      rating={data.hyoka2}
                      starSize={20}
                      emptyStarColor={'orange'}
                      fullStarColor={'orange'}
                    />
                  </View>
                </View>
                <View style={styles.rating_item}>
                  <View style={styles.rating_title_view}>
                    <Text style={{ fontSize: 12 }}>表現力　：</Text>
                  </View>
                  <View style={styles.rating_point_view}>
                    <Text style={{ fontSize: 14 }}>{data.hyoka3}点</Text>
                  </View>
                  <View style={styles.airbngrating_value_view}>
                    <StarRating
                      disabled={true}
                      maxStars={10}
                      rating={data.hyoka3}
                      starSize={20}
                      emptyStarColor={'orange'}
                      fullStarColor={'orange'}
                    />
                  </View>
                </View>
                <View style={styles.rating_item}>
                  <View style={styles.rating_title_view}>
                    <Text style={{ fontSize: 12 }}>影響力　：</Text>
                  </View>
                  <View style={styles.rating_point_view}>
                    <Text style={{ fontSize: 14 }}>{data.hyoka4}点</Text>
                  </View>
                  <View style={styles.airbngrating_value_view}>
                    <StarRating
                      disabled={true}
                      maxStars={10}
                      rating={data.hyoka4}
                      starSize={20}
                      emptyStarColor={'orange'}
                      fullStarColor={'orange'}
                    />
                  </View>
                </View>
                <View style={styles.rating_item}>
                  <View style={styles.rating_title_view}>
                    <Text style={{ fontSize: 12 }}>限界突破：</Text>
                  </View>
                  <View style={styles.rating_point_view}>
                    <Text style={{ fontSize: 14 }}>{data.hyoka5}点</Text>
                  </View>
                  <View style={styles.airbngrating_value_view}>
                    <StarRating
                      disabled={true}
                      maxStars={10}
                      rating={data.hyoka5}
                      starSize={20}
                      emptyStarColor={'orange'}
                      fullStarColor={'orange'}
                    />
                  </View>
                </View>
                <View
                  style={{ marginTop: 10, marginBottom: 0, marginRight: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>【コメント】</Text>
                  <Text multiline style={{ fontSize: 16 }}>
                    {data.hyoka_comment}
                  </Text>
                </View>
              </Card>
              <View style={{ height: 200 }} />
            </ScrollView>
          </View>
        )
      } else {
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
                    <Image
                      source={require('./../images/cvircy.png')}
                      style={{
                        width: 25,
                        height: 25
                      }}
                    />
                  </View>
                  <View
                    style={{
                      marginLeft: 10
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    >
                      Harvest
                    </Text>
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
              <Card>
                <Text style={{ fontSize: 16 }}>
                  投票・コイン贈与：
                  {this.state.title}
                  {'\n'}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  投票（授与）者　：
                  {this.state.tohyosha}
                  {'\n'}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  受領コイン　　　：
                  {this.state.coin} コイン
                  {'\n'}
                </Text>
                <View
                  style={{ marginTop: 10, marginBottom: 0, marginRight: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>【コメント】</Text>
                  <Text multiline style={{ fontSize: 16 }}>
                    {data.zoyo_comment}
                  </Text>
                </View>
              </Card>
            </ScrollView>
          </View>
        )
      }
    })
    return <View style={styles.container}>{resList}</View>
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF'
  },
  header: {},
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
  },
  airbngrating_value_view: {
    flexDirection: 'column',
    marginLeft: 10
  }
})

const mapState = state => ({
  coinShokai: state.coinShokai
})

export default connect(
  mapState,
  null
)(CommentShokai)
