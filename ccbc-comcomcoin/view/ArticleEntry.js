import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  TouchableHighlight,
  KeyboardAvoidingView,
  Dimensions,
  AsyncStorage,
} from "react-native";
import { Icon } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Spinner from "react-native-loading-spinner-overlay";
import moment from "moment";
import "moment/locale/ja";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";
import ConfirmDialog from "./components/ConfirmDialog";
import AlertDialog from "./components/AlertDialog";

const restdomain = require("./common/constans.js").restdomain;
const CHAR_LEN_TITLE = 30;
const CHAR_LEN_HASHTAG = 10;
const CHAR_LEN_CONTENTS = 1000;
const HASHTAG_UPPER_LIMIT = 3;

const windowWidth = Dimensions.get("window").width;
const articleImageWidth = windowWidth * 0.8;

export default class ArticleEntry extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      mode: "",
      selectCategory: null,
      selectArticle: null,
      t_kiji_pk: "",
      t_kiji_category_pk: "",
      t_shain_pk: "",
      title: "",
      contents: "",
      post_dt: "",
      post_tm: "",
      file_path: "",
      hashtag_str: "",
      imageData: {
        uri: "",
        type: "",
        name: "",
      },
      categoryNm: "",
      confirmDialogVisible: false,
      confirmDialogMessage: "",
      alertDialogVisible: false,
      alertDialogMessage: "",
      isProcessing: false,
      finDialogVisible: false,
      getCoin: 0,
      screenNo: 16,
      strageSaveFlg: false,
    };
  }

  // タイトルの入力テキスト変更時
  handleTitleTextChange = async (title) => {
    this.setState({ title });
    // 新規投稿時の記事のみ保存
    if (!this.state.strageSaveFlg && this.state.t_kiji_pk === "") {
      try {
        let kijiInfo = {
          title: title,
          hashtag_str: this.state.hashtag_str,
          contents: this.state.contents,
        };
        const kijiInfoStrage = JSON.stringify(kijiInfo);
        // keyは記事カテゴリPK + kijiInfo
        var strageKey = this.state.t_kiji_category_pk + "kijiInfo";

        await AsyncStorage.setItem(strageKey, kijiInfoStrage);
      } catch (e) {
        console.log(e);
      }
    }
  };

  // ハッシュタグの入力テキスト変更時
  handleHashTagTextChange = async (hashtag_str) => {
    this.setState({ hashtag_str });
    // 新規投稿時の記事のみ保存
    if (!this.state.strageSaveFlg && this.state.t_kiji_pk === "") {
      try {
        let kijiInfo = {
          title: this.state.title,
          hashtag_str: hashtag_str,
          contents: this.state.contents,
        };
        const kijiInfoStrage = JSON.stringify(kijiInfo);
        // keyは記事カテゴリPK + kijiInfo
        var strageKey = this.state.t_kiji_category_pk + "kijiInfo";

        await AsyncStorage.setItem(strageKey, kijiInfoStrage);
      } catch (e) {
        console.log(e);
      }
    }
  };

  // 記事の入力テキスト変更時
  handleContentsTextChange = async (contents) => {
    this.setState({ contents });
    // 新規投稿時の記事のみ保存
    if (!this.state.strageSaveFlg && this.state.t_kiji_pk === "") {
      try {
        let kijiInfo = {
          title: this.state.title,
          hashtag_str: this.state.hashtag_str,
          contents: contents,
        };
        const kijiInfoStrage = JSON.stringify(kijiInfo);
        // keyは記事カテゴリPK + kijiInfo
        var strageKey = this.state.t_kiji_category_pk + "kijiInfo";

        await AsyncStorage.setItem(strageKey, kijiInfoStrage);
      } catch (e) {
        console.log(e);
      }
    }
  };

  /** AsyncStorageから入力内容を保存 */
  saveItem = async () => {
    // 新規投稿時の記事のみ保存
    if (!this.state.strageSaveFlg && this.state.t_kiji_pk === "") {
      try {
        let kijiInfo = {
          title: this.state.title,
          hashtag_str: this.state.hashtag_str,
          contents: this.state.contents,
        };
        const kijiInfoStrage = JSON.stringify(kijiInfo);
        // keyは記事カテゴリPK + kijiInfo
        var strageKey = this.state.t_kiji_category_pk + "kijiInfo";

        await AsyncStorage.setItem(strageKey, kijiInfoStrage);
      } catch (e) {
        console.log(e);
      }
    }
  };

  /** AsyncStorageから入力内容を読み込み */
  loadItem = async () => {
    try {
      var strageKey = this.state.t_kiji_category_pk + "kijiInfo";
      const kijiInfoStrage = await AsyncStorage.getItem(strageKey);

      if (kijiInfoStrage) {
        const kijiInfo = JSON.parse(kijiInfoStrage);
        this.setState({
          title: kijiInfo["title"],
          hashtag_str: kijiInfo["hashtag_str"],
          contents: kijiInfo["contents"],
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  /** AsyncStorageから入力内容を削除 */
  removeInfo = async () => {
    try {
      this.state.strageSaveFlg = true;
      var strageKey = this.state.t_kiji_category_pk + "kijiInfo";
      await AsyncStorage.removeItem(strageKey);
    } catch (error) {
      return;
    }
  };

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // ローカルストレージの保存フラグ
    this.state.strageSaveFlg = false;

    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    // アクセス情報登録
    this.setAccessLog();

    // スマホの画像機能へのアクセス許可
    this.getPermissionAsync();

    // 記事照会画面からのパラメータ受け取り
    const mode = this.props.navigation.getParam("mode");
    const paramCategory = this.props.navigation.getParam("selectCategory");
    const paramArticle = this.props.navigation.getParam("selectArticle");
    if (paramArticle !== null) {
      // 編集時
      this.setState({
        t_kiji_pk: paramArticle.t_kiji_pk,
        t_kiji_category_pk: paramArticle.t_kiji_category_pk,
        t_shain_pk: paramArticle.t_shain_pk,
        title: paramArticle.title,
        contents: paramArticle.contents,
        post_dt: paramArticle.post_dt,
        post_tm: paramArticle.post_tm,
        file_path: paramArticle.file_path,
        hashtag_str: paramArticle.hashtag_str.replace(/#/g, ""),
      });
    } else {
      // 新規投稿時
      this.setState({
        t_kiji_category_pk: paramCategory.t_kiji_category_pk,
        t_shain_pk: this.state.login_shain_pk,
        getCoin: paramCategory.get_coin,
      });
      // ローカルストレージの読み込み
      this.loadItem();
    }
    this.setState({
      mode: mode,
      selectCategory: paramCategory,
      selectArticle: paramArticle,
      categoryNm: paramCategory.category_nm,
    });
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

  getPermissionAsync = async () => {
    if (Platform.OS === "ios") {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    }
  };

  /** 記事投稿ボタン押下 */
  onClickEntry = async () => {
    // 入力チェック
    var alertMessage = "";
    if (this.state.title == "") {
      alertMessage += "タイトルを入力してください\n\n";
    }
    if (this.state.contents == "") {
      alertMessage += "記事の内容を入力してください\n\n";
    }
    if (this.state.title.length > CHAR_LEN_TITLE) {
      alertMessage +=
        "タイトルの文字数が超過しています" +
        "（" +
        this.state.title.length +
        "文字）\n\n";
    }
    var hashes = this.state.hashtag_str
      .replace("　", " ")
      .replace("　", " ")
      .split(" ");
    if (hashes.length > HASHTAG_UPPER_LIMIT) {
      alertMessage += "タグの数は" + HASHTAG_UPPER_LIMIT + "つまでです\n\n";
    } else {
      for (var i = 0; i < hashes.length; i++) {
        if (hashes[i].length > CHAR_LEN_HASHTAG) {
          alertMessage +=
            "タグの文字数が超過しています" +
            "（" +
            hashes[i].length +
            "文字）\n\n";
        }
      }
    }
    if (this.state.contents.length > CHAR_LEN_CONTENTS) {
      alertMessage +=
        "記事の文字数が超過しています" +
        "（" +
        this.state.contents.length +
        "文字）\n\n";
    }
    if (alertMessage !== "") {
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage,
      });
      return;
    }

    // this.setState({ isProcessing: true })

    // 確認ダイアログを表示（YESの場合、entry()を実行）
    this.setState({
      confirmDialogVisible: true,
      confirmDialogMessage: "記事を投稿します。よろしいですか？",
    });
  };

  /** 記事更新処理 */
  entry = async () => {
    // Processingの表示は新規の場合のみ（iOSの場合に消えない問題があるため）
    if (this.state.t_kiji_pk === "") {
      this.setState({ isProcessing: true });
    }
    this.setState({ confirmDialogVisible: false });

    if (this.state.imageData.uri !== "") {
      // 画像ファイルのアップロードがある場合
      const extension = this.getExtension(this.state.imageData.uri);
      const fileName =
        moment(new Date()).format("YYYYMMDDHHmmssSS") + "." + extension;
      let data = new FormData();
      data.append("image", {
        uri: this.state.imageData.uri,
        name: fileName,
        type: this.state.imageData.type + "/" + extension,
      });

      await fetch(restdomain + "/article/upload", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(
          function (json) {
            if (json.status) {
              // 記事API.投稿処理の呼び出し（DB登録→BC登録）
              this.edit(fileName);
            } else {
              alert("画像ファイルのアップロードに失敗しました");
            }
          }.bind(this)
        )
        .catch((error) => alert(error));
    } else {
      // 記事API.投稿処理の呼び出し（DB登録→BC登録）
      this.edit(this.state.file_path);
    }
  };

  /** ファイルパスよりファイルの拡張子を取得 */
  getExtension = (fileName) => {
    var ret = "";
    if (!fileName) {
      return ret;
    }
    var fileTypes = fileName.split(".");
    var len = fileTypes.length;
    if (len === 0) {
      return ret;
    }
    ret = fileTypes[len - 1];
    return ret;
  };

  /** データ更新処理 */
  edit = async (fileName) => {
    // Processingの表示は新規の場合のみ（iOSの場合に消えない問題があるため）
    if (this.state.t_kiji_pk === "") {
      this.setState({ isProcessing: true });
    }
    this.state.file_path = fileName;

    await fetch(restdomain + "/article/edit", {
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
            alert("投稿処理でエラーが発生しました");
          } else {
            this.removeInfo();
            if (this.state.t_kiji_pk === "") {
              // 新規投稿の場合は、コイン獲得のメッセージを表示してから記事照会画面に戻る
              this.setState({ finDialogVisible: true });
            } else {
              // 記事照会画面に戻る
              this.props.navigation.navigate("ArticleRefer", {
                mode: this.state.mode,
                selectCategory: this.state.selectCategory,
              });
            }
          }
        }.bind(this)
      )
      .catch((error) => alert(error));

    this.setState({ isProcessing: false });
  };

  /** 画像選択処理 */
  onClickPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });
    let data = {};
    if (!result.cancelled) {
      data = {
        uri: result.uri,
        type: result.type,
      };
    } else {
      data = {
        uri: "",
        type: "",
      };
    }
    this.setState({ imageData: data });
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

        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- 入力部 -- */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == "ios" ? "padding" : ""}
        >
          <View style={{ height: "90%" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ padding: 10 }}>
                <View>
                  {/* 投稿先カテゴリ（表示のみ） */}
                  <Text style={styles.inputTitle}>投稿先</Text>
                  <TextInput
                    style={{ fontSize: 16, color: "black", padding: 5 }}
                    value={this.state.categoryNm}
                    editable={false}
                  />
                </View>
                <View>
                  {/* タイトル */}
                  <Text style={styles.inputTitle}>
                    {"タイトル（" + CHAR_LEN_TITLE + "文字以内）"}
                  </Text>
                  <TextInput
                    style={styles.inputText}
                    value={this.state.title}
                    /*onChangeText={text => { this.setState({ title: text }) }}*/
                    onChangeText={this.handleTitleTextChange}
                  />
                </View>
                <View>
                  {/* ハッシュタグ */}
                  <Text style={styles.inputTitle}>
                    {"タグ（1タグ" +
                      CHAR_LEN_HASHTAG +
                      "文字以内、スペース区切りで" +
                      HASHTAG_UPPER_LIMIT +
                      "つまで #は不要）"}
                  </Text>
                  <TextInput
                    style={styles.inputText}
                    value={this.state.hashtag_str}
                    /*onChangeText={text => { this.setState({ hashtag_str: text }) }}*/
                    onChangeText={this.handleHashTagTextChange}
                  />
                </View>
                <View style={{ marginTop: 10, marginButtom: 10 }}>
                  {/* 記事内容 */}
                  <Text style={styles.inputTitle}>
                    {"記事（" + CHAR_LEN_CONTENTS + "文字以内）"}
                  </Text>
                  <TextInput
                    multiline={true}
                    numberOfLines={8}
                    scrollEnabled={false}
                    style={[styles.inputText, { textAlignVertical: "top" }]}
                    value={this.state.contents}
                    /*onChangeText={text => { this.setState({ contents: text }) }}*/
                    onChangeText={this.handleContentsTextChange}
                  />
                </View>
                {/* 画像 */}
                <View>
                  <Text style={styles.inputTitle}>画像</Text>
                  {this.state.file_path !== "" &&
                    this.state.imageData.uri === "" && (
                      <View style={{ marginTop: 10 }}>
                        <Image
                          source={{
                            uri:
                              restdomain +
                              `/uploads/article/${this.state.file_path}`,
                          }}
                          style={{
                            width: articleImageWidth,
                            height: articleImageWidth,
                          }}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  {this.state.imageData.uri !== "" && (
                    <View>
                      <Image
                        source={{ uri: this.state.imageData.uri }}
                        style={{
                          width: articleImageWidth,
                          height: articleImageWidth,
                          marginTop: 30,
                          marginBottom: 30,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    {/* 画像選択ボタン */}
                    <View
                      style={{
                        flex: 1,
                        alignItems: "flex-start",
                        marginLeft: 10,
                      }}
                    >
                      <TouchableHighlight
                        onPress={() => this.onClickPickImage()}
                      >
                        <View style={styles.selectButtonView}>
                          <View style={styles.selectButtonTitleView}>
                            <Text style={styles.selectButtonTitleText}>
                              画像選択
                            </Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                    </View>
                    {/* 画像削除アイコン */}
                    <View
                      style={{
                        flex: 1,
                        alignItems: "flex-end",
                        marginRight: 10,
                      }}
                    >
                      <Icon
                        name="times-circle"
                        type="font-awesome"
                        color="black"
                        size={30}
                        onPress={() => {
                          this.setState({
                            imageData: { uri: "" },
                            file_path: "",
                          });
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* -- 投稿ボタン -- */}
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                  <TouchableHighlight onPress={() => this.onClickEntry()}>
                    <View style={styles.saveButtonView}>
                      <View style={styles.saveButtonTitleView}>
                        <Text style={styles.saveButtonTitleText}>投稿する</Text>
                      </View>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* -- 確認ダイアログ -- */}
        <ConfirmDialog
          modalVisible={this.state.confirmDialogVisible}
          message={this.state.confirmDialogMessage}
          handleYes={this.entry.bind(this)}
          handleNo={() => {
            this.setState({ confirmDialogVisible: false });
          }}
          handleClose={() => {
            this.setState({ confirmDialogVisible: false });
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
        <AlertDialog
          modalVisible={this.state.finDialogVisible}
          message={this.state.getCoin + "コインを獲得しました"}
          handleClose={() => {
            // 記事照会画面に戻る
            this.props.navigation.navigate("ArticleRefer", {
              mode: this.state.mode,
              selectCategory: this.state.selectCategory,
            });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  saveButtonView: {
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "rgba(255, 136, 0, 0.92)",
    flexDirection: "row",
  },
  saveButtonTitleView: {
    flex: 8,
    alignItems: "center",
  },
  saveButtonTitleText: {
    fontSize: 26,
    color: "white",
    padding: 10,
  },
  selectButtonView: {
    borderRadius: 20,
    // alignItems: 'center',
    // marginTop: 30,
    // marginLeft: 10,
    // marginRight: 10,
    width: 100,
    backgroundColor: "#FFB300",
    // flexDirection: 'row'
  },
  selectButtonTitleView: {
    // flex: 1,
    alignItems: "center",
  },
  selectButtonTitleText: {
    fontSize: 16,
    color: "white",
    padding: 10,
  },
  dateTimeText: {
    fontSize: 14,
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
    backgroundColor: "white",
    borderWidth: 1,
  },
  spinnerTextStyle: {
    color: "#FFF",
    fontSize: 18,
  },
});
