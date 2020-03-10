import React from 'react'
import { Dimensions, StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Card } from 'react-native-elements'
import Spinner from 'react-native-loading-spinner-overlay'
import moment from 'moment'
import 'moment/locale/ja'
import BaseComponent from './components/BaseComponent'

const restdomain = require('./common/constans.js').restdomain
const windowWidth = Dimensions.get('window').width
const articleImageWidth = windowWidth * 1.4 / 3.5

export default class Home extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      isProcessing: false,
      activeSlide: 0,
      adList: [],
      infoList: [],
      newArticleList: [],
      popularArticleList: []
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.props.navigation.addListener(
      'willFocus', () => this.onWillFocus())
  }

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    this.setState({ isProcessing: true })

    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // ホームAPI.ComComCoinホーム情報取得処理の呼び出し
    await fetch(restdomain + '/comcomcoin_home/findHome', {
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
            this.setState({
              // activeSlide: 0,
              adList: json.data.adList,
              infoList: json.data.infoList,
              newArticleList: json.data.newArticleList,
              popularArticleList: json.data.popularArticleList
            })
          }
        }.bind(this)
      )
      .catch(error => console.error(error))

    this.setState({ isProcessing: false })
  }

  renderItem = ({ item, index }) => (
    <View style={styles.tile}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => this.props.navigation.navigate('HomeAdvertise', {
          renban: item.renban
        })}
      >
        <Image style={{ height: windowWidth * 9 / 16, width: windowWidth }}
          // resizeMode="contain"
          resizeMode="cover"
          source={{ uri: restdomain + `/uploads/advertise/${item.file_path}` }}
        />
      </TouchableOpacity>
    </View>
  )

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "ivory" }}>
        {/* -- 処理中アニメーション -- */}
        <Spinner
          visible={this.state.isProcessing}
          textContent={'Processing…'}
          textStyle={styles.spinnerTextStyle}
        />

        <View style={[{ flex: 0.32 }]}>
          <Text />
        </View>

        {/* -- コンテンツ -- */}
        <View style={{ flex: 8, flexDirection: 'row' }}>
          <ScrollView maximumZoomScale={2}>

            {/* -- 広告 -- */}
            <View style={{ flexDirection: 'row' }}>
              {this.state.adList.length > 0 && (
                <View style={styles.container}>
                  <Carousel
                    data={this.state.adList}
                    firstItem={0}
                    layout={'default'}
                    renderItem={this.renderItem}
                    onSnapToItem={index => {
                      this.setState({ activeSlide: index })
                    }}
                    itemWidth={windowWidth}
                    sliderWidth={windowWidth}
                    containerCustomStyle={styles.carousel}
                    slideStyle={{ flex: 1 }}
                    loop={true}
                    autoplay={true}
                  />
                  <View>
                    <Pagination
                      dotsLength={this.state.adList.length}
                      activeDotIndex={this.state.activeSlide}
                      containerStyle={{ paddingVertical: 5 }}
                      dotStyle={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        marginHorizontal: 8,
                        backgroundColor: 'rgba(200, 200, 200, 0.92)'
                      }}
                      inactiveDotStyle={
                        {}
                      }
                      inactiveDotOpacity={0.4}
                      inactiveDotScale={0.6}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* -- お知らせ -- */}
            <View style={styles.section}>
              <Image resizeMode="contain" source={require('./../images/icons8-post-box-24.png')} />
              <Text style={styles.sectionText}>
                {' '}お知らせ
              </Text>
              <Text style={styles.sectionMoreText}
                onPress={() => this.props.navigation.navigate('HomeInfoList')} >
                もっと見る>
              </Text>
            </View>
            <View>
              {/* お知らせの件数分、繰り返し（最大3件） */}
              {this.state.infoList.map((item, i) => {
                return (
                  <Text ellipsizeMode={"tail"} numberOfLines={1} style={{ fontSize: 18, marginTop: 0, marginBottom: 3 }} key={i}>
                    {moment(new Date(item.notice_dt)).format('YYYY/MM/DD')}{'  '}{item.title}
                  </Text>
                )
              })}
              {this.state.infoList.length === 0 && (
                <Text />
              )}
            </View>

            {/* -- 最新の記事 -- */}
            <View style={styles.section}>
              <Image resizeMode="contain" source={require('./../images/icons8-news-24.png')} />
              <Text style={styles.sectionText}>
                {' '}最新の記事
              </Text>
              <Text style={styles.sectionMoreText}
                onPress={() => this.props.navigation.navigate('HomeArticleList', {
                  mode: "new"
                })}>
                もっと見る>
              </Text>
            </View>

            <View>
              {/* 最新の記事の件数分、繰り返し */}
              {this.state.newArticleList.map((item, i) => {
                return (
                  <TouchableOpacity key={i}
                    activeOpacity={1}
                    onPress={() => this.props.navigation.navigate('ArticleRefer', {
                      mode: "home",
                      selectKijiPk: item.t_kiji_pk
                    })}>
                    <Card containerStyle={styles.articleCard}>
                      <View style={{ flexDirection: 'row' }}>
                        {/* 画像 */}
                        <View style={{ flex: 1.5 }}>
                          {(item.file_path !== "" && item.file_path !== null) &&
                            <Image
                              source={{ uri: restdomain + `/uploads/article/${item.file_path}` }}
                              style={styles.articleImage}
                              // resizeMode='contain'
                              resizeMode="cover"
                            />
                          }
                          {/* 画像が未登録の場合はNo-Imageを表示 */}
                          {(item.file_path === "" || item.file_path === null) &&
                            <Image
                              source={require('./../images/icon-noimage.png')}
                              style={styles.articleImage}
                              resizeMode="cover"
                            />
                          }
                        </View>
                        <View style={{ flex: 2 }}>
                          {/* タイトル */}
                          <Text style={{ fontSize: 18 }}>
                            {item.title}
                          </Text>
                          {/* ハッシュタグ */}
                          <Text style={{ fontSize: 16, color: 'gray' }}>
                            {item.hashtag_str}
                          </Text>
                          {/* いいね */}
                          <Text style={{ fontSize: 16, color: 'red' }}>
                            {'♡ '}{item.good_cnt}{'　'}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* -- 人気の記事 -- */}
            <View style={styles.section}>
              <Image resizeMode="contain" source={require('./../images/icons8-thumbs-up-24.png')} />
              <Text style={styles.sectionText}>
                {' '}人気の記事
              </Text>
              <Text style={styles.sectionMoreText}
                onPress={() => this.props.navigation.navigate('HomeArticleList', {
                  mode: "popular"
                })}>
                もっと見る>
              </Text>
            </View>

            <View>
              {/* 人気の記事の件数分、繰り返し */}
              {this.state.popularArticleList.map((item, i) => {
                return (
                  <TouchableOpacity key={i}
                    activeOpacity={1}
                    onPress={() => this.props.navigation.navigate('ArticleRefer', {
                      mode: "home",
                      selectKijiPk: item.t_kiji_pk
                    })}>
                    <Card containerStyle={styles.articleCard}>
                      <View style={{ flexDirection: 'row' }}>
                        {/* 画像 */}
                        <View style={{ flex: 1.5 }}>
                          {(item.file_path !== "" && item.file_path !== null) &&
                            <Image
                              source={{ uri: restdomain + `/uploads/article/${item.file_path}` }}
                              style={styles.articleImage}
                              // resizeMode='contain'
                              resizeMode="cover"
                            />
                          }
                          {/* 画像が未登録の場合はNo-Imageを表示 */}
                          {(item.file_path === "" || item.file_path === null) &&
                            <Image
                              source={require('./../images/icon-noimage.png')}
                              style={styles.articleImage}
                              resizeMode="cover"
                            />
                          }
                        </View>
                        <View style={{ flex: 2 }}>
                          {/* タイトル */}
                          <Text style={{ fontSize: 18 }}>
                            {item.title}
                          </Text>
                          {/* ハッシュタグ */}
                          <Text style={{ fontSize: 16, color: 'gray' }}>
                            {item.hashtag_str}
                          </Text>
                          {/* いいね */}
                          <Text style={{ fontSize: 16, color: 'red' }}>
                            {'♡ '}{item.good_cnt}{'　'}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>

        {/* -- 各機能アイコン -- */}
        <View style={[{ flex: 1, flexDirection: 'row' }]}>
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.props.navigation.navigate('ChatSelect')}>
              <Image
                resizeMode="contain"
                source={require('./../images/icons8-chat-bubble-48.png')}
              />
              <Text style={{ textAlign: "center" }}>チャット</Text>
            </TouchableOpacity>
          </View>
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.props.navigation.navigate('Shopping', {
                mode: "favorite"
              })}>
              <Image
                resizeMode="contain"
                source={require('./../images/icons8-qr-code-48.png')}
              />
              <Text style={{ textAlign: "center" }}>買い物</Text>
            </TouchableOpacity>
          </View>
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.props.navigation.navigate('ArticleSelect')}>
              <Image
                resizeMode="contain"
                source={require('./../images/icons8-brainstorm-skill-48.png')}
              />
              <Text style={{ textAlign: "center" }}>情報ひろば</Text>
            </TouchableOpacity>
          </View>
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.props.navigation.navigate('HomeArticleList', {
                mode: "favorite"
              })}>
              <Image
                resizeMode="contain"
                source={require('./../images/icons8-star-48.png')}
              />
              <Text style={{ textAlign: "center" }}>お気に入り</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View >
    )
  }
}

const styles = StyleSheet.create({
  carousel: {
    flex: 1
  },
  tile: {
    flex: 1,
    // width: Dimensions.get('window').width * 0.85
  },
  articleCard: {
    marginTop: -1,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingBottom: 5,
    padding: 5,
    backgroundColor: "ivory"
  },
  articleImage: {
    width: articleImageWidth,
    height: articleImageWidth * 3 / 4,
    // minWidth: 55,
    // minHeight: 55
    borderColor: 'gray',
    borderWidth: 1,
  },
  spinnerTextStyle: {
    color: '#FFF',
    fontSize: 18
  },
  section: {
    height: 25,
    backgroundColor: 'rgba(255, 136, 0, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0
  },
  sectionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  sectionMoreText: {
    color: 'white',
    fontSize: 16,
    position: 'absolute',
    right: 0
  }
})
