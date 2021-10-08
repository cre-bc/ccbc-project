import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Modal,
  TextInput,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  TouchableHighlight,
} from "react-native";
import { Icon, Avatar, Card } from "react-native-elements";
import Hyperlink from "react-native-hyperlink";
import Spinner from "react-native-loading-spinner-overlay";
import moment from "moment";
import "moment/locale/ja";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ConfirmDialog from "./components/ConfirmDialog";
import AlertDialog from "./components/AlertDialog";

const windowWidth = Dimensions.get("window").width;
const articleImageWidth = windowWidth * 0.8;
const windowSize = Dimensions.get('window')

const restdomain = require("./common/constans.js").restdomain;
const goodImageOn = require("./../images/good-on.png");
const goodImageOff = require("./../images/good-off.png");

export default class ArticleRefer extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      mode: "",
      isProcessing: false,
      current_kiji_category_pk: "",
      selectCategory: {
        t_kiji_category_pk: null,
        category_nm: "",
      },
      speCategoryFlg: false,
      articleList: [],
      t_kiji_pk: "",
      favorite_flg: "0",
      good_flg: "0",
      refreshing: false,
      searchDialogVisible: false,
      searchCondKijiPk: "",
      searchCondYear: "",
      searchCondKeyword: "",
      searchCondHashtag: "",
      readLastKijiPk: "",
      readCount: 10,
      screenNo: 15,
      viewMode: "",
      responseList: [],
      resComment: "",
      resTarget: 0,
      resMode: "",
      resResponsPk: "",
      confirmDialogVisible: false,
      confirmDialogMessage: "",
      alertDialogVisible: false,
      alertDialogMessage: "",
      colorStyle: "#ffffff",
      commentOpenFlg: false,
      scrollHeight: 0,
      scrollHeightNow: 0,
      scrollViewHeight: 0,
      isLoading: false,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // 初期表示時のisProcessingはcomponentWillMountでのみ行う（iOSの場合にisProcessingが解除されない問題のため）
    this.setState({ isProcessing: true });

    this.props.navigation.addListener("willFocus", () => this.onWillFocus());
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    //アクセス情報登録
    this.setAccessLog();

    this.state.readLastKijiPk = "";

    // パラメータを受け取り、どの画面から遷移したかを判断
    const mode = this.props.navigation.getParam("mode");
    this.state.mode = mode;
    // パラメータを受け取り、単独記事の照会かを判断
    const viewMode = this.props.navigation.getParam("viewMode")
    this.state.viewMode = viewMode;

    if (mode === "home") {
      // ホーム画面からの遷移
      const selectKijiPk = this.props.navigation.getParam("selectKijiPk");
      this.state.searchCondKijiPk = selectKijiPk;
    } else {
      // 記事選択画面・記事投稿画面からの遷移
      const selectCategory = this.props.navigation.getParam("selectCategory");
      this.state.selectCategory = selectCategory;
      this.state.current_kiji_category_pk = selectCategory.t_kiji_category_pk;
      if (selectCategory.spe_category_flg === "1") {
        this.setState({ speCategoryFlg: true });
      }
    }

    // 記事リスト取得
    await this.readArticle(true);
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

  readArticle = async (isFirst) => {
    // 記事API.記事リスト取得処理の呼び出し
    await fetch(restdomain + "/article/findArticle", {
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
            this.setState({ isProcessing: false });
          } else {
            // 取得したデータをStateに格納
            if (this.state.mode === "home") {
              this.setState({
                selectCategory: {
                  t_kiji_category_pk: json.data[0].t_kiji_category_pk,
                  category_nm: json.data[0].category_nm,
                },
              });
            }
            var data = json.data;
            var readCount = this.state.readCount;
            if (!isFirst) {
              data = this.state.articleList.concat(data);
              readCount += 10;
            }
            var readLastKijiPk = this.state.readLastKijiPk;
            if (json.data.length > 0) {
              readLastKijiPk = json.data[json.data.length - 1].t_kiji_pk;
            }
            this.setState({
              articleList: data,
              readLastKijiPk: readLastKijiPk,
              isProcessing: false,
              readCount: readCount,
            });
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));

    this.setState({ isProcessing: false });
  };

  readResponse = async () => {
    // 記事API.記事リスト取得処理の呼び出し
    await fetch(restdomain + "/article/findResponse", {
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
            this.setState({ isProcessing: false });
          } else {
            // 検索結果の取得
            var resultList = json.data;
            this.setState({ isProcessing: false });
            this.setState({ responseList: resultList });
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
    this.setState({ isProcessing: false });
  };

  /** 記事投稿画面へ遷移 */
  moveEntry = async (index) => {
    var paramArticle = null;
    // 編集の場合は対象リストのindexを指定、新規の場合はindexはnull
    if (index != null) {
      var selItem = this.state.articleList[index];
      paramArticle = {
        t_kiji_pk: selItem.t_kiji_pk,
        t_kiji_category_pk: selItem.t_kiji_category_pk,
        t_shain_pk: selItem.t_shain_pk,
        title: selItem.title,
        contents: selItem.contents,
        post_dt: selItem.post_dt,
        post_tm: selItem.post_tm,
        file_path: selItem.file_path,
        file_path2: selItem.file_path2,
        file_path3: selItem.file_path3,
        hashtag_str: selItem.hashtag_str,
      };
    }

    this.props.navigation.navigate("ArticleEntry", {
      mode: this.state.mode,
      selectCategory: this.state.selectCategory,
      selectArticle: paramArticle,
    });
  };

  /**
   * 記事照会画面のイベント
   */

  /** 新規投稿ボタン押下 */
  onClickNewArticleBtn = async () => {
    // 記事投稿画面へ遷移
    this.moveEntry(null);
  };

  /** 記事編集ボタン押下 */
  onClickEditArticleBtn = async (index) => {
    // 記事投稿画面へ遷移（修正対象の記事情報を設定）
    this.moveEntry(index);
  };

  /** 記事検索ボタン押下 */
  onClickSearchArticleBtn = async () => {
    // 記事検索ダイアログを表示
    this.setState({ searchDialogVisible: true });
  };

  // /** いいねボタン押下 */
  // onClickGoodBtn = async (index) => {
  //   // stateの内容を書き換え
  //   var wkList = this.state.articleList;
  //   var selectArticle = wkList[index];
  //   selectArticle.good_flg = selectArticle.good_flg == "0" ? "1" : "0";
  //   wkList[index] = selectArticle;
  //   this.setState({
  //     articleList: wkList,
  //     t_kiji_pk: selectArticle.t_kiji_pk,
  //     good_flg: selectArticle.good_flg,
  //   });
  //   this.state.t_kiji_pk = selectArticle.t_kiji_pk;
  //   this.state.good_flg = selectArticle.good_flg;

  //   // 記事API.いいね処理の呼び出し（DB登録）
  //   await fetch(restdomain + "/article/good", {
  //     method: "POST",
  //     mode: "cors",
  //     body: JSON.stringify(this.state),
  //     headers: new Headers({ "Content-type": "application/json" }),
  //   })
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     .then(function (json) { }.bind(this))
  //     .catch((error) => console.error(error));
  // };

  /** コメントボタン押下 */
  onClickResponseBtn = async (index) => {
    this.setState({ isLoading: true });
    // var offsetY = 0
    if (this.state.commentOpenFlg) {
      // コメント開く→閉じるの場合
      // パラメータを受け取り、どの画面から遷移したかを判断
      const mode = this.props.navigation.getParam("mode");
      this.state.mode = mode;
      // パラメータを受け取り、単独記事の照会かを判断
      const viewMode = this.props.navigation.getParam("viewMode")
      this.state.viewMode = viewMode;

      if (mode === "home") {
        // ホーム画面からの遷移
        const selectKijiPk = this.props.navigation.getParam("selectKijiPk");
        this.state.searchCondKijiPk = selectKijiPk;
      } else {
        // 記事選択画面・記事投稿画面からの遷移
        const selectCategory = this.props.navigation.getParam("selectCategory");
        this.state.selectCategory = selectCategory;
        this.state.current_kiji_category_pk = selectCategory.t_kiji_category_pk;
        this.state.searchCondKijiPk = ""
        if (selectCategory.spe_category_flg === "1") {
          this.setState({ speCategoryFlg: true });
        }
        // offsetY = this.state.scrollHeight
      }
      this.setState({
        commentOpenFlg: false,
        viewMode: "multi",
        resMode: "",
        responseList: [],
        readLastKijiPk: ""
      })
    } else {
      // コメント閉じる→開くの場合
      // コメント対象の記事情報を設定
      var selItem = this.state.articleList[index];
      const selectKijiPk = selItem.t_kiji_pk;
      this.state.searchCondKijiPk = selectKijiPk;
      this.setState({
        commentOpenFlg: true,
        mode: "home",
        viewMode: "only",
        resMode: "insert"
      });
      // コメントリスト取得
      await this.readResponse();
    }
    this.state.readLastKijiPk = ""
    // 記事リスト取得
    await this.readArticle(true);

    this.setState({ isLoading: false });
    // if (this.nodeRef) {
    //   if (this.setState.commentOpenFlg) {
    //     this.nodeRef.scrollToEnd();
    //   } else {
    //     this.nodeRef.scrollTo({ x: 0, y: offsetY, animated: true });
    //   }
    // }
  };

  /** 返信ボタン押下 */
  onClickReplyBtn = async (shimei, from_shain_pk) => {
    this.setState({ resComment: '' })
    this.setState({
      resComment: '>' + shimei + 'さん' + "\n",
      resTarget: from_shain_pk,
      resMode: "insert",
      colorStyle: "#ffffff",
      resResponsPk: "",
    })
  };

  /** レス編集ボタン押下 */
  onClickReplyEditBtn = async (t_response_pk, response) => {
    this.setState({
      resComment: response,
      resResponsPk: t_response_pk,
      resMode: "edit",
      colorStyle: "#ffd8d8"
    })
    this.state.colorStyle = "#ffd8d8"
  };

  /** レス編集キャンセルボタン押下 */
  onClickReplyEditCancelBtn = async () => {
    this.setState({
      resComment: "",
      resResponsPk: "",
      resMode: "insert",
      colorStyle: "#ffffff"
    })
    this.state.colorStyle = "#ffffff"
  };

  /** レス削除ボタン押下 */
  onClickReplyDelBtn = async (t_response_pk) => {
    // 確認ダイアログを表示（YESの場合、send()を実行）
    this.setState({
      resResponsPk: t_response_pk,
      resMode: "delete",
      confirmDialogVisible: true,
      confirmDialogMessage: "コメントを削除します。よろしいですか？",
    });
  };

  // レスコメントの入力テキスト変更時
  handleReplyTextChange = async (resComment) => {
    this.setState({ resComment });
    // レスコメントが空の場合
    if (resComment == "") {
      // レス先を空にセット
      this.setState({
        resTarget: 0,
      })
    }
  };

  /** レス送信ボタン押下 */
  onSendReplyBtn = async () => {
    // 入力チェック
    var alertMessage = "";

    // レスコメントが空の場合
    if (this.state.resComment == "") {
      alertMessage += "コメントが未入力です";
    }

    // エラーメッセージを設定
    if (alertMessage !== "") {
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage,
      });
      return;
    } else {
      // 記事API.レス送信処理の呼び出し（DB登録）
      await this.send();
      // if (this.nodeRef) {
      //   this.nodeRef.scrollToEnd();
      // }
    }
  };

  setRef = (node) => {
    this.nodeRef = node;
  }

  /** データ更新処理 */
  send = async () => {
    // // Processingの表示は新規の場合のみ（iOSの場合に消えない問題があるため）
    if (this.state.resMode === "insert") {
      this.setState({ isProcessing: true });
    }
    this.setState({ confirmDialogVisible: false });

    await fetch(restdomain + "/article/sendReply", {
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
          this.setState({ isProcessing: false });
          if (!json.status) {
            alert("返信でエラーが発生しました");
          } else {

          }
        }.bind(this)
      )
      .catch((error) => alert(error));
    // コメントリスト取得
    await this.readResponse();
    this.setState({
      isProcessing: false,
      resComment: "",
      resMode: "insert",
      colorStyle: "#ffffff",
      resResponsPk: "",
      resTarget: "0"
    });
    await this.readArticle(true)
  };

  /** お気に入りボタン押下 */
  onClickFavoriteBtn = async (index) => {
    // stateの内容を書き換え
    var wkList = this.state.articleList;
    var selectArticle = wkList[index];
    selectArticle.favorite_flg = selectArticle.favorite_flg == "0" ? "1" : "0";
    wkList[index] = selectArticle;
    this.setState({
      articleList: wkList,
      t_kiji_pk: selectArticle.t_kiji_pk,
      favorite_flg: selectArticle.favorite_flg,
    });
    this.state.t_kiji_pk = selectArticle.t_kiji_pk;
    this.state.favorite_flg = selectArticle.favorite_flg;

    // 記事API.お気に入り処理の呼び出し（DB登録）
    await fetch(restdomain + "/article/favorite", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) { }.bind(this))
      .catch((error) => console.error(error));
  };

  /** スクロール最下部到達（次の記事の読み込み） */
  reachScrollBottom = async (e) => {
    if (this.state.mode === "home") {
      return;
    }

    // 最下部に到達していない場合は処理を抜ける
    const offsetY = e.nativeEvent.contentOffset.y; // スクロール距離
    const contentSizeHeight = e.nativeEvent.contentSize.height; // scrollView contentSizeの高さ
    const scrollViewHeight = e.nativeEvent.layoutMeasurement.height; // scrollViewの高さ
    if (offsetY + scrollViewHeight < Math.floor(contentSizeHeight)) {
      // alert("offsetY:" + offsetY + " scrollViewHeight:" + scrollViewHeight + " contentSizeHeight:" + contentSizeHeight)
      return;
    }

    // 記事リスト取得（次の記事の読み込み）
    await this.readArticle(false);
  };

  /** スクロール位置の取得（コメント非表示時のみ取得）*/
  handleScroll = async (e) => {
    if (!this.state.commentOpenFlg && !this.state.isLoading) {
      const offsetY = e.nativeEvent.contentOffset.y; // スクロール距離      
      const scrollViewHeight = e.nativeEvent.layoutMeasurement.height; // scrollViewの高さ
      // this.setState({ scrollHeight: parseInt(offsetY + scrollViewHeight) })
      this.setState({ scrollHeight: parseInt(offsetY) })
    }
    // TEST用
    this.setState({ scrollHeightNow: parseInt(e.nativeEvent.contentOffset.y) })
  }

  /** スクロールのリフレッシュ（ページを引っ張った操作） */
  onRefresh = async () => {
    this.setState({
      refreshing: true,
      readLastKijiPk: "",
    });
    this.state.readLastKijiPk = "";
    this.state.readCount = 10;

    // 記事リスト取得（再表示）
    await this.readArticle(true);

    this.setState({ refreshing: false });
  };

  /**
   * 検索ダイアログ画面のイベント
   */

  /** 検索条件設定ボタン押下 */
  onClickDlgSearchBtn = async () => {
    this.setState({
      searchDialogVisible: false,
      readLastKijiPk: "",
    });
    this.state.readLastKijiPk = "";
    this.state.readCount = 10;

    // 記事リスト取得（条件付与）
    await this.readArticle(true);
  };

  /** 検索条件クリアボタン押下 */
  onClickDlgClearBtn = async () => {
    // 検索条件のクリア
    this.setState({
      searchDialogVisible: false,
      searchCondYear: "",
      searchCondKeyword: "",
      searchCondHashtag: "",
      readLastKijiPk: "",
    });
    this.state.searchCondYear = "";
    this.state.searchCondKeyword = "";
    this.state.searchCondHashtag = "";
    this.state.readLastKijiPk = "";
    this.state.readCount = 10;

    // 記事リスト取得
    await this.readArticle(true);
  };

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 2 }} behavior={Platform.OS == "ios" ? "padding" : ""}>
        <View style={{ flex: 1, backgroundColor: "ivory" }}>
          {/* -- 処理中アニメーション -- */}
          <Spinner
            visible={this.state.isProcessing}
            textContent={"Processing…"}
            textStyle={styles.spinnerTextStyle}
          />

          {/* -- 共有ヘッダ -- */}
          <InAppHeader navigate={this.props.navigation.navigate} />

          {/* -- 画面タイトル -- */}
          <View style={[styles.screenTitleView, { flexDirection: "row" }]}>
            {/* 検索アイコン */}
            <View style={{ flex: 1, alignItems: "flex-start", marginLeft: 10 }}>
              {(() => {
                if (this.state.mode === "article") {
                  return (
                    <Icon
                      name="search"
                      type="font-awesome"
                      color="white"
                      size={30}
                      onPress={() => this.onClickSearchArticleBtn()}
                    />
                  );
                }
              })()}
            </View>

            {/* 記事カテゴリ名 */}
            <View style={{ alignItems: "center" }}>
              <Text style={styles.screenTitleText}>
                {this.state.selectCategory.category_nm}
                {/* {'  '}{this.state.scrollHeight}{' '}{this.state.scrollViewHeight}{' '}{this.state.scrollHeightNow} */}
              </Text>
            </View>

            {/* 新規投稿アイコン */}
            <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
              {(() => {
                if (this.state.mode === "article" && !this.state.speCategoryFlg) {
                  return (
                    <Icon
                      name="edit"
                      type="font-awesome"
                      color="white"
                      size={30}
                      onPress={() => this.onClickNewArticleBtn()}
                    />
                  );
                }
              })()}
            </View>
          </View>
          <View style={[{ flex: 8, flexDirection: "row" }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              maximumZoomScale={2}
              onMomentumScrollEnd={this.reachScrollBottom.bind(this)}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.onRefresh}
                />
              }
              ref={this.setRef}
              onContentSizeChange={(width, height) => {
                // TEST用
                this.setState({ scrollViewHeight: parseInt(height) });
                // Viewサイズが変更した際にスクロール（コメント表示時は最下部へ、コメントから戻った際は前回スクロール位置へ）
                if (this.nodeRef) {
                  if (this.state.commentOpenFlg) {
                    this.nodeRef.scrollToEnd();
                  } else {
                    this.nodeRef.scrollTo({ x: 0, y: this.state.scrollHeight, animated: true });
                  }
                }
              }}
              onScroll={this.handleScroll}
            >
              {/* -- 記事表示（繰り返し） -- */}
              {this.state.articleList.map((item, i) => {
                return (
                  <Card key={i}>
                    {/* 投稿情報 */}
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{ flex: 1, alignItems: "center", marginRight: 5 }}
                      >
                        {/* 投稿日時 */}
                        <Text style={styles.dateTimeText}>
                          {moment(new Date(item.post_dt)).format("YYYY/MM/DD")}
                        </Text>
                        <Text style={styles.dateTimeText}>
                          {moment(item.post_tm, "HH:mm:ss").format("H:mm")}
                        </Text>

                        {/* 社員画像 */}
                        <Avatar
                          rounded
                          source={{
                            uri: restdomain + `/uploads/${item.shain_image_path}`,
                          }}
                          activeOpacity={0.7}
                        />
                      </View>

                      <View style={{ flex: 4 }}>
                        <View style={{ flexDirection: "row" }}>
                          {/* 投稿者名 */}
                          <View style={{ flex: 4 }}>
                            <Text style={{ fontSize: 18, color: "black" }}>
                              {"　"}
                              {item.shain_nm}
                            </Text>
                          </View>

                          {/* 自身の投稿記事の場合、編集アイコンを表示する */}
                          <View style={{ flex: 1 }}>
                            {(() => {
                              if (this.state.viewMode !== "only" && item.t_shain_pk == this.state.loginShainPk) {
                                return (
                                  <Icon
                                    name="pencil"
                                    type="font-awesome"
                                    onPress={() => this.onClickEditArticleBtn(i)}
                                  />
                                );
                              }
                            })()}
                          </View>

                          {/* いいね */}
                          {/* <View style={{ flex: 1, alignItems: "flex-end" }}>
                          {(() => {
                            const goodImageSrc =
                              item.good_flg === "0" ? goodImageOff : goodImageOn;
                            const goodStr =
                              item.good_flg === "0" ? "　　　" : "いいね";
                            return (
                              <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => this.onClickGoodBtn(i)}
                              >
                                <Image
                                  source={goodImageSrc}
                                  style={{ width: 25, height: 25 }}
                                />
                                <Text style={{ fontSize: 8, color: "red" }}>
                                  {goodStr}
                                </Text>
                              </TouchableOpacity>
                            );
                          })()}
                        </View> */}

                          {/* お気に入り */}
                          <View style={{ flex: 1, alignItems: "flex-end" }}>
                            {(() => {
                              if (this.state.viewMode !== "only") {
                                return (
                                  <View>
                                    {(() => {
                                      const favoriteColor =
                                        item.favorite_flg === "0" ? "gray" : "orange";
                                      return (
                                        <Icon
                                          name="star"
                                          type="font-awesome"
                                          color={favoriteColor}
                                          onPress={() => this.onClickFavoriteBtn(i)}
                                        />
                                      );
                                    })()}
                                  </View>
                                );
                              }
                            })()}
                          </View>
                        </View>

                        {/* タイトル */}
                        <Text style={{ fontSize: 16, color: "blue" }}>
                          {item.title}
                        </Text>

                        {/* ハッシュタグ */}
                        <Text style={{ fontSize: 12, color: "gray" }}>
                          {item.hashtag_str}
                        </Text>
                      </View>
                    </View>

                    {/* 記事内容 */}
                    <View style={{ marginTop: 10, marginBottom: 10 }}>
                      <Hyperlink
                        linkDefault={true}
                        linkStyle={{
                          color: "#2980b9",
                          textDecorationLine: "underline",
                        }}
                      >
                        <Text
                          selectable
                          style={{ fontSize: 16, lineHeight: 16 * 1.5 }}
                        >
                          {item.contents}
                        </Text>
                      </Hyperlink>
                    </View>

                    {/* 画像（1 - メイン） */}
                    <View
                      style={{
                        marginTop: 10,
                        marginBottom: 5,
                        alignItems: "center",
                      }}
                    >
                      {item.file_path !== "" && item.file_path !== null && (
                        <Image
                          source={{
                            uri: restdomain + `/uploads/article/${item.file_path}`,
                          }}
                          style={{
                            width: articleImageWidth,
                            height: articleImageWidth,
                          }}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    {/* 画像（2） */}
                    {item.file_path2 !== "" && item.file_path2 !== null && (
                      <View
                        style={{
                          marginTop: 10,
                          marginBottom: 0,
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{
                            uri: restdomain + `/uploads/article/${item.file_path2}`,
                          }}
                          style={{
                            width: articleImageWidth,
                            height: articleImageWidth,
                          }}
                          resizeMode="contain"
                        />
                      </View>
                    )}

                    {/* 画像（3） */}
                    {item.file_path3 !== "" && item.file_path3 !== null && (
                      <View
                        style={{
                          marginTop: 10,
                          marginBottom: 0,
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{
                            uri: restdomain + `/uploads/article/${item.file_path3}`,
                          }}
                          style={{
                            width: articleImageWidth,
                            height: articleImageWidth,
                          }}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    {/* {(() => {
                    if (this.state.viewMode == "multi") {
                      return ( */}
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                      <MaterialCommunityIcons name="comment-text-multiple-outline" size={30} onPress={() => this.onClickResponseBtn(i)} />
                      <Text style={{ fontSize: 18 }}>
                        {" "}
                        {item.res_cnt}
                      </Text>
                    </View>
                    {/* );
                    }
                  })()} */}
                  </Card>
                );
              })}

              {/* -- レス表示（繰り返し） -- */}
              {this.state.responseList.map((item, i) => {
                return (
                  <Card key={i} containerStyle={{ marginTop: -1, marginBottom: 0, }}>
                    {/* 投稿情報 */}
                    <View style={{ flexDirection: "row" }}>
                      {/* 社員画像 */}
                      <Avatar
                        rounded
                        source={{
                          uri: restdomain + `/uploads/${item.image_file_nm}`,
                        }}
                        activeOpacity={0.5}
                      />
                      {/* 投稿者名 */}
                      <Text>
                        {"　"}
                      </Text>
                      <View style={{ flex: 2 }}>
                        <Text>
                          {"　"}
                        </Text>
                        <Text style={{ fontSize: 13, color: "black" }}>
                          {item.shimei}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end", flex: 2 }}>
                        {(() => {
                          if (item.from_shain_pk !== this.state.loginShainPk) {
                            return (
                              <MaterialCommunityIcons name="comment-edit-outline" size={22} onPress={() => this.onClickReplyBtn(item.shimei, item.from_shain_pk)} />
                            );
                          }
                        })()}
                      </View>
                      <View style={{ alignItems: "flex-end", flex: 1 }}>
                        {(() => {
                          if (item.from_shain_pk == this.state.loginShainPk && this.state.resResponsPk !== item.t_response_pk) {
                            return (
                              <Icon name="pencil" type="font-awesome" size={22} onPress={() => this.onClickReplyEditBtn(item.t_response_pk, item.response)} />
                            );
                          } else if (item.from_shain_pk == this.state.loginShainPk && this.state.resResponsPk == item.t_response_pk && this.state.resMode !== "delete")
                            return (
                              <Icon
                                name="times-circle"
                                type="font-awesome"
                                color="black"
                                size={22}
                                onPress={() => {
                                  this.onClickReplyEditCancelBtn();
                                }}
                              />
                            );
                        })()}
                      </View>
                      <View style={{ alignItems: "flex-end", flex: 1 }}>
                        {(() => {
                          if (item.from_shain_pk == this.state.loginShainPk && this.state.resMode !== "edit") {
                            return (
                              <Icon name="trash" type="font-awesome" size={22} onPress={() => this.onClickReplyDelBtn(item.t_response_pk)} />
                            );
                          }
                        })()}
                      </View>
                      {/* 投稿日時 */}
                      <View>
                        <Text>
                          {"　"}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={styles.dateTimeText}>
                            {moment(new Date(item.post_dt)).format("YYYY/MM/DD")}
                          </Text>
                          <Text>
                            {" "}
                          </Text>
                          <Text style={styles.dateTimeText}>
                            {moment(item.post_tm, "HH:mm:ss").format("H:mm")}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text>
                        {"　"}
                      </Text>
                      <Text style={{ fontSize: 16 }}>
                        {item.response}
                      </Text>
                    </View>
                  </Card>
                );
              })}
              {/* スクロールが最下部まで表示されないことの暫定対応... */}
              <View style={{ marginBottom: 50 }} />

            </ScrollView>
          </View>

          {(() => {
            if (this.state.viewMode == "only") {
              return (
                <View style={styles.inputContainer}>
                  <View style={styles.textContainer}>
                    <View>
                      <TextInput
                        multiline={true}
                        value={this.state.resComment}
                        style={styles.input}
                        placeholder="コメントを入力"
                        onChangeText={this.handleReplyTextChange}
                        backgroundColor={this.state.colorStyle}
                      />
                    </View>
                  </View>
                  <View style={styles.sendContainer}>
                    <TouchableHighlight
                      underlayColor={'#rgba(255, 136, 0, 0.92)'}
                      onPress={() => this.onSendReplyBtn()}
                    >
                      <Text style={styles.sendLabel}>返信</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              );
            }
          })()}
          {/* -- 検索ダイアログ -- */}
          <Modal
            visible={this.state.searchDialogVisible}
            animationType={"slide"}
            onRequestClose={() => {
              this.setState({ searchDialogVisible: false });
            }}
          >
            <View style={{ flex: 1 }}>
              {/* ヘッダ部 */}
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: "row" }}>
                {/* 検索アイコン */}
                <View style={{ marginLeft: 10 }}>
                  <Icon
                    name="search"
                    type="font-awesome"
                    color="black"
                    size={30}
                    onPress={() => this.onClickDlgSearchBtn()}
                  />
                </View>

                {/* 検索クリアアイコン */}
                <View
                  style={{ flex: 1, alignItems: "flex-start", marginLeft: 10 }}
                >
                  <Icon
                    name="search-minus"
                    type="font-awesome"
                    color="black"
                    size={30}
                    onPress={() => this.onClickDlgClearBtn()}
                  />
                </View>

                {/* 閉じるアイコン */}
                <View
                  style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}
                >
                  <Icon
                    name="times-circle"
                    type="font-awesome"
                    color="black"
                    size={30}
                    onPress={() => {
                      this.setState({ searchDialogVisible: false });
                    }}
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
                      keyboardType="numeric"
                      maxLength={4}
                      onChangeText={(text) => {
                        this.setState({ searchCondYear: text });
                      }}
                    />
                  </View>

                  {/* 検索キーワード */}
                  <View>
                    <Text style={styles.inputTitle}>検索キーワード ※</Text>
                    <TextInput
                      style={styles.inputText}
                      value={this.state.searchCondKeyword}
                      onChangeText={(text) => {
                        this.setState({ searchCondKeyword: text });
                      }}
                    />
                  </View>

                  {/* タグ */}
                  <View>
                    <Text style={styles.inputTitle}>タグ ※</Text>
                    <TextInput
                      style={styles.inputText}
                      value={this.state.searchCondHashtag}
                      onChangeText={(text) => {
                        this.setState({ searchCondHashtag: text });
                      }}
                    />
                    <Text style={styles.inputTitle}>
                      ※スペース区切りで複数条件可
                    </Text>
                  </View>
                </Card>
              </View>
              <View style={{ flex: 1 }} />
            </View>
          </Modal>
          {/* -- 確認ダイアログ -- */}
          <ConfirmDialog
            modalVisible={this.state.confirmDialogVisible}
            message={this.state.confirmDialogMessage}
            handleYes={this.send.bind(this)}
            handleNo={() => {
              this.setState({
                confirmDialogVisible: false,
                resMode: "insert",
                resResponsPk: ""
              });
            }}
            handleClose={() => {
              this.setState({
                confirmDialogVisible: false,
                resMode: "insert",
                resResponsPk: ""
              });
            }}
          />

          {/* -- メッセージダイアログ -- */}
          <AlertDialog
            modalVisible={this.state.alertDialogVisible}
            message={this.state.alertDialogMessage}
            handleClose={() => {
              this.setState({ alertDialogVisible: false });
            }}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  screenTitleView: {
    alignItems: "center",
    backgroundColor: "#ff5622",
  },
  screenTitleText: {
    fontSize: 18,
    color: "white",
    padding: 10,
  },
  dateTimeText: {
    fontSize: 10,
    color: "gray",
  },
  inputTitle: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  inputText: {
    fontSize: 16,
    color: "black",
    padding: 5,
    borderColor: "gray",
    borderWidth: 1,
  },
  spinnerTextStyle: {
    color: "#FFF",
    fontSize: 18,
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
  sectionMoreText: {
    color: "blue",
  },
  inputText: {
    fontSize: 16,
    color: "black",
    padding: 5,
    borderColor: "gray",
    backgroundColor: "white",
    borderWidth: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#ffffff'
  },
  topContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#6E5BAA',
    paddingTop: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 136, 0, 0.92)'
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  sendContainer: {
    justifyContent: 'flex-end',
    paddingRight: 10
  },
  sendLabel: {
    color: '#ffffff',
    fontSize: 15
  },
  input: {
    width: windowSize.width - 70,
    color: '#555555',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 5,
    height: '100%',
    borderColor: 'rgba(255, 136, 0, 0.92)',
    borderWidth: 1,
    borderRadius: 2,
    alignSelf: 'center',
    textAlignVertical: "top"
  },
  saveButtonTitleText: {
    fontSize: 12,
    color: "white",
    padding: 10,
  },
  saveButtonView: {
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 136, 0, 0.92)",
    flexDirection: "row",
  },
});
