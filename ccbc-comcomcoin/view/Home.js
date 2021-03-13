import React from "react";
import { Notifications } from "expo";
import {
  Platform,
  Dimensions,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
  RefreshControl,
} from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { Card } from "react-native-elements";
import IconBadge from "react-native-icon-badge";
import Spinner from "react-native-loading-spinner-overlay";
import moment from "moment";
import "moment/locale/ja";
import io from "socket.io-client";

import BaseComponent from "./components/BaseComponent";
import ConfirmDialog from "./components/ConfirmDialog";

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

const windowWidth = Dimensions.get("window").width;
const articleImageWidth = (windowWidth * 0.9) / 3.0;

export default class Home extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      refreshing: false,
      activeSlide: 0,
      adList: [],
      infoList: [],
      newArticleList: [],
      popularArticleList: [],
      confirmDialogVisible: false,
      confirmDialogMessage: "",
      chatCnt: 0,
      articleCnt: 0,
      bccoin: 0,
      screenNo: 4,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // チャットメッセージの受信（websocket）
    socket.off("comcomcoin_chat");
    socket.on(
      "comcomcoin_chat",
      async function (message) {
        // チャットを受信した際に、ホーム画面を再表示する
        await this.findHomeData();
      }.bind(this)
    );

    // 初期表示情報取得処理（gobackで戻る場合に呼ばれるようイベントを関連付け）
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());

    // 画面遷移時処理（後処理）
    this.props.navigation.addListener("willBlur", () => this.onwillBlur());
  };

  /** アクセス情報登録 */
  setAccessLog = async () => {
    await fetch(restdomain + "/access_log/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .catch((error) => console.error(error));
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    this.setState({ isProcessing: true });

    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    // アプリの未読件数をクリア
    Notifications.getBadgeNumberAsync().then((badgeNumber) => {
      if (badgeNumber !== 0) {
        Notifications.setBadgeNumberAsync(0);
      }
    });

    // websocket切断
    if (socket.connected) {
      socket.close();
      socket.disconnect();
    }

    // websocket接続
    socket.connect();

    // チャットルーム（自分の社員PK）に接続
    socket.emit("join", this.state.loginShainPk);
    // チャットルーム（グループPK）に接続)
    socket.emit("join", this.state.chatGroupPk);

    //アクセス情報登録
    this.setAccessLog();

    // 初期表示情報取得
    this.findHomeData();

    this.setState({ isProcessing: false });
  };

  /** 画面遷移時処理（後処理） */
  onwillBlur = async () => {
    if (!socket.disconnected) {
      // websocket切断
      socket.close();
      socket.disconnect();
    }
  };

  /** 初期表示情報取得処理 */
  findHomeData = async () => {
    // ホームAPI.ComComCoinホーム情報取得処理の呼び出し
    await fetch(restdomain + "/comcomcoin_home/findHome", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          if (typeof json.data === "undefined") {
            // 結果が取得できない場合は終了
          } else {
            var coin = json.data.bccoin;
            // 所持コインが上限値（99999）を超える場合
            if (coin > 99999) {
              // コイン数100000以上は99999固定の表記にする
              coin = 99999;
            }
            // コイン数を3桁カンマ区切り
            var s = String(coin).split(".");
            var retCoin = String(s[0]).replace(
              /(\d)(?=(\d\d\d)+(?!\d))/g,
              "$1,"
            );
            if (s.length > 1) {
              retCoin += "." + s[1];
            }
            // 取得したデータをStateに格納
            this.setState({
              // activeSlide: 0,
              adList: json.data.adList,
              infoList: json.data.infoList,
              newArticleList: json.data.newArticleList,
              popularArticleList: json.data.popularArticleList,
              chatCnt: json.data.chatCnt,
              articleCnt: json.data.articleCnt,
              bccoin: retCoin,
            });
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** アクセス情報登録 */
  setAccessLog = async () => {
    await fetch(restdomain + "/access_log/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .catch((error) => console.error(error));
  };

  /** ログアウト処理 */
  logout = () => {
    this.setState({ confirmDialogVisible: false });
    AsyncStorage.removeItem("loginInfo");
    AsyncStorage.removeItem("groupInfo");
    this.props.navigation.navigate("LoginGroup");
  };

  /** 広告画像のrenderItem */
  renderItem = ({ item, index }) => (
    <View style={styles.tile}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          this.props.navigation.navigate("HomeAdvertise", {
            renban: item.renban,
          })
        }
      >
        <Image
          style={{ height: (windowWidth * 9) / 16, width: windowWidth }}
          // resizeMode="contain"
          // resizeMode="cover"
          source={{ uri: restdomain + `/uploads/advertise/${item.file_path}` }}
        />
      </TouchableOpacity>
    </View>
  );

  /** スクロールのリフレッシュ（ページを引っ張った操作） */
  onRefresh = async () => {
    this.setState({ refreshing: true });

    // ホーム画面情報取得（再表示）
    await this.findHomeData();

    this.setState({ refreshing: false });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "ivory" }}>
        {/* -- 処理中アニメーション -- */}
        <Spinner
          visible={this.state.isProcessing}
          textContent={"Processing…"}
          textStyle={styles.spinnerTextStyle}
        />

        {/* -- コンテンツ -- */}
        <View style={{ flex: 8, flexDirection: "row" }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            maximumZoomScale={2}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
          >
            {/* -- 広告 -- */}
            <View style={{ flexDirection: "row" }}>
              {this.state.adList.length > 0 && (
                <View style={styles.container}>
                  <Carousel
                    data={this.state.adList}
                    firstItem={0}
                    layout={"default"}
                    renderItem={this.renderItem.bind(this)}
                    onSnapToItem={(index) => {
                      this.setState({ activeSlide: index });
                    }}
                    itemWidth={windowWidth}
                    sliderWidth={windowWidth}
                    containerCustomStyle={styles.carousel}
                    slideStyle={{ flex: 1 }}
                    loop={true}
                    autoplay={true}
                    lockScrollWhileSnapping={true}
                  />
                  <Pagination
                    dotsLength={this.state.adList.length}
                    activeDotIndex={this.state.activeSlide}
                    containerStyle={{ paddingVertical: 5 }}
                    dotStyle={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      marginHorizontal: 8,
                      backgroundColor: "rgba(200, 200, 200, 0.92)",
                    }}
                    inactiveDotStyle={{}}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                  />
                  {/* <Text>{this.state.activeSlide}</Text> */}
                </View>
              )}
            </View>

            {/* -- お知らせ -- */}
            <View style={styles.section}>
              <Image
                resizeMode="contain"
                source={require("./../images/icons8-post-box-24.png")}
              />
              <Text style={styles.sectionText}> お知らせ</Text>
              <Text
                style={styles.sectionMoreText}
                onPress={() => this.props.navigation.navigate("HomeInfoList")}
              >
                {"もっと見る>"}
              </Text>
            </View>
            <View>
              {/* お知らせの件数分、繰り返し（最大3件） */}
              {this.state.infoList.map((item, i) => {
                let font = "";
                if (Platform.OS === "ios") {
                  font = "Courier";
                }
                return (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      marginTop: 0,
                      marginBottom: 3,
                    }}
                    key={i}
                  >
                    <Text ellipsizeMode={"tail"} numberOfLines={1}>
                      <Text style={{ fontSize: 18, fontFamily: font }}>
                        {moment(new Date(item.notice_dt)).format("YYYY/MM/DD")}
                      </Text>
                      <Text style={{ fontSize: 18 }}>
                        {"  "}
                        {item.title}
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* -- 最新の記事 -- */}
            <View style={styles.section}>
              <Image
                resizeMode="contain"
                source={require("./../images/icons8-news-24.png")}
              />
              <Text style={styles.sectionText}> 最新の記事</Text>
              <Text
                style={styles.sectionMoreText}
                onPress={() =>
                  this.props.navigation.navigate("HomeArticleList", {
                    mode: "new",
                  })
                }
              >
                {"もっと見る>"}
              </Text>
            </View>

            <View>
              {/* 最新の記事の件数分、繰り返し */}
              {this.state.newArticleList.map((item, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={1}
                    onPress={() =>
                      this.props.navigation.navigate("ArticleRefer", {
                        mode: "home",
                        selectKijiPk: item.t_kiji_pk,
                      })
                    }
                  >
                    <Card containerStyle={styles.articleCard}>
                      <View style={{ flexDirection: "row" }}>
                        {/* 画像 */}
                        <View style={{ flex: 1 }}>
                          {item.file_path !== "" && item.file_path !== null && (
                            <Image
                              source={{
                                uri:
                                  restdomain +
                                  `/uploads/article/${item.file_path}`,
                              }}
                              style={styles.articleImage}
                              // resizeMode='contain'
                              resizeMode="cover"
                            />
                          )}
                          {/* 画像が未登録の場合はNo-Imageを表示 */}
                          {(item.file_path === "" ||
                            item.file_path === null) && (
                            <Image
                              source={require("./../images/icon-noimage.png")}
                              style={styles.articleImage}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                        <View style={{ flex: 2 }}>
                          {/* タイトル */}
                          <Text style={{ fontSize: 18 }}>{item.title}</Text>
                          {/* ハッシュタグ */}
                          <Text style={{ fontSize: 16, color: "gray" }}>
                            {item.hashtag_str}
                          </Text>
                          {/* いいね */}
                          <View style={{ flexDirection: "row" }}>
                            <Image
                              source={require("./../images/good-top.png")}
                              style={{
                                width: 15,
                                height: 15,
                                marginTop: 2,
                                marginBottom: 2,
                              }}
                            />
                            <Text style={{ fontSize: 16, color: "red" }}>
                              {" "}
                              {item.good_cnt}
                            </Text>
                          </View>
                          {/* 投稿日 */}
                          <Text style={{ fontSize: 14, color: "gray" }}>
                            {moment(new Date(item.post_dt)).format(
                              "YYYY/MM/DD"
                            )}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* -- 人気の記事 -- */}
            <View style={styles.section}>
              <Image
                resizeMode="contain"
                source={require("./../images/icons8-thumbs-up-24.png")}
              />
              <Text style={styles.sectionText}> 人気の記事</Text>
              <Text
                style={styles.sectionMoreText}
                onPress={() =>
                  this.props.navigation.navigate("HomeArticleList", {
                    mode: "popular",
                  })
                }
              >
                {"もっと見る>"}
              </Text>
            </View>

            <View>
              {/* 人気の記事の件数分、繰り返し */}
              {this.state.popularArticleList.map((item, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={1}
                    onPress={() =>
                      this.props.navigation.navigate("ArticleRefer", {
                        mode: "home",
                        selectKijiPk: item.t_kiji_pk,
                      })
                    }
                  >
                    <Card containerStyle={styles.articleCard}>
                      <View style={{ flexDirection: "row" }}>
                        {/* 画像 */}
                        <View style={{ flex: 1 }}>
                          {item.file_path !== "" && item.file_path !== null && (
                            <Image
                              source={{
                                uri:
                                  restdomain +
                                  `/uploads/article/${item.file_path}`,
                              }}
                              style={styles.articleImage}
                              // resizeMode='contain'
                              resizeMode="cover"
                            />
                          )}
                          {/* 画像が未登録の場合はNo-Imageを表示 */}
                          {(item.file_path === "" ||
                            item.file_path === null) && (
                            <Image
                              source={require("./../images/icon-noimage.png")}
                              style={styles.articleImage}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                        <View style={{ flex: 2 }}>
                          {/* タイトル */}
                          <Text style={{ fontSize: 18 }}>{item.title}</Text>
                          {/* ハッシュタグ */}
                          <Text style={{ fontSize: 16, color: "gray" }}>
                            {item.hashtag_str}
                          </Text>
                          {/* いいね */}
                          <View style={{ flexDirection: "row" }}>
                            <Image
                              source={require("./../images/good-top.png")}
                              style={{
                                width: 15,
                                height: 15,
                                marginTop: 2,
                                marginBottom: 2,
                              }}
                            />
                            <Text style={{ fontSize: 16, color: "red" }}>
                              {" "}
                              {item.good_cnt}
                            </Text>
                          </View>
                          {/* 投稿日 */}
                          <Text style={{ fontSize: 14, color: "gray" }}>
                            {moment(new Date(item.post_dt)).format(
                              "YYYY/MM/DD"
                            )}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* -- 各機能アイコン -- */}
        <View style={[{ flex: 1, flexDirection: "row" }]}>
          <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
            {/* チャット */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: windowWidth / 4,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => this.props.navigation.navigate("ChatSelect")}
              >
                <IconBadge
                  MainElement={
                    <Image
                      resizeMode="contain"
                      source={require("./../images/icons8-chat-bubble-48.png")}
                    />
                  }
                  IconBadgeStyle={styles.iconBadgeStyle}
                  Hidden={this.state.chatCnt == 0}
                />
                <Text style={{ textAlign: "center" }}> チャット </Text>
              </TouchableOpacity>
            </View>
            {/* 買い物 */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: windowWidth / 4,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  this.props.navigation.navigate("Shopping", {
                    mode: "favorite",
                  })
                }
              >
                <Image
                  resizeMode="contain"
                  source={require("./../images/icons8-qr-code-48.png")}
                />
                <Text style={{ textAlign: "center" }}> 買い物 </Text>
              </TouchableOpacity>
            </View>
            {/* 情報ひろば */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: windowWidth / 4,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => this.props.navigation.navigate("ArticleSelect")}
              >
                <IconBadge
                  MainElement={
                    <Image
                      resizeMode="contain"
                      source={require("./../images/icons8-brainstorm-skill-48.png")}
                    />
                  }
                  IconBadgeStyle={styles.iconBadgeStyle}
                  Hidden={this.state.articleCnt == 0}
                />
                <Text style={{ textAlign: "center" }}>情報ひろば</Text>
              </TouchableOpacity>
            </View>
            {/* お気に入り */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: windowWidth / 4,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  this.props.navigation.navigate("HomeArticleList", {
                    mode: "favorite",
                  })
                }
              >
                <Image
                  resizeMode="contain"
                  source={require("./../images/icons8-star-48.png")}
                />
                <Text style={{ textAlign: "center" }}>お気に入り</Text>
              </TouchableOpacity>
            </View>
            {/* 所持コイン - 2020/09 追加*/}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: windowWidth / 4,
              }}
            >
              {/* <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  this.props.navigation.navigate("HomeArticleList", {
                    mode: "favorite",
                  })
                }
              > */}
              <Image
                resizeMode="contain"
                source={require("./../images/shojicoin.png")}
              />
              <Text style={{ textAlign: "center" }}>
                {this.state.bccoin}コイン
              </Text>
              {/* </TouchableOpacity> */}
            </View>
            {/* ログアウト */}
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: windowWidth / 4,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  this.setState({
                    confirmDialogVisible: true,
                    confirmDialogMessage: "ログアウトしてもよろしいですか？",
                  })
                }
              >
                <Image
                  resizeMode="contain"
                  source={require("./../images/icons8-logout-48.png")}
                />
                <Text style={{ textAlign: "center" }}>ログアウト</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* -- 確認ダイアログ（ログアウト） -- */}
        <ConfirmDialog
          modalVisible={this.state.confirmDialogVisible}
          message={this.state.confirmDialogMessage}
          handleYes={this.logout.bind(this)}
          handleNo={() => {
            this.setState({ confirmDialogVisible: false });
          }}
          handleClose={() => {
            this.setState({ confirmDialogVisible: false });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  carousel: {
    flex: 1,
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
    backgroundColor: "ivory",
  },
  articleImage: {
    width: articleImageWidth,
    height: (articleImageWidth * 3) / 4,
    // minWidth: 55,
    // minHeight: 55
    borderColor: "gray",
    borderWidth: 1,
  },
  spinnerTextStyle: {
    color: "#FFF",
    fontSize: 18,
  },
  section: {
    height: 25,
    backgroundColor: "rgba(255, 136, 0, 0.92)",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  sectionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  sectionMoreText: {
    color: "white",
    fontSize: 16,
    position: "absolute",
    right: 0,
  },
  iconBadgeStyle: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 50,
    minWidth: 10,
    right: 5,
  },
});
