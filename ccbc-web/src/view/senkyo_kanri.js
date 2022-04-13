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
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddCircle from "@material-ui/icons/AddCircle";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import { kanriListItems, systemName, restUrl, titleItems } from "./tileData";
import Avatar from "@material-ui/core/Avatar";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import request from "superagent";
import moment from "moment";
import "moment/locale/ja";
import Web from "@material-ui/icons/Web";
import * as myActions from "../actions/senkyo_kanri";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const restdomain = require("../common/constans.js").restdomain;

const CustomTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 18,
  },
  body: {
    fontSize: 18,
  },
}))(TableCell);

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    fontSize: "105%",
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
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
});

function getNendo(val) {
  var result = "日付文字列が不正です。"; //日付不正時のメッセージ
  try {
    var y = Number(val.substr(0, 4));
    var m = Number(val.substr(4, 2));
    var d = Number(val.substr(6, 2));
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() == y && dt.getMonth() == m - 1 && dt.getDate() == d) {
      if (m < 4) {
        //4月はじまり
        result = y - 1;
      } else {
        result = y;
      }
    }
    return result;
  } catch (ex) {
    return result;
  }
}

function getArray(array1) {
  var array2 = array1.filter(function (x, i, self) {
    return self.indexOf(x) === i;
  });
  return array2;
}

