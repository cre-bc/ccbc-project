import React, { useRef, useEffect } from "react";
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
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
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
  restUrl,
  titleItems2,
} from "./tileData";
import Avatar from "@material-ui/core/Avatar";
import moment from "moment";
import "moment/locale/ja";
import { MessageList } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { Input as ChatInput } from 'react-chat-elements'
import { Button as ChatButton } from 'react-chat-elements'
import { SideBar } from 'react-chat-elements'
import { Navbar } from 'react-chat-elements'
import { ChatList } from 'react-chat-elements'

import "react-image-crop/dist/ReactCrop.css";

import ImageIcon from "@material-ui/icons/Image";

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
import { FormLabel } from "@material-ui/core";
import io from "socket.io-client";

const restdomain = require("../common/constans.js").restdomain;
const restdomain_ws = require("../common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

const drawerWidth = 240;

class ChatForm extends React.Component {
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

    // チャット一覧情報
    chatList: [],
    fromShainPk: null,
    fromUserNm: "",
    fromExpoPushToken: "",
    isGroup: false,
    chatGroupNm: "",

    // 画面制御情報
    alertDialogVisible: false,
    alertDialogMessage: "",
    alertDialogTitle: "",
    loadFlg: false,

    // コイン送付画面
    openCoinSend: false,
    coinList: [
      { label: "10コイン（ありがとう!）", value: 10 },
      { label: "20コイン（うれしい!!）", value: 20 },
      { label: "30コイン（感激!!!）", value: 30 },
    ],
    shoninList: [],
    bccoin: 0,
    displayCoin: "",
    from_bcaccount: "",
    sofuCoin: 0,
    zoyoComment: "",
    comment: "",
    target_manager: "",
    shoninCd: "",

    // グループチャットプッシュ送信画面
    openGroupPush: false,

    // チャット欄
    chatMessageList: [],
    message: "",
    filePath: "",
    messages: [],
    limitDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
  };

  constructor(props) {
    super(props);
    this.scrollBottomRef = React.createRef();
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

    // websocket切断
    if (socket.connected) {
      socket.close();
      socket.disconnect();
    }

    // websocket接続
    socket.connect();

    // チャットルーム（自分の社員PK）に接続（チャット対象一覧未選択時に受信した際、一覧を再表示するため）
    socket.emit("join", this.state.loginShainPk);

    // 受信時処理
    socket.off("comcomcoin_chat");
    socket.on(
      "comcomcoin_chat",
      function (message) {
        console.log("comcomcoin_chat get message", message);

        if (this.state.fromUserNm === "") {
          // チャット対象一覧表示
          this.showChatList(false);
        } else {
          // チャット既読更新
          this.updateKidokuChat();
        }

        console.log("comcomcoin_chat get message 1");

        // 現在開いているチャット相手からのメッセージの場合に受信処理を行う
        var isDispChat = false;
        var shimei = "";

        if (this.state.isGroup
          && Number(JSON.parse(message).chatGroupPk) === Number(this.state.chatGroupPk)) {
          // グループチャットの場合
          if (Number(JSON.parse(message).to_shain_pk) !== Number(this.state.loginShainPk)
            || (JSON.parse(message).chat_kbn === "APP-GRP"
              && Number(JSON.parse(message).to_shain_pk) === Number(this.state.loginShainPk))) {
            // 他の人から、もしくは、アプリから自分が送信した場合、表示対象
            isDispChat = true;
            if (Number(JSON.parse(message).to_shain_pk) !== Number(this.state.loginShainPk)) {
              shimei = this.getShainName(JSON.parse(message).to_shain_pk);
            } else {
              shimei = this.state.shimei;
            }
          }
        }

        if (!this.state.isGroup
          && JSON.parse(message).chat_kbn.match("NML")
          && (Number(JSON.parse(message).to_shain_pk) === Number(this.state.fromShainPk)
            || (JSON.parse(message).chat_kbn === "APP-NML"
              && Number(JSON.parse(message).to_shain_pk) === Number(this.state.loginShainPk)
              && Number(JSON.parse(message).chat_shain_pk) === Number(this.state.fromShainPk)))) {
          // 相手から、もしくは、アプリから自分が送信した場合、表示対象
          isDispChat = true;
        }

        console.log("comcomcoin_chat get message 2");
        console.log("comcomcoin_chat get message 2", this.state.loginShainPk, this.state.fromShainPk);

        if (isDispChat) {
          var wk = this.state.messages;
          var pos = 'left';
          if (Number(JSON.parse(message).to_shain_pk) === Number(this.state.loginShainPk)) {
            pos = 'right';
          }
          if (JSON.parse(message).image != null) {
            // 画像受信
            var data = {
              uri: JSON.parse(message).image,
              status: {
                click: false,
                loading: 0,
                download: true,
              },
              width: "500px",
              height: "500px",
            };
            var wk = this.state.messages;
            wk.push({
              position: pos,
              type: 'photo',
              text: "",
              data: data,
              dateString: moment(new Date()).format("YYYY/MM/DD HH:mm")
            })
          } else {
            // メッセージ受信
            wk.push({
              title: shimei,
              position: pos,
              type: 'text',
              text: JSON.parse(message).text,
              dateString: moment(new Date()).format("YYYY/MM/DD HH:mm")
            })
          }
          this.setState({ messages: wk });
          this.executeScroll();

          console.log("comcomcoin_chat get message 3");
        }
      }.bind(this)
    );

    // チャット対象一覧表示
    this.showChatList(true);
  }

  getShainName(t_shain_pk) {
    for (var i in this.state.chatList) {
      if (this.state.chatList[i].t_shain_pk == t_shain_pk) {
        return this.state.chatList[i].shimei;
      }
    }
    return "";
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


  /** チャット対象選択 */
  handleSelectUsers = (item) => () => {
    // 選択したチャット対象情報をstateにセット
    if (item.t_chat_group_pk > 0) {
      // グループチャット
      this.setState({
        isGroup: true,
        chatGroupPk: item.t_chat_group_pk,
        fromUserNm: item.chat_group_nm,
        chatGroupNm: item.chat_group_nm,
      });
      this.state.chatGroupPk = item.t_chat_group_pk;
      this.state.isGroup = true;
    } else {
      // 個別チャット
      this.setState({
        isGroup: false,
        chatGroupPk: 0,
        fromShainPk: item.t_shain_pk,
        fromUserNm: item.shimei,
        fromExpoPushToken: item.expo_push_token,
      });
      this.state.fromShainPk = item.t_shain_pk;
      this.state.isGroup = false;
    }

    // チャット既読更新
    this.updateKidokuChat();

    this.setState({ limitDate: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()) });

    // チャットメッセージリスト取得
    this.readChatMessage();
  };

  /** チャット既読更新 */
  updateKidokuChat = async () => {
    // チャットAPI.チャット既読更新処理の呼び出し
    var restUrl = "/chat_msg/kidoku_update";
    if (this.state.isGroup) {
      restUrl = "/group_chat_msg/kidoku_update";
    }
    request
      .post(restdomain + restUrl)
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }

        // チャット対象一覧表示
        this.showChatList(false);
      });
  }

  /** チャット対象一覧表示 */
  showChatList = async (isSocketJoin) => {
    // チャットAPI.チャット対象一覧取得処理の呼び出し
    request
      .post(restdomain + "/chat_select/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        var resList = res.body.data;
        this.setState({ chatList: resList });

        // チャットルーム（グループPK）に接続
        if (isSocketJoin) {
          for (var i in resList) {
            if (resList[i].t_chat_group_pk > 0) {
              socket.emit("join", resList[i].t_chat_group_pk);
            }
          }
        }
      });
  }

  /** チャットメッセージリスト取得 */
  readChatMessage = async () => {
    // チャットAPI.チャットメッセージリスト取得処理の呼び出し
    var restUrl = "/chat_msg/find";
    if (this.state.isGroup) {
      restUrl = "/group_chat_msg/find";
    }
    request
      .post(restdomain + restUrl)
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        var resList = res.body.data;
        this.setState({ chatMessageList: resList });
        if (this.state.isGroup) {
          var memberDataList = res.body.memberData;
          this.setState({ resultMemberList: memberDataList });
        }
        this.makeMessageList(resList);
        this.executeScroll();
      });
  };

  /** チャットメッセージリストの作成 */
  makeMessageList = (dataList) => {
    var messages = [];
    var befDate = "";
    for (var i = dataList.length - 1; i >= 0; i--) {
      if (moment(this.state.limitDate).format("YYYYMMDD") > (moment(dataList[i].post_dttm).format("YYYYMMDD"))) {
        continue;
      }

      var position = (dataList[i].from_shain_pk == this.state.loginShainPk ? "right" : "left");
      var type = "text";
      var data = {};
      if (dataList[i].file_path != null && dataList[i].file_path != "") {
        // 画像の場合
        type = "photo";
        data = {
          uri: restUrl + `/uploads/chat/${dataList[i].file_path}`,
          status: {
            click: false,
            loading: 0,
            download: true,
          },
          width: "500px",
          height: "500px",
        };
      }
      // 日付の設定
      var dateString = moment(dataList[i].post_dttm).format("YYYY/MM/DD HH:mm");

      messages.push({
        title: dataList[i].shimei,
        position: position,
        type: type,
        data: data,
        text: dataList[i].comment,
        dateString: dateString
      })
    }
    this.setState({ messages: messages });
  }

  /** チャットメッセージ編集 */
  handleChangeMessage = (e) => {
    this.setState({ message: e.target.value })
  }

  /** チャットメッセージ送信 */
  handleSendMessage = () => {
    if (this.state.message == "" || this.state.message == null) {
      return;
    }
    this.state.filePath = null;

    // チャットAPI.チャットメッセージ送信処理の呼び出し
    var restUrl = "/chat_msg/create";
    if (this.state.isGroup) {
      restUrl = "/group_chat_msg/create";
    }
    request
      .post(restdomain + restUrl)
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        // チャットメッセージの送信
        var message = {}
        if (!this.state.isGroup) {
          message = {
            room_id: this.state.fromShainPk,
            to_shain_pk: this.state.loginShainPk,
            chat_shain_pk: this.state.fromShainPk,
            _id: this.state.userid + "-" + moment(new Date()).format("YYYYMMDDHHmmssSS"),
            text: this.state.message,
            createdAt: new Date(),
            chat_kbn: "WEB-NML",
          };
          socket.emit("comcomcoin_chat", JSON.stringify(message));
          // 自分向けのメッセージ
          message.room_id = this.state.loginShainPk;
          socket.emit("comcomcoin_chat", JSON.stringify(message));
        } else {
          message = {
            room_id: this.state.chatGroupPk,
            to_shain_pk: this.state.loginShainPk,
            _id: this.state.userid + "-" + moment(new Date()).format("YYYYMMDDHHmmssSS"),
            text: this.state.message,
            createdAt: new Date(),
            userid: this.state.userid,
            imageFileName: this.state.imageFileName,
            chatGroupPk: this.state.chatGroupPk,
            chat_kbn: "WEB-GRP",
          };
          socket.emit("comcomcoin_chat", JSON.stringify(message));
        }

        // 表示処理
        var shimei = "";
        if (this.state.isGroup) {
          shimei = this.state.shimei;
        }
        var wk = this.state.messages;
        wk.push({
          title: shimei,
          position: 'right',
          type: 'text',
          text: this.state.message,
          dateString: moment(new Date()).format("YYYY/MM/DD HH:mm")
        })
        this.setState({ messages: wk });
        this.executeScroll();
        this.inputRef.clear();
      });
  };

  /** 画像ファイル送信 */
  handleSelectImageFile = (event) => {
    if (window.confirm("画像を送信しますか？") == false) {
      return
    }

    const files = event.target.files;
    const blob = files[0];

    // 画像ファイル名
    const extension = this.getExtension(blob.name);
    const fileName =
      this.state.userid +
      "_" +
      moment(new Date()).format("YYYYMMDDHHmmssSS") +
      "." +
      extension;

    let data = new FormData();
    data.append("image", blob, fileName);

    console.log("files[0].name : ", blob.name)
    console.log("files[0] : ", blob)
    console.log("fileName : ", fileName)

    // チャットAPI.チャット画像送信処理の呼び出し
    request
      .post(restdomain + "/chat_msg/upload")
      .send(data)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }

        this.state.filePath = fileName;

        // チャットAPI.チャットメッセージ送信処理の呼び出し
        request
          .post(restdomain + "/chat_msg/create")
          .send(this.state)
          .end((err, res) => {
            if (err) {
              console.log("Error:", err);
              return;
            }
            // チャットメッセージの送信
            const message = {
              room_id: this.state.fromShainPk,
              to_shain_pk: this.state.loginShainPk,
              chat_shain_pk: this.state.fromShainPk,
              _id: this.state.userid + "-" + moment(new Date()).format("YYYYMMDDHHmmssSS"),
              createdAt: new Date(),
              image: restdomain + `/uploads/chat/${fileName}`,
              chat_kbn: "WEB-NML",
            };
            socket.emit("comcomcoin_chat", JSON.stringify(message));
            // 自分向けのメッセージ
            message.room_id = this.state.loginShainPk;
            socket.emit("comcomcoin_chat", JSON.stringify(message));

            // 表示処理
            var data = {
              uri: restUrl + `/uploads/chat/${fileName}`,
              status: {
                click: false,
                loading: 0,
                download: true,
              },
              width: "500px",
              height: "500px",
            };
            var wk = this.state.messages;
            wk.push({
              position: 'right',
              type: 'photo',
              text: "",
              data: data,
              dateString: moment(new Date()).format("YYYY/MM/DD HH:mm")
            })
            this.setState({ messages: wk });
            this.executeScroll();
          });
      });
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

  /** チャット欄の最下部へのスクロール */
  executeScroll = () => {
    if (this.scrollBottomRef.current != null) {
      const scroll = this.scrollBottomRef.current.scrollHeight;
      this.scrollBottomRef.current.scrollTop = scroll;
    }
  }

  /** グループチャットプッシュ送信画面表示 */
  openGroupPush = () => {
    this.setState({ openGroupPush: true, comment: "" });
  }

  /** コイン送付画面表示 */
  openCoinSend = () => {
    // チャットAPI.コイン送付用取得処理の呼び出し
    request
      .post(restdomain + "/chat_coin/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        // 検索結果の取得
        var resbccoin = res.body.bccoin;
        // コインを3桁の桁区切りで表記する
        var s = String(resbccoin).split(".");
        var retCoin = String(s[0]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        if (s.length > 1) {
          retCoin += "." + s[1];
        }
        this.setState({ bccoin: resbccoin });
        this.setState({ from_bcaccount: res.body.from_bcaccount });
        this.setState({ shoninList: res.body.shoninList });
        this.setState({ displayCoin: retCoin });

        this.setState({ target_manager: this.state.coinList[0].value });
        this.setState({ shoninCd: this.state.shoninList[0].shonin_cd });

        // ダイアログ表示
        this.setState({ openCoinSend: true });
      });
  }

  /** コイン送付 */
  handleSubmitCoinSend = () => {
    // 入力チェック
    if (this.state.comment == "") {
      window.alert("コメントを入力してください");
      return;
    }

    // コイン数チェック
    if (Number(this.state.target_manager) > Number(this.state.bccoin)) {
      window.alert("コインが不足しています");
      return;
    }

    if (window.confirm("コインを送付します。よろしいですか？") == false) {
      return;
    }

    var coinComment = this.state.target_manager;
    var targetShoninCd = this.state.shoninCd;
    var targetShoninPoint = "";
    var wkShoninMstList = this.state.shoninList;
    // 選択した承認ポイントコード値から名称を取得
    for (var i in wkShoninMstList) {
      if (wkShoninMstList[i].shonin_cd === targetShoninCd) {
        targetShoninPoint = wkShoninMstList[i].shonin_point;
      }
    }
    // 贈与テーブル登録用コメントの生成
    var editZoyoComment = "";
    editZoyoComment =
      "【" +
      coinComment +
      "コイン送付しました】\n" +
      "＜" +
      targetShoninPoint +
      "＞";
    this.state.zoyoComment = editZoyoComment;

    // チャットテーブル登録用コメントの生成
    this.state.sofuCoin = Number(coinComment);
    coinComment =
      "【" +
      coinComment +
      "コイン送付しました】\n " +
      "＜" +
      targetShoninPoint +
      "＞" +
      "\n\n " +
      this.state.comment;
    this.state.comment = coinComment;

    // チャットAPI.コイン送付処理の呼び出し
    request
      .post(restdomain + "/chat_coin/create")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        // チャットメッセージの送信
        const message = {
          room_id: this.state.fromShainPk,
          to_shain_pk: this.state.loginShainPk,
          chat_shain_pk: this.state.fromShainPk,
          _id: this.state.userid + "-" + moment(new Date()).format("YYYYMMDDHHmmssSS"),
          text: this.state.comment,
          createdAt: new Date(),
          chat_kbn: "WEB-NML",
        };
        socket.emit("comcomcoin_chat", JSON.stringify(message));
        // 自分向けのメッセージ
        message.room_id = this.state.loginShainPk;
        socket.emit("comcomcoin_chat", JSON.stringify(message));

        // 表示処理
        var wk = this.state.messages;
        wk.push({
          position: 'right',
          type: 'text',
          text: this.state.comment,
          dateString: moment(new Date()).format("YYYY/MM/DD HH:mm")
        })
        this.setState({ messages: wk });
        this.executeScroll();

        // ダイアログ非表示
        this.setState({ openCoinSend: false });
        // 入力値クリア
        this.setState({ sofuCoin: 0, comment: "", zoyoComment: "", target_manager: "", shoninCd: "" })
      });
  }

  /** グループチャットプッシュ通知送信 */
  handleSubmitGroupPush = () => {
    // 入力チェック
    if (this.state.comment == "") {
      window.alert("コメントを入力してください");
      return;
    }

    if (window.confirm("メッセージを通知します。よろしいですか？") == false) {
      return;
    }

    // チャットAPI.グループチャットプッシュ送信処理の呼び出し
    request
      .post(restdomain + "/group_chat_push/create")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          return;
        }
        // チャットメッセージの送信
        const message = {
          room_id: this.state.chatGroupPk,
          to_shain_pk: this.state.loginShainPk,
          _id: this.state.userid + "-" + moment(new Date()).format("YYYYMMDDHHmmssSS"),
          text: this.state.comment,
          userid: this.state.userid,
          imageFileName: this.state.imageFileName,
          createdAt: new Date(),
          chatGroupPk: this.state.chatGroupPk,
          chat_kbn: "WEB-GRP",
        };
        socket.emit("comcomcoin_chat", JSON.stringify(message));

        // 表示処理
        var wk = this.state.messages;
        wk.push({
          title: this.state.shimei,
          position: 'right',
          type: 'text',
          text: this.state.comment,
          dateString: moment(new Date()).format("YYYY/MM/DD HH:mm")
        })
        this.setState({ messages: wk });
        this.executeScroll();

        // ダイアログ非表示
        this.setState({ openGroupPush: false });
        // 入力値クリア
        this.setState({ comment: "" })
      });
  }

  /** チャット1か月前読み込み */
  handleClickLimitDate = () => {
    var limitDate = this.state.limitDate;
    limitDate = new Date(limitDate.getFullYear() - 1, limitDate.getMonth(), limitDate.getDate());
    console.log("limitDate", limitDate);
    this.setState({ limitDate: limitDate });
    this.state.limitDate = limitDate;
    this.makeMessageList(this.state.chatMessageList);
  }

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
            <div style={{ height: "90%", width: "100%", verticalAlign: "top" }}>
              <div>
                {/* -- チャット画面 -- */}
                <Navbar
                  // チャット対象一覧
                  left={
                    <div style={{ height: "85vh", overflow: "scroll" }}>
                      <List component="nav" aria-label="mailbox folders">
                        {this.state.chatList.map((item, i) => (
                          <div>
                            {(() => {
                              var avatarImage;
                              var chatName;
                              var bkcolor = "#FFFFFF";
                              if (item.t_chat_group_pk == 0 || item.t_chat_group_pk == null) {
                                avatarImage = item.image_file_nm;
                                chatName = item.shimei;
                                if (!this.state.isGroup && this.state.fromShainPk == item.t_shain_pk) {
                                  bkcolor = "#DDDDFF";
                                }
                              } else {
                                avatarImage = item.group_image_file_nm;
                                chatName = item.chat_group_nm;
                                if (this.state.isGroup && this.state.chatGroupPk == item.t_chat_group_pk) {
                                  bkcolor = "#DDDDFF";
                                }
                              }
                              return (
                                <ListItem
                                  button
                                  divider
                                  style={{ backgroundColor: `${bkcolor}` }}
                                  onClick={this.handleSelectUsers(item)}
                                  key={i}
                                >
                                  <ListItemAvatar>
                                    <Avatar
                                      src={restUrl + `uploads/${avatarImage}`}
                                    />
                                  </ListItemAvatar>
                                  <ListItemText primary={chatName} />
                                  <ListItemSecondaryAction>
                                    {item.new_info_cnt !== "0" && (
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
                                        <span>{item.new_info_cnt}</span>
                                      </div>
                                    )}
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )
                            })()}
                          </div>
                        ))}
                      </List>
                    </div>
                  }
                  // チャット欄
                  center={
                    <div>
                      <SideBar
                        type={"light"}
                        // チャット対象
                        top={
                          <div>
                            <div className={classes.articleHeaderTable}>
                              <div style={{ textAlign: "center", width: "800px" }}>

                                {this.state.fromUserNm !== "" && (
                                  <span style={{ fontWeight: "bold", fontSize: 24 }}>
                                    {this.state.fromUserNm}
                                  </span>
                                )}
                                {this.state.fromUserNm === "" && (
                                  <span style={{ fontWeight: "bold", fontSize: 24 }}>
                                    {"チャット相手を選択してください"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        }
                        // チャットやり取り
                        center={
                          <div style={{ height: "75vh", width: "80vh", overflow: "scroll", whiteSpace: "pre-wrap", backgroundColor: "#EEEEEE", boxShadow: "2px 2px 4px -2px gray inset" }}
                            ref={this.scrollBottomRef}>
                            <MessageList
                              toBottomHeight={'100%'}
                              lockable={true}
                              downButton={true}
                              downButtonBadge={10}
                              dataSource={this.state.messages} />
                          </div>
                        }
                      />
                    </div>
                  }
                  right={
                    <div style={{ height: "70vh", width: "60vh" }}>
                      {/* チャット入力 */}
                      {this.state.fromUserNm !== "" && (
                        <div style={{}}>
                          <div style={{ width: "55vh" }}>
                            <ChatInput
                              ref={el => (this.inputRef = el)}
                              maxlength={1000}
                              autofocus={true}
                              placeholder="メッセージを入力"
                              multiline={true}
                              onChange={this.handleChangeMessage}
                              rightButtons={
                                <ChatButton
                                  color='white'
                                  backgroundColor='blue'
                                  text='送信'
                                  onClick={this.handleSendMessage}
                                />
                              } />
                          </div>
                          <br /><br />
                          {!this.state.isGroup &&
                            <Button
                              color="primary"
                              className={classes.button2}
                            >
                              <ImageIcon style={{ cursor: "pointer", marginRight: 10 }} />
                              画像添付
                              <input
                                type="file"
                                accept="image/*"
                                className={classes.inputFileBtnHide}
                                onChange={this.handleSelectImageFile}
                              />
                            </Button>
                          }
                          {!this.state.isGroup &&
                            <Button
                              onClick={this.openCoinSend.bind(this)}
                              color="primary"
                              className={classes.button2}
                            >
                              <img
                                src={"/images/coin_icon.png"}
                                width="20"
                                height="20"
                                color="black"
                                style={{ cursor: "pointer", marginRight: 10 }}
                              />
                              コイン送付
                            </Button>
                          }
                          {this.state.isGroup &&
                            <Button
                              onClick={this.openGroupPush.bind(this)}
                              color="primary"
                              className={classes.button2}
                            >
                              <img
                                src={"/images/push_icon.png"}
                                width="20"
                                height="20"
                                color="black"
                                style={{ cursor: "pointer", marginRight: 10 }}
                              />
                              プッシュ通知
                            </Button>
                          }
                          <br /><br /><br />
                          <Button
                            color="primary"
                            onClick={this.handleClickLimitDate.bind(this)}>
                            過去１か年前を読み込み
                          </Button>
                          <span style={{ fontSize: 12 }}>
                            （{moment(this.state.limitDate).format("YYYY/MM/DD")}まで表示中）
                          </span>
                        </div>
                      )}
                      <div style={{ display: "table" }}>
                        {/* TODO */}
                        {/* <br /><span>{JSON.stringify(this.state.messages)}</span> */}
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
            {/* -- メイン -- */}

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

            {/* コイン送付ダイアログ */}
            <Dialog
              open={this.state.openCoinSend}
              onClose={() => {
                this.setState({ openCoinSend: false });
              }}
              aria-labelledby="form-dialog-title"
              fullWidth={true}
              maxWidth="md"
              onBackdropClick="false"
            >
              <DialogTitle id="form-dialog-title">コイン送付</DialogTitle>
              <DialogContent>
                <InputLabel shrink htmlFor="age-native-simple">
                  所持コイン
                </InputLabel><br />
                <FormLabel style={{ color: "red", fontSize: 20 }}>
                  {`　` + this.state.displayCoin + `コイン`}
                </FormLabel><br /><br />
                <InputLabel shrink htmlFor="age-native-simple">
                  送付相手
                </InputLabel><br />
                <FormLabel style={{ color: "black", fontSize: 24 }}>
                  {`　` + this.state.fromUserNm}
                </FormLabel><br /><br />
                <InputLabel shrink htmlFor="age-native-simple">
                  コイン
                </InputLabel><br />
                <Select
                  native
                  value={this.state.target_manager}
                  input={
                    <Input
                      onChange={(e) => {
                        this.setState({ target_manager: e.target.value });
                      }}
                    />
                  }
                >
                  {this.state.coinList.map((item) => (
                    <option value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select><br /><br />
                <InputLabel shrink htmlFor="age-native-simple">
                  承認ポイント
                </InputLabel><br />
                <Select
                  native
                  value={this.state.shoninCd}
                  input={
                    <Input
                      onChange={(e) => {
                        this.setState({ shoninCd: e.target.value });
                      }}
                    />
                  }
                >
                  {this.state.shoninList.map((item) => (
                    <option value={item.shonin_cd}>
                      {item.shonin_point}
                    </option>
                  ))}
                </Select><br /><br />
                <TextField
                  id="comment"
                  name="comment"
                  margin="normal"
                  label={`コメント`}
                  multiline
                  rows="10"
                  fullWidth
                  value={this.state.comment}
                  onChange={(e) => {
                    this.setState({ comment: e.target.value });
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ openCoinSend: false });
                  }}
                  color="secondary">
                  キャンセル
                </Button>
                <Button
                  onClick={this.handleSubmitCoinSend.bind(this)}
                  color="primary"
                >
                  送付する
                </Button>
              </DialogActions>
            </Dialog>

            {/* グループチャットプッシュ送信ダイアログ */}
            <Dialog
              open={this.state.openGroupPush}
              onClose={() => {
                this.setState({ openGroupPush: false });
              }}
              aria-labelledby="form-dialog-title"
              fullWidth={true}
              maxWidth="md"
              onBackdropClick="false"
            >
              <DialogTitle id="form-dialog-title">{this.state.fromUserNm}</DialogTitle>
              <DialogContent>
                <TextField
                  id="comment"
                  name="comment"
                  margin="normal"
                  label={`コメント`}
                  multiline
                  rows="10"
                  fullWidth
                  value={this.state.comment}
                  onChange={(e) => {
                    this.setState({ comment: e.target.value });
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ openGroupPush: false });
                  }}
                  color="secondary">
                  キャンセル
                </Button>
                <Button
                  onClick={this.handleSubmitGroupPush.bind(this)}
                  color="primary"
                >
                  送信する
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
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px ${theme.spacing.unit + 6
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
    // width: "70%",
    // float: "left",
    // marginLeft: 50
  },
  articleHeaderTable: {
    // textAlign: "center",
    marginBottom: 20,
    display: "flex"
  },
  chatMessageTable: {
    width: "98%",
    marginLeft: 50,
    overflowY: "scroll",
    // overflowX: "hidden",
  },
  chatInputTable: {
    width: "98%",
    marginTop: 30,
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
    width: 150,
    height: 30,
    cursor: "pointer",
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  button2: {
    width: 150,
    height: 30,
    cursor: "pointer",
  },
});

ChatForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ChatForm);
