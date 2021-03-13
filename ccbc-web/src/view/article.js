import React from "react";
import request from "superagent";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import MenuItem from "@material-ui/core/MenuItem";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import {
  comKanriListItems,
  systemName,
  restUrl,
  titleItems2,
} from "./tileData";
import Avatar from "@material-ui/core/Avatar";
import Linkify from "react-linkify";
import moment from "moment";
import "moment/locale/ja";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import Search from "@material-ui/icons/Search";
import EditIcon from "@material-ui/icons/Edit";
import NoteAdd from "@material-ui/icons/NoteAdd";
import Star from "@material-ui/icons/Star";

import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const restdomain = require("../common/constans.js").restdomain;

const drawerWidth = 240;

const CHAR_LEN_TITLE = 30;
const CHAR_LEN_HASHTAG = 10;
const CHAR_LEN_CONTENTS = 1000;
const HASHTAG_UPPER_LIMIT = 3;

const IMAGE_MAX_WIDTH = 250;

const goodImageOn = "/images/good-on.png";
const goodImageOff = "/images/good-off.png";

class ArticleForm extends React.Component {
  state = {
    // メニュー制御
    open: false,
    open2: false,
    anchor: "left",

    // ログイン情報
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    tokenId: null,

    // 記事カテゴリ情報
    categoryList: [],
    current_kiji_category_pk: "",
    currentCategory: null,
    getCoin: 0,
    speCategoryFlg: false,

    // 記事リスト情報
    articleList: [],
    readLastKijiPk: "",

    // 記事リスト制御
    favorite_flg: "0",
    good_flg: "0",

    // 記事投稿情報
    t_kiji_category_pk: null,
    t_kiji_pk: "",
    title: "",
    contents: "",
    post_dt: "",
    post_tm: "",
    file_path: "",
    hashtag_str: "",
    srcImageUrl: "",
    selectFile: null,
    srcImageEdit: null,
    crop: {},
    blob: null,

    // 記事投稿制御
    openEntryDialog: false,
    confirmDialogVisible: false,
    confirmDialogMessage: "",
    alertDialogVisible: false,
    alertDialogMessage: "",
    alertDialogTitle: "",
    loadFlg: false,

    // 検索条件制御
    openSearchDialog: false,

    // 検索条件情報
    searchCondKijiPk: "",
    searchCondYear: "",
    searchCondKeyword: "",
    searchCondHashtag: "",
  };

