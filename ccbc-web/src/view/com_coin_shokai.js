import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Link } from "react-router-dom";
import { kanriListItems, restUrl, titleItems2 } from "./tileData";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import MenuList from "@material-ui/core/MenuList";

/** 検索条件部分 */
// import Input from '@material-ui/core/Input'
// import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from "@material-ui/core/InputAdornment";
// import FormHelperText from '@material-ui/core/FormHelperText'
// import FormControl from '@material-ui/core/FormControl'
import TextField from "@material-ui/core/TextField";
// import Visibility from '@material-ui/icons/Visibility'
// import VisibilityOff from '@material-ui/icons/VisibilityOff'

/** ラジオボタン部分 */
import green from "@material-ui/core/colors/green";
import Radio from "@material-ui/core/Radio";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";

//** テーブル部分 */
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

//** ボタン部分 */
import Button from "@material-ui/core/Button";
// import DeleteIcon from '@material-ui/icons/Delete'
// import CloudUploadIcon from '@material-ui/icons/CloudUpload'
// import KeyboardVoiceICon from '@material-ui/icons/KeyboardVoice'
// import Icon from '@material-ui/core/Icon'
// import SaveIcon from '@material-ui/icons/Save'
import PageviewIcon from "@material-ui/icons/Pageview";
// import Assessment from '@material-ui/icons/Assessment'
// import NavigationIcon from '@material-ui/icons/Navigation'
// import ListIcon from '@material-ui/icons/List'

/** 検索部分のリストボックス */
const ranges1 = [
  {
    value: "操作者0",
    label: "ＡＬＬ"
  },
  {
    value: "操作者１",
    label: "井上　卓"
  },
  {
    value: "操作者２",
    label: "角谷　貴之"
  },
  {
    value: "操作者３",
    label: "吉田　裕一"
  },
  {
    value: "操作者４",
    label: "事務局"
  }
];
const ranges2 = [
  {
    value: "取引相手0",
    label: "ＡＬＬ"
  },
  {
    value: "取引相手１",
    label: "井上　卓"
  },
  {
    value: "取引相手２",
    label: "角谷　貴之"
  },
  {
    value: "取引相手３",
    label: "吉田　裕一"
  },
  {
    value: "取引相手４",
    label: "事務局"
  }
];
const ranges3 = [
  {
    value: "イベント１",
    label: "チャット"
  },
  {
    value: "イベント２",
    label: "記事投稿"
  },
  {
    value: "イベント３",
    label: "ショッピングカート"
  },
  {
    value: "イベント４",
    label: "HARVEST投票"
  }
];
const ranges4 = [
  {
    value: "年度１",
    label: "2019年度"
  },
  {
    value: "年度２",
    label: "2018年度"
  },
  {
    value: "年度３",
    label: "2017年度"
  }
];

const ranges6 = [
  {
    value: "取引種類１",
    label: "もらった"
  },
  {
    value: "取引種類２",
    label: "あげる"
  },
  {
    value: "取引種類３",
    label: "両方"
  }
];
/** ここまで検索条件部分のconst */

/**　テーブル部分のconst */
const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black
  },
  body: {
    fontSize: 14
  }
}))(TableCell);

let id = 0;
function createData(soufu, juryo, coin, event, date) {
  id += 1;
  return { id, soufu, juryo, coin, event, date };
}