class PersistentDrawer extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
  };

  constructor(props) {
    super(props);
    const params = this.props.match;
    this.state = {
      status: true,
      loaded: false,
      mode: params.params.mode,
      readonly: false,
      resultList: [],
      resultAllList: [],
      open: false,
      anchor: "left",
      anchorEl: null,
      addFlg: true,
      Target_year: "",
      nendoList: [],
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    // 現在年の取得。取得した年を初期表示する
    var yyyy = getNendo(moment(new Date()).format("YYYYMMDD"));
    //var yyyy = new Date().getFullYear()
    this.setState({ Target_year: yyyy });
    this.state.targetYear = yyyy;

    var loginInfos = JSON.parse(sessionStorage.getItem("loginInfo"));
    for (var i in loginInfos) {
      var loginInfo = loginInfos[i];
      this.setState({ userid: loginInfo["userid"] });
      this.setState({ password: loginInfo["password"] });
      this.setState({ tShainPk: loginInfo["tShainPk"] });
      this.setState({ imageFileName: loginInfo["imageFileName"] });
      this.setState({ shimei: loginInfo["shimei"] });
      this.setState({ kengenCd: loginInfo["kengenCd"] });
      if (loginInfo["kengenCd"] === "0") {
        this.setState({ addFlg: false });
      }
    }

    request.get(restdomain + "/senkyo_kanri/find").end((err, res) => {
      if (err) return;
      // 検索結果表示
      this.setState({ resultList: res.body.data });
    });

    request
      .get(restdomain + "/senkyo_kanri/findall")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        // 年度リスト生成
        var nendoList = [];
        for (var i in res.body.data) {
          var r = res.body.data[i];
          var d = moment(new Date(r.tohyo_kaishi_dt)).format("YYYYMMDD");
          var nendo = getNendo(d);
          nendoList.push(nendo);
        }
        if (
          this.state.resultList.length === 0 ||
          getNendo(moment(new Date()).format("YYYYMMDD")) != yyyy
        ) {
          nendoList.push(getNendo(moment(new Date()).format("YYYYMMDD")));
        }
        // 年度重複削除
        var nendoList2 = getArray(nendoList);
        this.state.nendoList = nendoList2;
        this.setState({ nendoList: nendoList2 });
      });

    request
      .post(restdomain + "/senkyo_kanri/findall")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        // 検索結果表示
        this.setState({ resultAllList: res.body.data });
      });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    this.state.targetYear = Number(event.target.value);
    request
      .post(restdomain + "/senkyo_kanri/findall")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        // 検索結果表示
        this.setState({ resultAllList: res.body.data });
      });
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleLogoutClick = () => {
    // ログアウト時にlocalStorageをクリアする
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

  handleClick = (event) => {
    const { senkyoKanri, actions } = this.props;
    var pSenkyoPk = event.currentTarget.getAttribute("data-num");
    actions.setSenkyoKanriData(pSenkyoPk);
  };

  handleClick2 = (event) => {
    const { senkyoKanri, actions } = this.props;
    actions.setSenkyoKanriData(0);
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;
    const SenkyoTorokuLink = (props) => <Link to="/senkyo_toroku" {...props} />;

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
          <AppBar position="static"
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
              {titleItems}
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
                      style={{ 
                        fontSize: "100%",
                        marginBlockStart:"5%"
                      }}
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
            <div className={classes.root}>
              <h2>
                <img
                  src="/images/yajirushi.png"
                  alt="サンプル"
                  align="top"
                  width="30"
                  height="30"
                  style={{ marginTop: 3 }}
                />
                <strong>現在投票中の選挙</strong>
              </h2>
              <Paper className={classes.root}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <CustomTableCell style={{ fontSize: "100%" }}>
                        選挙名
                      </CustomTableCell>
                      <CustomTableCell style={{ fontSize: "100%" }}>
                        投票開始日
                      </CustomTableCell>
                      <CustomTableCell style={{ fontSize: "100%" }}>
                        投票終了日
                      </CustomTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.resultList.map((n) => {
                      return (
                        <TableRow className={classes.row} key={n.id}>
                          <CustomTableCell
                            component="th"
                            scope="row"
                            style={{ fontSize: "100%" }}
                          >
                            {n.senkyo_nm}
                          </CustomTableCell>
                          <CustomTableCell style={{ fontSize: "100%" }}>
                            {moment(new Date(n.tohyo_kaishi_dt)).format(
                              "YYYY/MM/DD"
                            )}
                          </CustomTableCell>
                          <CustomTableCell style={{ fontSize: "100%" }}>
                            {moment(new Date(n.tohyo_shuryo_dt)).format(
                              "YYYY/MM/DD"
                            )}
                          </CustomTableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
              <p>
                <Button
                  variant="raised"
                  onClick={this.handleClick2}
                  component={SenkyoTorokuLink}
                  size="large"
                  color="default"
                  className={classes.button}
                  disabled={this.state.addFlg}
                >
                  <AddCircle
                    className={classNames(classes.leftIcon, classes.iconSmall)}
                  />
                  ADD
                </Button>
              </p>
              <br />
              <h2>
                <img
                  src="/images/yajirushi.png"
                  alt="サンプル"
                  align="top"
                  width="30"
                  height="30"
                  style={{ marginTop: 3 }}
                />
                <strong>選挙履歴一覧</strong>
              </h2>
              <form className={classes.root} autoComplete="off">
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="Target_year-simple">対象年度</InputLabel>
                  <Select
                    native
                    id="Target_year-simple"
                    value={this.state.Target_year}
                    onChange={this.handleChange}
                    inputProps={{
                      name: "Target_year",
                      id: "Target_year-simple",
                    }}
                  >
                    {this.state.nendoList.map((n) => {
                      return <option value={n}>{n}年</option>;
                    })}
                  </Select>
                </FormControl>
              </form>
              <Paper className={classes.root}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <CustomTableCell style={{ fontSize: "100%" }}>
                        選挙名
                      </CustomTableCell>
                      <CustomTableCell style={{ fontSize: "100%" }}>
                        投票開始日
                      </CustomTableCell>
                      <CustomTableCell style={{ fontSize: "100%" }}>
                        投票終了日
                      </CustomTableCell>
                      <CustomTableCell>照会</CustomTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.resultAllList.map((n) => {
                      return (
                        <TableRow className={classes.row} key={n.id}>
                          <CustomTableCell
                            component="th"
                            scope="row"
                            style={{ fontSize: "100%" }}
                          >
                            {n.senkyo_nm}
                          </CustomTableCell>
                          <CustomTableCell style={{ fontSize: "100%" }}>
                            {moment(new Date(n.tohyo_kaishi_dt)).format(
                              "YYYY/MM/DD"
                            )}
                          </CustomTableCell>
                          <CustomTableCell style={{ fontSize: "100%" }}>
                            {moment(new Date(n.tohyo_shuryo_dt)).format(
                              "YYYY/MM/DD"
                            )}
                          </CustomTableCell>
                          <CustomTableCell>
                            <Button
                              variant="raised"
                              color="default"
                              size="large"
                              onClick={this.handleClick}
                              component={SenkyoTorokuLink}
                              data-num={n.t_senkyo_pk}
                              data-name={n.senkyo_nm}
                              className={classes.button}
                            >
                              <Web
                                className={classNames(
                                  classes.leftIcon,
                                  classes.iconSmall
                                )}
                              />
                              REFER
                            </Button>
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

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  senkyoKanri: state.senkyoKanri,
});

const mapDispatch = (dispatch) => ({
  actions: bindActionCreators(myActions, dispatch),
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState, mapDispatch)(PersistentDrawer)
);
