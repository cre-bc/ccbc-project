import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Button from "@material-ui/core/Button";
import {
  mailFolderListItems,
  otherMailFolderListItems,
  kanriListItems,
  ippanListItems,
  kojiListItems,
  systemName,
  restUrl,
} from "./tileData";
import Menu from "@material-ui/core/Menu";
import Avatar from "@material-ui/core/Avatar";
import { Link } from "react-router-dom";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import MenuList from "@material-ui/core/MenuList";
import Collapse from "@material-ui/core/Collapse";
import Portal from "@material-ui/core/Portal";

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
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
});

class PersistentDrawer extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
  };

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    var loginInfos = JSON.parse(sessionStorage.getItem("loginInfo"));
    for (var i in loginInfos) {
      var loginInfo = loginInfos[i];
      this.setState({ userid: loginInfo["userid"] });
      this.setState({ password: loginInfo["password"] });
      this.setState({ tShainPk: loginInfo["tShainPk"] });
      this.setState({ imageFileName: loginInfo["imageFileName"] });
      this.setState({ shimei: loginInfo["shimei"] });
      this.setState({ kengenCd: loginInfo["kengenCd"] });
    }
    // サンプル用に認証を許可
    sessionStorage.setItem("sessionId", true);
  }

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

  update = () => {
    var loginInfo = [
      {
        userid: document.js.userid.value,
        password: document.js.password.value,
        tShainPk: document.js.tShainPk.value,
        imageFileName: document.js.imageFileName.value,
        shimei: document.js.shimei.value,
        kengenCd: document.js.kengenCd.value,
      },
    ];
    sessionStorage.setItem("loginInfo", JSON.stringify(loginInfo));
    alert("セッションストレージに反映しました");
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const { anchorEl } = this.state;
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
        <List>{kanriListItems()}</List>
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
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-${anchor}`]]: open,
            })}
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
              <div className={classes.appFrame}>
                <Typography variant="title" color="inherit" noWrap>
                  {systemName}
                </Typography>
              </div>
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
            <Typography>
              <div>
                <h3>部品サンプル</h3>
                <ul>
                  <li>
                    <a href="/radar">【01】レーダーチャート</a>
                  </li>
                  <li>
                    <a href="/graph">【02】グラフ</a>
                  </li>
                  <li>
                    <a href="/db">【03】データベース</a>
                  </li>
                  <li>
                    <a href="/image">【04】イメージ</a>
                  </li>
                  <li>
                    <a href="/redux">
                      【05】Reduxサンプル（画面間の値受け渡し）
                    </a>
                  </li>
                  <li>
                    <a href="/check">【06】入力チェック</a>
                  </li>
                </ul>
                <h3>テスト用セッションストレージ登録</h3>
                <label>
                  ここで入力したものがセッションストレージに格納されますのでテスト用に使ってください。
                  <br />
                  ブラウザを閉じる、またはログアウトしたタイミングでセッションストレージは破棄されます。
                  <br />
                  イメージファイル名（imageFileName）については、上記「部品サンプル【04】イメージ」で登録したファイル名を指定してください。
                </label>
                <br />
                <form name="js">
                  <label>userid：</label>
                  <input type="text" name="userid" />
                  &nbsp;
                  <label>password：</label>
                  <input type="text" name="password" />
                  &nbsp;
                  <label>tShainPk：</label>
                  <input type="text" name="tShainPk" />
                  &nbsp;
                  <br />
                  <label>imageFileName：</label>
                  <input type="text" name="imageFileName" />
                  &nbsp;
                  <label>shimei：</label>
                  <input type="text" name="shimei" />
                  &nbsp;
                  <label>kengenCd：</label>
                  <input type="text" name="kengenCd" />
                  &nbsp;
                  <br />
                  <input type="button" value="反映" onClick={this.update} />
                </form>
                <h3>HARVEST画面モックアップ（使用不可）</h3>
                <h3>画面モックアップサンプル（イテレーション１）</h3>
                <ul>
                  <li>
                    <a href="/menu">【01】メインメニュー</a>
                  </li>
                  <li>
                    <a href="/senkyo_kanri">【02】選挙管理</a>
                  </li>
                  <li>
                    <a href="/senkyo_toroku">【03】選挙登録</a>
                  </li>
                  <li>
                    <a href="/tohyo_toroku">【04】投票登録</a>
                  </li>
                </ul>
                <h3>画面モックアップサンプル（イテレーション２）</h3>
                <ul>
                  <li>
                    <a href="/tohyo_ichiran">【01】投票一覧</a>
                  </li>
                  <li>
                    <a href="/tohyo_shokai_kobetsu">【02】投票照会（個別）</a>
                  </li>
                  <li>
                    <a href="/tohyo_shokai_shosai">
                      【03】投票照会（個別詳細）
                    </a>
                  </li>
                  <li>
                    <a href="/coin_shokai">【04】コイン照会</a>
                  </li>
                  <li>
                    <a href="/comment_shokai">【05】コメント照会</a>
                  </li>
                </ul>
                <h3>画面モックアップサンプル（イテレーション３）</h3>
                <ul>
                  <li>
                    <a href="/coin_zoyo">【01】コイン贈与</a>
                  </li>
                </ul>
                <h3>画面モックアップサンプル（イテレーション４）</h3>
                <ul>
                  <li>
                    <a href="/shain_kensaku">【01】社員検索</a>
                  </li>
                  <li>
                    <a href="/shain_toroku">【02】社員登録</a>
                  </li>
                  <li>
                    <a href="/tohyo_shokai_nendo">【03】投票照会（年度）</a>
                  </li>
                </ul>

                <h3>ComComCoin画面モックアップ</h3>
                <ul>
                  <li>
                    <a href="/com_coin_shokai">【01】コイン照会</a>
                  </li>
                  <li>
                    <a href="/com_coin_shokai_graph">【02】コイン照会グラフ</a>
                  </li>
                  <li>
                    <a href="/com_shohin_mente">【03】商品メンテナンス</a>
                  </li>
                  <li>
                    <a href="/com_kokoku_mente">【04】広告メンテナンス</a>
                  </li>
                  <li>
                    <a href="/com_oshirase_mente">【05】お知らせメンテナンス</a>
                  </li>
                  <li>
                    <a href="/com_coin_shojicoin">【06】コイン照会所持コイン</a>
                  </li>
                  <li>
                    <a href="/article">【xx】記事投稿</a>
                  </li>
                </ul>
              </div>
            </Typography>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);