const rows = [
  createData("吉田　裕一", "井上　卓", 100, "チャット", "2019/06/26"),
  createData("事務局", "井上　卓", 400, "HARVEST投票", "2019/06/20"),
  createData("事務局", "角谷　貴之", 50, "記事投稿", "2019/06/16"),
  createData("角谷　貴之", "石垣　努", 150, "チャット", "2019/06/15"),
  createData("石垣　努", "事務局", 75, "ショッピングカート", "2019/06/06"),
  createData("山城　博紀", "吉田　裕一", 25, "チャット", "2019/06/01"),
  createData("山城　博紀", "吉田　裕一", 25, "HARVESTコイン贈与", "2019/05/01"),
  createData("佐々木　唯", "事務局", 700, "HARVEST年度末処理", "2019/04/01")
];
/**　ここまでがテーブル部分のconst */

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    /** 検索条件部品のstyles */
    display: "flex",
    flexWrap: "wrap",
    /** ラジオボタン部品のstyles */
    /*     color: green[600],
    '&$checked': {
      color: green[500]
    }, */
    /** テーブル部品のstyles */
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto"
  },
  /** ここから検索条件 */
  margin: {
    margin: theme.spacing.unit
  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    flexBasis: 200,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  /**　ここからラジオボタン */
  checked: {},
  size: {
    width: 40,
    height: 40
  },
  sizeIcon: {
    fontSize: 20
  },
  /**　ここからテーブル */
  table: {
    minWidth: 700
  },
  /** ここからボタン */
  button: {
    margin: theme.spacing.unit
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  },

  /** ここからは、元の記載 */
  appFrame: {
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    width: "100%"
  },
  buttonFrame: {
    position: "static",
    marginRight: 24
  },
  buttonFrame2: {
    position: "static",
    marginRight: 0
  },
  appBar: {
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  "appBarShift-left": {
    marginLeft: drawerWidth
  },
  "appBarShift-right": {
    marginRight: drawerWidth
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: "none"
  },
  drawerPaper: {
    position: "relative",
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  "content-left": {
    marginLeft: -drawerWidth
  },
  "content-right": {
    marginRight: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  "contentShift-left": {
    marginLeft: 0
  },
  "contentShift-right": {
    marginRight: 0
  },
  image: {
    position: "relative",
    height: 300,
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100
    },
    "&:hover, &$focusVisible": {
      zIndex: 1,
      "& $imageBackdrop": {
        opacity: 1
      },
      "& $imageMarked": {
        opacity: 0
      },
      "& $imageTitle": {
        border: "4px solid currentColor"
      }
    }
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
    color: theme.palette.common.white
  },
  imageSrc: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center 40%"
  },
  imageBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity")
  },
  imageTitle: {
    position: "relative",
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px ${theme
      .spacing.unit + 6}px`,
    fontSize: "300%"
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity")
  },
  chip: {
    height: "300%",
    margin: theme.spacing.unit
  },
  appBarColorDefault: {
    backgroundColor: "rgba(255, 136, 0, 0.92)"
  }
});

// 画面内で利用する情報
// 検索条件：操作者 取引相手 イベント 検索結果：送付者 受領者 コイン イベント 日付
class ComCoinShokaiForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    target_manager: 0,
    comment: "",
    checked: false,
    zoyoCoin: 0,
    from_bcaccount: "",
    to_bcaccount: "",
    to_tShainPk: "",
    nenjiFlg: "0",
    jimuId: 0,
    jimuFlg: false,
    alertOpen: false,
    dialogOpen: false,
    alertMsg: "",
    tokenId: null,
    msg: null,
    loadFlg: false
  };

  handleChange5 = event => {
    this.setState({ selectedValue: event.target.value });
  };

  handleChange = prop => event => {
    this.setState({ [prop]: event.target.value });
  };

  handleChange2 = prop => event => {
    this.setState({ [prop]: event.target.value });
  };

  handleChange3 = prop => event => {
    this.setState({ [prop]: event.target.value });
  };

  handleChange4 = prop => event => {
    this.setState({ [prop]: event.target.value });
  };
  handleChange6 = prop => event => {
    this.setState({ [prop]: event.target.value });
  };

  handleMouseDownPassword = event => {
    event.preventDefault();
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
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

  handleToggleClose = event => {
    if (this.target1.contains(event.target)) {
      return;
    }

    this.setState({ open2: false });
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = props => <Link to="../" {...props} />;

    const drawer = (
      <Drawer
        variant="persistent"
        anchor={anchor}
        open={open}
        classes={{
          paper: classes.drawerPaper
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
        {kanriListItems()}
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
              [classes[`appBarShift-${anchor}`]]: open
            })}
            classes={{ colorPrimary: this.props.classes.appBarColorDefault }}
            //colorPrimary="rgba(200, 200, 200, 0.92)"
            //color="secondary"
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
                    ref={node => {
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
                [classes[`contentShift-${anchor}`]]: open
              }
            )}
          >
            <div className={classes.drawerHeader} />
            {/* 下のdivの中身を画面に応じて変えること。ヘッダ部分は共通のため、触らないこと。 */}

            <div>
              {/* 一行目の検索条件 */}
              <strong>
                <h2>検索条件</h2>
              </strong>
              <div>
                <h>
                  <font color="#000000" size="5%">
                    年度
                  </font>
                </h>
                <Radio
                  checked={this.state.selectedValue === "a"}
                  onChange={this.handleChange5}
                  value="a"
                  color="default"
                  name="radio-button-demo"
                  aria-label="A"
                  className={classes.size}
                  icon={
                    <RadioButtonUncheckedIcon className={classes.sizeIcon} />
                  }
                  checkedIcon={
                    <RadioButtonCheckedIcon className={classes.sizeIcon} />
                  }
                />
                <h>
                  <font color="#000000" size="5%">
                    日付
                  </font>
                </h>
                <Radio
                  checked={this.state.selectedValue === "b"}
                  onChange={this.handleChange5}
                  value="b"
                  color="default"
                  name="radio-button-demo"
                  aria-label="B"
                  className={classes.size}
                  icon={
                    <RadioButtonUncheckedIcon className={classes.sizeIcon} />
                  }
                  checkedIcon={
                    <RadioButtonCheckedIcon className={classes.sizeIcon} />
                  }
                />
              </div>
              {/* 二行目の検索条件 */}
              <form className={classes.container} noValidate>
                <TextField
                  select
                  label="日付（年）"
                  className={classes.textField}
                  value={this.state.weightRange}
                  onChange={this.handleChange("weightRange")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />
                  }}
                >
                  {ranges4.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  id="date"
                  label="日付（開始）"
                  type="date"
                  defaultValue="2019-6-23"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                <TextField
                  id="date"
                  label="日付（終了）"
                  type="date"
                  defaultValue="2019-6-23"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </form>

              {/* 三行目の検索条件 */}
              <TextField
                select
                label="操作者"
                className={classNames(classes.margin, classes.textField)}
                value={this.state.weightRange2}
                onChange={this.handleChange2("weightRange2")}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />
                }}
              >
                {ranges1.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* 操作者と取引相手間の矢印 */}
              <img
                src="/images/yajirushi.png"
                alt="サンプル"
                align="top"
                width="30"
                height="30"
                style={{ marginTop: 30 }}
              />

              <TextField
                select
                label="取引相手"
                className={classNames(classes.margin, classes.textField)}
                value={this.state.weightRange3}
                onChange={this.handleChange3("weightRange3")}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />
                }}
              >
                {ranges2.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="取引"
                className={classNames(classes.margin, classes.textField)}
                value={this.state.weightRange6}
                onChange={this.handleChange6("weightRange6")}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />
                }}
              >
                {ranges6.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <div>
                <TextField
                  select
                  label="イベント"
                  className={classNames(classes.margin, classes.textField)}
                  value={this.state.weightRange4}
                  onChange={this.handleChange4("weightRange4")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />
                  }}
                >
                  {ranges3.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div>
                <Button
                  size="midium"
                  variant="raised"
                  aria-label="Delete"
                  className={classes.button}
                >
                  <PageviewIcon
                    className={classNames(classes.leftIcon, classes.iconSmall)}
                  />
                  検索
                </Button>
              </div>
              <strong>
                <h2>検索結果</h2>
              </strong>
              {/* ここからテーブル */}
              <Paper className={classes.root}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <CustomTableCell
                        style={{ width: "20%", fontSize: "120%" }}
                      >
                        送付者
                      </CustomTableCell>
                      <CustomTableCell
                        style={{ width: "20%", fontSize: "120%" }}
                      >
                        受領者
                      </CustomTableCell>
                      <CustomTableCell
                        numeric
                        style={{ width: "10%", fontSize: "120%" }}
                      >
                        コイン
                      </CustomTableCell>
                      <CustomTableCell
                        style={{ width: "30%", fontSize: "120%" }}
                      >
                        イベント
                      </CustomTableCell>
                      <CustomTableCell
                        style={{ width: "20%", fontSize: "120%" }}
                      >
                        日付
                      </CustomTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => {
                      return (
                        <TableRow className={classes.row} key={row.id}>
                          <CustomTableCell
                            component="th"
                            scope="row"
                            style={{ width: "20%", fontSize: "120%" }}
                          >
                            {row.soufu}
                          </CustomTableCell>
                          <CustomTableCell
                            style={{ width: "20%", fontSize: "120%" }}
                          >
                            {row.juryo}
                          </CustomTableCell>
                          <CustomTableCell
                            numeric
                            style={{ width: "10%", fontSize: "120%" }}
                          >
                            {row.coin}
                          </CustomTableCell>
                          <CustomTableCell
                            style={{ width: "30%", fontSize: "120%" }}
                          >
                            {row.event}
                          </CustomTableCell>
                          <CustomTableCell
                            style={{ fwidth: "20%", fontSize: "120%" }}
                          >
                            {row.date}
                          </CustomTableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            </div>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

ComCoinShokaiForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(ComCoinShokaiForm);
