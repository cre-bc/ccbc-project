import React from 'react'
import { StyleSheet, Text, View, Image, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native'
import { Icon, Avatar, Card } from 'react-native-elements'
import moment from 'moment'
import 'moment/locale/ja'
import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain
const goodImageOn = require("./../images/good-on.png")
const goodImageOff = require("./../images/good-off.png")

export default class ArticleRefer extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      mode: "",
      current_kiji_category_pk: null,
      selectCategory: {
        t_kiji_category_pk: null,
        category_nm: ""
      },
      articleList: [],
      searchDialogVisible: false,
      searchCondKijiPk: null,
      searchCondYear: "",
      searchCondKeyword: "",
      searchCondHashtag: "",
      readLastKijiPk: null,
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // パラメータを受け取り、どの画面から遷移したかを判断
    const mode = this.props.navigation.getParam("mode")
    this.state.mode = mode
    if (mode === "home") {
      // ホーム画面からの遷移
      const selectKijiPk = this.props.navigation.getParam("selectKijiPk")
      this.state.searchCondKijiPk = selectKijiPk
    } else {
      // 記事選択画面・記事投稿画面からの遷移
      const selectCategory = this.props.navigation.getParam("selectCategory")
      this.state.selectCategory = selectCategory
      this.state.current_kiji_category_pk = selectCategory.t_kiji_category_pk
    }

    // 記事リスト取得
    this.readArticle(true)
  }

  readArticle = async (isFirst) => {
    // 記事API.記事リスト取得処理の呼び出し
    await fetch(restdomain + '/article/findArticle', {
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
          if (this.state.mode === "home") {
            this.setState({
              selectCategory: {
                t_kiji_category_pk: json.data[0].t_kiji_category_pk,
                category_nm: json.data[0].category_nm
              }
            })
          }
          var data = json.data
          if (!isFirst) {
            data = this.state.articleList.concat(data)
          }
          var readLastKijiPk = -1
          if (json.data.length > 0) {
            readLastKijiPk = json.data[json.data.length - 1].t_kiji_pk
          }
          this.setState({
            articleList: data,
            readLastKijiPk: readLastKijiPk
          })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** 記事投稿画面へ遷移 */
  moveEntry = async (index) => {
    var selectArticle = null
    // 編集の場合は対象リストのindexを指定、新規の場合はindexはnull
    if (index != null) {
      var selItem = this.state.articleList[index]
      selectArticle = {
        t_kiji_pk: selItem.t_kiji_pk,
        t_kiji_category_pk: selItem.t_kiji_category_pk,
        t_shain_pk: selItem.t_shain_pk,
        title: selItem.title,
        contents: selItem.contents,
        post_dt: selItem.post_dt,
        post_tm: selItem.post_tm,
        file_path: selItem.file_path,
        hashtag: selItem.hashtag,
        hashtagStr: selItem.hashtagStr
      }
    }

    this.props.navigation.navigate('ArticleEntry', {
      selectCategory: this.state.selectCategory,
      selectArticle: selectArticle
    })
  }

  /**
   * 記事照会画面のイベント
   */

  /** 新規投稿ボタン押下 */
  onClickNewArticleBtn = async () => {
    // 記事投稿画面へ遷移
    this.moveEntry(null)
  }

  /** 記事編集ボタン押下 */
  onClickEditArticleBtn = async (index) => {
    // 記事投稿画面へ遷移（修正対象の記事情報を設定）
    this.moveEntry(index)
  }

  /** 記事検索ボタン押下 */
  onClickSearchArticleBtn = async () => {
    // 記事検索ダイアログを表示
    this.setState({ searchDialogVisible: true })
  }

  /** いいねボタン押下 */
  onClickGoodBtn = async (index) => {
    // stateの内容を書き換え
    var wkList = this.state.articleList
    var selectArticle = wkList[index]
    selectArticle.good_flg = selectArticle.good_flg == "0" ? "1" : "0"
    wkList[index] = selectArticle
    this.setState({ articleList: wkList })

    // 記事API.いいね処理の呼び出し（DB登録）
    await fetch(restdomain + '/article/good', {
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
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** お気に入りボタン押下 */
  onClickFavoriteBtn = async (index) => {
    // stateの内容を書き換え
    var wkList = this.state.articleList
    var selectArticle = wkList[index]
    selectArticle.favorite_flg = selectArticle.favorite_flg == "0" ? "1" : "0"
    wkList[index] = selectArticle
    this.setState({ articleList: wkList })

    // 記事API.お気に入り処理の呼び出し（DB登録）
    await fetch(restdomain + '/article/favorite', {
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
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** スクロール最下部到達（次の記事の読み込み） */
  reachScrollBottom = async (e) => {
    if (this.state.mode === "home") {
      return
    }

    // 最下部に到達していない場合は処理を抜ける
    const offsetY = e.nativeEvent.contentOffset.y // スクロール距離
    const contentSizeHeight = e.nativeEvent.contentSize.height // scrollView contentSizeの高さ
    const scrollViewHeight = e.nativeEvent.layoutMeasurement.height // scrollViewの高さ
    if (offsetY + scrollViewHeight < Math.floor(contentSizeHeight)) {
      // alert("offsetY:" + offsetY + " scrollViewHeight:" + scrollViewHeight + " contentSizeHeight:" + contentSizeHeight)
      return
    }

    // 記事リスト取得（次の記事の読み込み）
    this.readArticle(false)
  }

  /**
   * 検索ダイアログ画面のイベント
   */

  /** 検索条件設定ボタン押下 */
  onClickDlgSearchBtn = async () => {
    this.setState({
      searchDialogVisible: false
    })

    // 記事リスト取得（条件付与）
    this.readArticle(true)
  }

  /** 検索条件クリアボタン押下 */
  onClickDlgClearBtn = async () => {
    // 検索条件のクリア
    this.setState({
      searchDialogVisible: false,
      searchCondYear: "",
      searchCondKeyword: "",
      searchCondHashtag: "",
      readLastKijiPk: null
    })

    // 記事リスト取得
    await this.readArticle(true)
  }

  render() {
    return (
      <View>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- 画面タイトル -- */}
        <View style={[styles.screenTitleView, { flexDirection: 'row' }]}>
          {/* 検索アイコン */}
          <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 10 }}>
            {(() => {
              if (this.state.mode === "article") {
                return (
                  <Icon name="search" type="font-awesome" color="white"
                    onPress={() => this.onClickSearchArticleBtn()} />
                )
              }
            })()}
          </View>

          {/* 記事カテゴリ名 */}
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.screenTitleText}>
              {this.state.selectCategory.category_nm}
            </Text>
          </View>

          {/* 新規投稿アイコン */}
          <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
            {(() => {
              if (this.state.mode === "article") {
                return (
                  <Icon name="edit" type="font-awesome" color="white"
                    onPress={() => this.onClickNewArticleBtn()}
                  />
                )
              }
            })()}
          </View>
        </View>

        <ScrollView
          onMomentumScrollEnd={this.reachScrollBottom.bind(this)}>

          {/* -- 記事表示（繰り返し） -- */}
          {this.state.articleList.map((item, i) => {
            return (
              <Card key={i}>
                {/* 投稿情報 */}
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, alignItems: 'center', marginRight: 5 }}>
                    {/* 投稿日時 */}
                    <Text style={styles.dateTimeText}>
                      {moment(new Date(item.post_dt)).format('YYYY/MM/DD')}
                    </Text>
                    <Text style={styles.dateTimeText}>
                      {moment(new Date(moment(new Date(item.post_dt)).format('YYYY/MM/DD') + " " + item.post_tm)).format('H:mm')}
                    </Text>

                    {/* 社員画像 */}
                    <Avatar
                      rounded
                      source={{ uri: restdomain + `/uploads/${item.shain_image_path}` }}
                      activeOpacity={0.7}
                    />
                  </View>

                  <View style={{ flex: 4 }}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* 投稿者名 */}
                      <View style={{ flex: 4 }}>
                        <Text style={{ fontSize: 20, color: 'black' }}>
                          {"　"}{item.shain_nm}
                        </Text>
                      </View>

                      {/* 自身の投稿記事の場合、編集アイコンを表示する */}
                      <View style={{ flex: 1 }}>
                        {(() => {
                          if (item.t_shain_pk == this.state.login_shain_pk && this.state.mode === "article") {
                            return (
                              <Icon
                                name="pencil"
                                type="font-awesome"
                                onPress={() => this.onClickEditArticleBtn(i)}
                              />
                            )
                          }
                        })()}
                      </View>

                      {/* いいね */}
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {(() => {
                          const goodImageSrc = (item.good_flg === "0" ? goodImageOff : goodImageOn)
                          const goodStr = (item.good_flg === "0" ? "　　　" : "いいね")
                          return (
                            <TouchableOpacity
                              activeOpacity={1}
                              onPress={() => this.onClickGoodBtn(i)}>
                              <Image
                                source={goodImageSrc}
                                style={{ width: 25, height: 25 }}
                              />
                              <Text style={{ fontSize: 8, color: "red" }}>
                                {goodStr}
                              </Text>
                            </TouchableOpacity>
                          )
                        })()}
                      </View>

                      {/* お気に入り */}
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {(() => {
                          const favoriteColor = (item.favorite_flg === "0" ? "gray" : "orange")
                          return (
                            <Icon name="star" type="font-awesome" color={favoriteColor}
                              onPress={() => this.onClickFavoriteBtn(i)}
                            />
                          )
                        })()}
                      </View>
                    </View>

                    {/* タイトル */}
                    <Text style={{ fontSize: 16, color: 'blue' }}>
                      【{item.title}】
                    </Text>

                    {/* ハッシュタグ */}
                    <Text style={{ fontSize: 12, color: 'blue' }}>
                      {item.hashtagStr}
                    </Text>
                  </View>
                </View>

                {/* 記事内容 */}
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                  <Text>
                    {item.contents}
                  </Text>
                </View>

                {/* 画像 */}
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                  {item.file_path !== "" &&
                    <Image
                      source={{ uri: restdomain + `/uploads/article/${item.file_path}` }}
                      style={{ width: 300, height: 300 }} />
                  }
                </View>
              </Card>
            )
          })}
          {/* スクロールが最下部まで表示されないことの暫定対応... */}
          <View style={{ marginBottom: 100 }} />
        </ScrollView>

        {/* -- 検索ダイアログ -- */}
        <Modal
          visible={this.state.searchDialogVisible}
          animationType={'slide'}
          onRequestClose={() => { this.setState({ searchDialogVisible: false }) }}
        >
          <View style={{ flex: 1 }}>
            {/* ヘッダ部 */}
            <View style={{ flex: 1 }} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'flex-start' }} />

              {/* 検索アイコン */}
              <Icon name="search" type="font-awesome" color="black"
                onPress={() => this.onClickDlgSearchBtn()} />

              {/* 検索クリアアイコン */}
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <Icon name="search-minus" type="font-awesome" color="black"
                  onPress={() => this.onClickDlgClearBtn()} />
              </View>

              {/* 閉じるアイコン */}
              <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
                <Icon name="times-circle" type="font-awesome" color="black"
                  onPress={() => { this.setState({ searchDialogVisible: false }) }}
                />
              </View>
            </View>

            {/* 検索条件部 */}
            <View style={{ flex: 1 }}>
              <Card>
                {/* 投稿年 */}
                <View>
                  <Text style={styles.inputTitle}>投稿年</Text>
                  <TextInput
                    style={styles.inputText}
                    value={this.state.searchCondYear}
                    keyboardType='numeric'
                    maxLength={4}
                    onChangeText={text => { this.setState({ searchCondYear: text }) }}
                  />
                </View>

                {/* 検索キーワード */}
                <View>
                  <Text style={styles.inputTitle}>検索キーワード</Text>
                  <TextInput
                    style={styles.inputText}
                    value={this.state.searchCondKeyword}
                    onChangeText={text => { this.setState({ searchCondKeyword: text }) }}
                  />
                </View>

                {/* タグ */}
                <View>
                  <Text style={styles.inputTitle}>タグ</Text>
                  <TextInput
                    style={styles.inputText}
                    value={this.state.searchCondHashtag}
                    onChangeText={text => { this.setState({ searchCondHashtag: text }) }}
                  />
                  <Text style={styles.inputTitle}>※スペース区切りで複数条件可</Text>
                </View>
              </Card>
            </View>
            <View style={{ flex: 1 }} />
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  screenTitleView: {
    alignItems: 'center',
    backgroundColor: '#ff5622'
  },
  screenTitleText: {
    fontSize: 18,
    color: 'white',
    padding: 10
  },
  dateTimeText: {
    fontSize: 10,
    color: 'gray'
  },
  inputTitle: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray'
  },
  inputText: {
    fontSize: 16,
    color: 'black',
    padding: 5,
    borderColor: 'gray',
    borderWidth: 1
  }
})