  constructor(props) {
    super(props);
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    var loginInfos = JSON.parse(sessionStorage.getItem("loginInfo"));
    for (var i in loginInfos) {
      var loginInfo = loginInfos[i];
      this.setState({ userid: loginInfo["userid"] });
      this.setState({ password: loginInfo["password"] });
      this.setState({ loginShainPk: loginInfo["tShainPk"] });
      this.state.loginShainPk = Number(loginInfo["tShainPk"]);
      this.setState({ imageFileName: loginInfo["imageFileName"] });
      this.setState({ shimei: loginInfo["shimei"] });
      this.setState({ kengenCd: loginInfo["kengenCd"] });
      this.setState({ tokenId: loginInfo["tokenId"] });
      this.setState({ bcAccount: loginInfo["bc_account"] });
      if (loginInfo["kengenCd"] === "0") {
        this.setState({ jimuFlg: true });
      }
    }

    // 記事API.記事カテゴリ一覧取得処理の呼び出し
    request
      .post(restdomain + "/article/findCategory")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        var resList = res.body.data;
        this.setState({ categoryList: resList });
      });
  }

  /** 入力コントロール */
  handleInputChange(e) {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  /** -- ↓ 共通 ↓　-- */
  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleLogoutClick = () => {
    // ログアウト時にsessionStorageをクリアする
    sessionStorage.clear();
  };

  handleToggle = () => {
    this.setState({ open2: !this.state.open2 });
  };

  handleToggleClose = (event) => {
    if (this.target1.contains(event.target)) {
      return;
    }
    this.setState({ open2: false });
  };
  /** -- ↑ 共通 ↑　-- */

  /** -- 記事投稿ダイアログ -- */
  handleOpenEntry = () => {
    this.setState({
      openEntryDialog: true,
      t_kiji_pk: "",
      title: "",
      contents: "",
      file_path: "",
      hashtag_str: "",
      srcImageUrl: "",
      selectFile: null,
      srcImageEdit: null,
      crop: {
        unit: "%",
        width: 100,
        aspect: 4 / 3,
      },
    });
  };

  handleOpenEntryEdit = (index) => {
    var wkList = this.state.articleList[index];
    this.setState({
      openEntryDialog: true,
      t_kiji_pk: wkList.t_kiji_pk,
      title: wkList.title,
      contents: wkList.contents,
      file_path: wkList.file_path,
      hashtag_str: wkList.hashtag_str.replace(/#/g, ""),
      srcImageUrl: "",
      selectFile: null,
      srcImageEdit: null,
      crop: {
        unit: "%",
        width: 100,
        aspect: 4 / 3,
      },
    });
  };

  handleCloseEntry = () => {
    this.setState({ openEntryDialog: false });
  };

  handleDeleteImage = () => {
    this.setState({ srcImageUrl: null, srcImageEdit: null, file_path: "" });
    this.imageRef = null;
  };

  /** 画像選択 */
  handleSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        this.setState({ srcImageEdit: reader.result })
      );
      reader.readAsDataURL(e.target.files[0]);
      this.setState({ selectFile: e.target.files[0] });
      console.log(e.target.files[0]);
      e.target.value = "";
    }
  };

  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  onCropComplete = (crop) => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    this.setState({ crop });
  };

  makeClientCrop = async (crop) => {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile.png"
      );
      this.setState({ srcImageUrl: croppedImageUrl });
    }
  };

  getCroppedImg = async (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
        this.setState({ blob: blob });
      }, "image/*");
    });
  };

  /** 記事投稿ボタン押下 */
  handleEntry = async () => {
    // 入力チェック
    var alertMessage = "";
    if (this.state.title == "") {
      alertMessage += "タイトルを入力してください\n";
    }
    if (this.state.contents == "") {
      alertMessage += "記事の内容を入力してください\n";
    }
    let lenTitle = this.strLength(this.state.title);
    if (lenTitle > CHAR_LEN_TITLE) {
      alertMessage +=
        "タイトルの文字数が超過しています" + "（" + lenTitle + "文字）\n";
    }
    var hashes = this.state.hashtag_str
      .replace("　", " ")
      .replace("　", " ")
      .split(" ");
    if (hashes.length > HASHTAG_UPPER_LIMIT) {
      alertMessage += "タグの数は" + HASHTAG_UPPER_LIMIT + "つまでです\n";
    } else {
      for (var i = 0; i < hashes.length; i++) {
        let lenHashes = this.strLength(hashes[i]);
        if (lenHashes > CHAR_LEN_HASHTAG) {
          alertMessage +=
            "タグの文字数が超過しています" + "（" + lenHashes + "文字）\n";
        }
      }
    }
    let lenContents = this.strLength(this.state.contents);
    if (lenContents > CHAR_LEN_CONTENTS) {
      alertMessage +=
        "記事の文字数が超過しています" + "（" + lenContents + "文字）\n";
    }
    if (alertMessage !== "") {
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage,
        alertDialogTitle: "エラーメッセージ",
      });
      return;
    }

    // 確認ダイアログを表示（YESの場合、entry()を実行）
    this.setState({
      confirmDialogVisible: true,
      confirmDialogMessage: "記事を投稿します。よろしいですか？",
    });
  };

  /** 記事更新処理 */
  entry = async () => {
    this.setState({ loadFlg: true });
    this.setState({ confirmDialogVisible: false });

    if (this.state.srcImageUrl) {
      // 画像ファイルのアップロードがある場合
      const fileName =
        moment(new Date()).format("YYYYMMDDHHmmssSS") + "." + "png";
      let data = new FormData();
      var wkBlob = this.state.blob;
      wkBlob.name = fileName;
      data.append("image", wkBlob, fileName);
      console.log(wkBlob);

      request
        .post(restdomain + "/article/upload")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log("Error:", err);
            alert("画像ファイルのアップロードに失敗しました");
            this.setState({ loadFlg: false });
            return;
          }
          if (res.status) {
            // 記事API.投稿処理の呼び出し（DB登録→BC登録）
            this.edit(fileName);
          } else {
            alert("画像ファイルのアップロードに失敗しました");
            this.setState({ loadFlg: false });
          }
        });
    } else {
      // 記事API.投稿処理の呼び出し（DB登録→BC登録）
      this.edit(this.state.file_path);
    }
  };

  /** データ更新処理 */
  edit = async (fileName) => {
    this.state.file_path = fileName;

    request
      .post(restdomain + "/article/edit")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          alert("投稿処理でエラーが発生しました");
          this.setState({ loadFlg: false });
          return;
        }
        if (this.state.t_kiji_pk === "") {
          // 新規投稿の場合は、コイン獲得のメッセージを表示してから記事照会画面に戻る
          this.setState({
            alertDialogVisible: true,
            alertDialogMessage: this.state.getCoin + "コインを獲得しました",
            alertDialogTitle: "",
          });
        }

        // 記事リスト取得
        this.readArticle();
        this.setState({ openEntryDialog: false });
        this.setState({ loadFlg: false });
      });
  };

  /** -- 検索ダイアログ -- */
  handleOpenSearch = () => {
    this.setState({ openSearchDialog: true });
  };

  handleSearch = async () => {
    this.setState({
      openSearchDialog: false,
      readLastKijiPk: "",
    });
    this.state.readLastKijiPk = "";

    // 記事リスト取得（条件付与）
    this.readArticle();
  };

  handleClearSearch = async () => {
    // 検索条件のクリア
    this.setState({
      openSearchDialog: false,
      searchCondYear: "",
      searchCondKeyword: "",
      searchCondHashtag: "",
      readLastKijiPk: "",
    });
    this.state.searchCondYear = "";
    this.state.searchCondKeyword = "";
    this.state.searchCondHashtag = "";
    this.state.readLastKijiPk = "";

    // 記事リスト取得
    this.readArticle();
  };

  handleCloseSearch = () => {
    this.setState({ openSearchDialog: false });
  };

  /** 記事カテゴリ選択 */
  handleSelectCategory = (category) => () => {
    // 選択した記事カテゴリ情報をstateにセット
    this.setState({
      current_kiji_category_pk: category.t_kiji_category_pk,
      t_kiji_category_pk: category.t_kiji_category_pk,
      currentCategory: category,
      getCoin: category.get_coin,
    });
    this.state.current_kiji_category_pk = category.t_kiji_category_pk;
    if (category.spe_category_flg === "1") {
      this.setState({ speCategoryFlg: true });
    } else {
      this.setState({ speCategoryFlg: false });
    }

    // 記事リスト取得
    this.readArticle();
  };

  /** いいねボタン押下 */
  handleGood = (index) => {
    // stateの内容を書き換え
    var wkList = this.state.articleList;
    var selectArticle = wkList[index];
    selectArticle.good_flg = selectArticle.good_flg == "0" ? "1" : "0";
    wkList[index] = selectArticle;
    this.setState({
      articleList: wkList,
      t_kiji_pk: selectArticle.t_kiji_pk,
      good_flg: selectArticle.good_flg,
    });
    this.state.t_kiji_pk = selectArticle.t_kiji_pk;
    this.state.good_flg = selectArticle.good_flg;

    // 記事API.いいね処理の呼び出し（DB登録）
    request
      .post(restdomain + "/article/good")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
        }
      });
  };

  /** お気に入りボタン押下 */
  handleFavorite = (index) => {
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
    request
      .post(restdomain + "/article/favorite")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
        }
      });
  };

  /** 記事リスト取得 */
  readArticle = async () => {
    // 記事API.記事リスト取得処理の呼び出し
    request
      .post(restdomain + "/article/findArticle")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        var resList = res.body.data;
        this.setState({ articleList: resList });

        request
          .post(restdomain + "/article/findCategory")
          .send(this.state)
          .end((err, res) => {
            if (err) {
              console.log("Error:", err);
              return;
            }
            var resList = res.body.data;
            this.setState({ categoryList: resList });
          });
      });
  };

  strLength = (str) => {
    var length = 0;
    for (var i = 0; i <= str.length; i++) {
      var ch = str.charCodeAt(i);
      if (ch < 0xdc00 || 0xdfff < ch) {
        length++;
      }
    }
    return length;
  };

  nl2br = (text) => {
    var regex = /(\n)/g;
    return text.split(regex).map(function (line) {
      if (line.match(regex)) {
        return React.createElement("br");
      } else {
        return line;
      }
    });
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;

    const drawer = (
      <Drawer
        variant="persistent"
        anchor={anchor}
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>{comKanriListItems()}</List>
      </Drawer>
    );

    let before = null;
    let after = null;

    if (anchor === "left") {
      before = drawer;
    } else {
      after = drawer;
    }

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          {/* --- ヘッダ共通 --- */}
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-${anchor}`]]: open,
            })}
            classes={{ colorPrimary: this.props.classes.appBarColorDefault }}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              {titleItems2}
              <Manager>
                <Target>
                  <div
                    ref={(node) => {
                      this.target1 = node;
                    }}
                  >
                    <Chip
                      avatar={
                        <Avatar
                          src={restUrl + `uploads/${this.state.imageFileName}`}
                        />
                      }
                      label={this.state.shimei}
                      className={classes.chip}
                      aria-label="More"
                      aria-haspopup="true"
                      onClick={this.handleToggle}
                      className={classNames(
                        !open && classes.buttonFrame,
                        open && classes.buttonFrame2
                      )}
                      style={{ fontSize: "100%" }}
                    />
                  </div>
                </Target>
                <Popper
                  placement="bottom-start"
                  eventsEnabled={open2}
                  className={classNames({ [classes.popperClose]: !open2 })}
                >
                  <Grow
                    in={open2}
                    id="menu-list-grow"
                    style={{ transformOrigin: "0 0 0" }}
                  >
                    <Paper>
                      <MenuList role="menu">
                        <MenuItem
                          onClick={this.handleLogoutClick}
                          component={loginLink}
                        >
                          Logout
                        </MenuItem>
                      </MenuList>
                    </Paper>
                  </Grow>
                </Popper>
              </Manager>
            </Toolbar>
          </AppBar>
          {before}
          <main
            className={classNames(
              classes.content,
              classes[`content-${anchor}`],
              {
                [classes.contentShift]: open,
                [classes[`contentShift-${anchor}`]]: open,
              }
            )}
          >
            <div className={classes.drawerHeader} />

            {/* -- メイン -- */}
            <div className={classes.categoryTable}>
              <List component="nav" aria-label="mailbox folders">
                {this.state.categoryList.map((item, i) => (
                  <ListItem
                    button
                    divider
                    onClick={this.handleSelectCategory(item)}
                    key={i}
                  >
                    <ListItemText primary={item.category_nm} />
                    <ListItemSecondaryAction>
                      {item.midoku_cnt !== "0" && (
                        <div
                          style={{
                            textAlign: "center",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            backgroundColor: "#FF3333",
                            color: "white",
                            fontSize: 12,
                          }}
                        >
                          <span>{item.midoku_cnt}</span>
                        </div>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </div>

            <div className={classes.articleTable}>
              <div className={classes.articleHeaderTable}>
                <div style={{ float: "left" }}>
                  <span> </span>
                </div>
                {this.state.currentCategory !== null && (
                  <div style={{ verticalAlign: "middle" }}>
                    <div style={{ float: "center" }}>
                      <span style={{ fontWeight: "bold", fontSize: 24 }}>
                        {this.state.currentCategory.category_nm}
                      </span>
                    </div>
                    <div style={{ float: "right" }}>
                      <Button
                        onClick={this.handleOpenSearch}
                        variant="raised"
                        color="default"
                        // size="large"
                        className={classes.button2}
                      >
                        <Search className={classes.extendedIcon} />
                        検索
                      </Button>
                      {"　 "}
                      {!this.state.speCategoryFlg && (
                        <Button
                          onClick={this.handleOpenEntry}
                          variant="raised"
                          color="default"
                          // size="large"
                          className={classes.button2}
                        >
                          <NoteAdd className={classes.extendedIcon} />
                          投稿
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {this.state.currentCategory === null && (
                  <div style={{ float: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: 24 }}>
                      {"記事のカテゴリを選択してください"}
                    </span>
                  </div>
                )}
              </div>

              <div className={classes.articleCardTable}>
                {this.state.articleList.map((item, i) => (
                  <Card className={classes.articleCard} key={i}>
                    <div>
                      {/* Header */}
                      <div>
                        {/* 投稿日時・顔写真 */}
                        <div style={{ float: "left", paddingRight: 50 }}>
                          <div
                            style={{ textAlign: "center", paddingBottom: 10 }}
                          >
                            <span style={{ color: "gray", fontSize: 12 }}>
                              {moment(new Date(item.post_dt)).format(
                                "YYYY/MM/DD"
                              )}
                              <br />
                              {moment(item.post_tm, "HH:mm:ss").format("H:mm")}
                            </span>
                          </div>
                          <div style={{ align: "center", paddingLeft: 10 }}>
                            <Avatar
                              src={
                                restdomain + `/uploads/${item.shain_image_path}`
                              }
                              style={{ width: 50, height: 50 }}
                            />
                          </div>
                        </div>
                        {/* 名前・タイトル・ハッシュタグ */}
                        <div style={{ float: "left" }}>
                          <div style={{ paddingBottom: 10 }}>
                            <span style={{ fontSize: 20 }}>
                              {item.shain_nm}
                            </span>
                          </div>
                          <div>
                            <span
                              style={{
                                color: "blue",
                                fontSize: 20,
                                fontWeight: "bold",
                              }}
                            >
                              {item.title}
                            </span>
                          </div>
                          <div>
                            <span
                              style={{
                                color: "blue",
                                fontSize: 14,
                                paddingLeft: 10,
                              }}
                            >
                              {item.hashtag_str}
                            </span>
                          </div>
                        </div>
                        {/* 各種アイコン */}
                        <div style={{ float: "right", align: "right" }}>
                          {/* 記事編集（自分が投稿した記事のみアイコンを表示） */}
                          <div style={{ float: "left", paddingRight: 10 }}>
                            {(() => {
                              if (item.t_shain_pk == this.state.loginShainPk) {
                                return (
                                  <EditIcon
                                    style={{ fontSize: 40, cursor: "pointer" }}
                                    onClick={this.handleOpenEntryEdit.bind(
                                      this,
                                      i
                                    )}
                                  />
                                );
                              }
                            })()}
                          </div>
                          {/* いいね */}
                          <div style={{ float: "left", paddingRight: 10 }}>
                            {(() => {
                              const goodImageSrc =
                                item.good_flg === "0"
                                  ? goodImageOff
                                  : goodImageOn;
                              return (
                                <div>
                                  <img
                                    src={goodImageSrc}
                                    width="35"
                                    height="35"
                                    style={{ cursor: "pointer" }}
                                    onClick={this.handleGood.bind(this, i)}
                                  />
                                </div>
                              );
                            })()}
                            {item.good_flg === "1" && (
                              <div style={{ marginTop: -10 }}>
                                <span
                                  style={{
                                    color: "red",
                                    fontSize: 12,
                                    marginTop: -30,
                                    paddingTop: -10,
                                  }}
                                >
                                  {"いいね"}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* お気に入り */}
                          <div style={{ float: "left" }}>
                            {(() => {
                              const favoriteColor =
                                item.favorite_flg === "0" ? "gray" : "orange";
                              return (
                                <Star
                                  style={{
                                    fontSize: 40,
                                    color: favoriteColor,
                                    cursor: "pointer",
                                  }}
                                  onClick={this.handleFavorite.bind(this, i)}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      {/* Detail */}
                      <div style={{ paddingTop: 30, clear: "both" }}>
                        <span
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                        >
                          <Linkify properties={{ target: "_blank" }}>
                            {item.contents}
                          </Linkify>
                        </span>
                      </div>
                      {/* Image */}
                      <div style={{ paddingTop: 30 }}>
                        {item.file_path !== "" && item.file_path !== null && (
                          <img
                            src={
                              restdomain + `/uploads/article/${item.file_path}`
                            }
                            align="top"
                            width="auto"
                            height="300"
                            style={{ maxWidth: "90%" }}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* -- 検索ダイアログ -- */}
            <Dialog
              open={this.state.openSearchDialog}
              onClose={this.handleCloseSearch}
              aria-labelledby="form-dialog-title"
              fullWidth={true}
              onBackdropClick="false"
            >
              <DialogTitle id="form-dialog-title">記事検索</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="normal"
                  id="searchCondYear"
                  name="searchCondYear"
                  type="number"
                  inputProps={{
                    min: 2000,
                    max: 2100,
                    width: 500,
                  }}
                  label={`投稿年`}
                  value={this.state.searchCondYear}
                  onChange={this.handleInputChange.bind(this)}
                />
                <TextField
                  id="searchCondKeyword"
                  name="searchCondKeyword"
                  margin="normal"
                  fullWidth
                  label={`検索キーワード（スペース区切りで複数条件可）`}
                  value={this.state.searchCondKeyword}
                  onChange={this.handleInputChange.bind(this)}
                />
                <TextField
                  id="searchCondHashtag"
                  name="searchCondHashtag"
                  margin="normal"
                  fullWidth
                  label={`タグ（スペース区切りで複数条件可）`}
                  value={this.state.searchCondHashtag}
                  onChange={this.handleInputChange.bind(this)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleSearch.bind(this)} color="primary">
                  検索
                </Button>
                <Button
                  onClick={this.handleClearSearch.bind(this)}
                  color="secondary"
                >
                  検索条件クリア
                </Button>
                <Button onClick={this.handleCloseSearch} color="">
                  キャンセル
                </Button>
              </DialogActions>
            </Dialog>

            {/* -- 記事投稿ダイアログ -- */}
            <Dialog
              open={this.state.openEntryDialog}
              onClose={this.handleCloseEntry}
              aria-labelledby="form-dialog-title"
              fullWidth={true}
              maxWidth="md"
              onBackdropClick="false"
            >
              <DialogTitle id="form-dialog-title">記事投稿</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="normal"
                  id="title"
                  name="title"
                  label={`タイトル（${CHAR_LEN_TITLE}文字以内）`}
                  fullWidth
                  value={this.state.title}
                  onChange={this.handleInputChange.bind(this)}
                />
                <TextField
                  id="hashtag_str"
                  name="hashtag_str"
                  margin="normal"
                  label={`タグ（1タグ${CHAR_LEN_HASHTAG}文字以内、スペース区切りで${HASHTAG_UPPER_LIMIT}つまで #は不要）`}
                  fullWidth
                  value={this.state.hashtag_str}
                  onChange={this.handleInputChange.bind(this)}
                />
                <TextField
                  id="contents"
                  name="contents"
                  margin="normal"
                  label={`記事（${CHAR_LEN_CONTENTS}文字以内）`}
                  multiline
                  rows="10"
                  fullWidth
                  value={this.state.contents}
                  onChange={this.handleInputChange.bind(this)}
                />
                <Button color="primary" style={{ marginTop: 20 }}>
                  画像選択
                  <input
                    type="file"
                    accept="image/*"
                    className={classes.inputFileBtnHide}
                    onChange={this.handleSelectFile}
                  />
                </Button>
                <Button
                  onClick={this.handleDeleteImage}
                  color="secondary"
                  style={{ marginTop: 20 }}
                >
                  画像削除
                </Button>
                <div style={{ verticalAlign: "top" }}>
                  <br />
                  <div style={{ width: 350, float: "left", padding: 10 }}>
                    {this.state.file_path !== "" && !this.state.srcImageUrl && (
                      <img
                        style={{
                          maxWidth: "90%",
                          border: "solid",
                          borderColor: "lightgray",
                          width: 300,
                        }}
                        src={
                          restdomain +
                          `/uploads/article/${this.state.file_path}`
                        }
                      />
                    )}
                    {this.state.srcImageUrl && (
                      <img
                        style={{
                          maxWidth: "90%",
                          border: "solid",
                          borderColor: "lightgray",
                          width: 300,
                        }}
                        src={this.state.srcImageUrl}
                      />
                    )}
                  </div>
                  <div style={{ float: "left", padding: 10 }}>
                    {this.state.srcImageEdit && (
                      <ReactCrop
                        src={this.state.srcImageEdit}
                        crop={this.state.crop}
                        style={{ maxWidth: "90%" }}
                        ruleOfThirds
                        onImageLoaded={this.onImageLoaded}
                        onComplete={this.onCropComplete}
                        onChange={this.onCropChange}
                      />
                    )}
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleEntry}
                  disabled={this.state.loadFlg}
                  color="primary"
                >
                  投稿する
                </Button>
                <Button
                  onClick={this.handleCloseEntry}
                  disabled={this.state.loadFlg}
                  color=""
                >
                  キャンセル
                </Button>
              </DialogActions>
            </Dialog>

            {/* 警告ダイアログ */}
            <Dialog
              open={this.state.alertDialogVisible}
              onClose={() => {
                this.setState({ alertDialogVisible: false });
              }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {this.state.alertDialogTitle}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {this.nl2br(this.state.alertDialogMessage)}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ alertDialogVisible: false });
                  }}
                  color="primary"
                  autoFocus
                >
                  {"OK"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* 確認ダイアログ */}
            <Dialog
              open={this.state.confirmDialogVisible}
              onClose={() => {
                this.setState({ confirmDialogVisible: false });
              }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              disableBackdropClick={true}
            >
              <DialogTitle id="alert-dialog-title">
                {"確認メッセージ"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {this.state.confirmDialogMessage}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.entry} color="primary" autoFocus>
                  はい
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ confirmDialogVisible: false });
                  }}
                  color="primary"
                >
                  いいえ
                </Button>
              </DialogActions>
            </Dialog>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    overflow: "hidden",
  },
  appFrame: {
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    width: "100%",
  },
  buttonFrame: {
    position: "static",
    marginRight: 24,
  },
  buttonFrame2: {
    position: "static",
    marginRight: 0,
  },
  appBar: {
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "appBarShift-left": {
    marginLeft: drawerWidth,
  },
  "appBarShift-right": {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: "none",
  },
  drawerPaper: {
    position: "relative",
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  "content-left": {
    marginLeft: -drawerWidth,
  },
  "content-right": {
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "contentShift-left": {
    marginLeft: 0,
  },
  "contentShift-right": {
    marginRight: 0,
  },
  image: {
    position: "relative",
    height: 200,
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100,
    },
    "&:hover, &$focusVisible": {
      zIndex: 1,
      "& $imageBackdrop": {
        opacity: 0.15,
      },
      "& $imageMarked": {
        opacity: 0,
      },
      "& $imageTitle": {
        border: "4px solid currentColor",
      },
    },
  },
  focusVisible: {},
  imageButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
  },
  imageSrc: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center 40%",
  },
  imageBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  },
  imageTitle: {
    position: "relative",
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px ${
      theme.spacing.unit + 6
    }px`,
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  },
  card2: {
    display: "flex",
  },
  details2: {
    display: "flex",
    flexDirection: "column",
  },
  details3: {
    display: "table-cell",
    verticalAlign: "middle",
  },
  content2: {
    flex: "1 0 auto",
  },
  cover2: {
    width: 151,
    height: 151,
  },
  controls2: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  stepSize: {
    width: 20,
    height: 10,
    textAlign: "left",
    verticalAlign: "top",
  },
  stepSize2: {
    width: 15,
    height: 5,
    textAlign: "left",
    verticalAlign: "top",
  },
  tdSize: {
    textAlign: "left",
    verticalAlign: "bottom",
    paddingBottom: "7px",
  },
  input: {
    margin: theme.spacing.unit,
  },
  avatarRow: {
    display: "flex",
    justifyContent: "center",
  },
  avatar: {
    margin: 10,
  },
  bigAvatar: {
    width: 150,
    height: 150,
  },
  headLine: {
    width: 350,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 900,
  },
  paper: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
  },
  table: {
    minWidth: 700,
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default,
    },
  },
  addToPaper: {
    marginTop: 10,
    marginLeft: 650,
    fontSize: 18,
  },
  InputLabel: {
    whiteSpace: "nowrap",
  },
  select: {
    width: 140,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  coinInfoTable: {
    width: 500,
  },
  appBarColorDefault: {
    backgroundColor: "rgba(255, 136, 0, 0.92)",
  },
  categoryTable: {
    width: "20%",
    float: "left",
    // position: "absolute"
  },
  articleTable: {
    width: "80%",
    float: "left",
  },
  articleHeaderTable: {
    textAlign: "center",
    marginBottom: 20,
  },
  articleCardTable: {
    width: "98%",
    marginLeft: 50,
    // overflowY: "scroll",
    overflowX: "hidden",
  },
  articleCard: {
    padding: 40,
    marginBottom: 20,
    marginRight: 10,
  },
  inputFileBtnHide: {
    opacity: 0,
    appearance: "none",
    position: "absolute",
  },
});

ArticleForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ArticleForm);
