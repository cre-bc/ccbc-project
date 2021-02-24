import React from "react";
import request from "superagent";
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
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import Web from "@material-ui/icons/Web";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { kanriListItems, systemName, restUrl, titleItems } from "./tileData";
import Avatar from "@material-ui/core/Avatar";

import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { bindActionCreators } from "redux";
import * as myActions from "../actions/coin_shokai";
import { connect } from "react-redux";

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
  completed: {
    display: "inline-block",
  },
  stepSize: {
    width: 20,
    height: 10,
    textAlign: "left",
    verticalAlign: "top",
  },
  input: {
    margin: theme.spacing.unit,
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
  paper: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
  },
  table: {},
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default,
    },
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  coinInfo: {
    padding: 20,
    marginTop: 10,
  },
  coinInfoTable: {
    width: 500,
  },
  addToPaper: {
    marginTop: 10,
    width: 650,
    fontSize: 18,
  },
  InputLabel: {
    whiteSpace: "nowrap",
  },
  select: {
    width: 140,
  },
});

class CoinShokaiForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    shainList: [],
    yearList: [],
    getCoinAllList: [],
    getCoinList: [],
    takeCoinAllList: [],
    takeCoinList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    year_info: "",
    target_manager: "",
    kengenCd: null,
    checked: false,
    allGetCoin: 0,
    getCoin: 0,
    allTakeCoin: 0,
    takeCoin: 0,
    happyoSu: "",
  };

  constructor(props) {
    super(props);
  }

  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    var loginInfos = JSON.parse(sessionStorage.getItem("loginInfo"));
    for (var i in loginInfos) {
      var loginInfo = loginInfos[i];
      this.setState({ userid: loginInfo["userid"] });
      this.setState({ password: loginInfo["password"] });
      this.setState({ tShainPk: loginInfo["tShainPk"] });
      this.state.tShainPk = Number(loginInfo["tShainPk"]);
      this.setState({ imageFileName: loginInfo["imageFileName"] });
      this.setState({ shimei: loginInfo["shimei"] });
      this.setState({ kengenCd: loginInfo["kengenCd"] });
      this.state.kengenCd = loginInfo["kengenCd"];
    }

    this.find();

    var year_info = await sessionStorage.getItem("year_info");
    if (year_info != null) {
      this.state.year_info = Number(year_info);
      this.setState({ year_info: this.state.year_info });
      this.state.target_manager = await sessionStorage.getItem(
        "target_manager"
      );
      this.setState({ target_manager: Number(this.state.target_manager) });
      var checked = await sessionStorage.getItem("checked");
      this.setState({ checked: checked });
      this.findChange();
      await sessionStorage.removeItem("year_info");
      await sessionStorage.removeItem("target_manager");
      await sessionStorage.removeItem("checked");

      var checked = this.state.checked;
      // 初期表示はFalse
      if (checked === "true") {
        this.setState({ checked: true });
      } else {
        this.setState({ checked: false });
      }
    }
  }

  find = () => {
    request
      .post(restdomain + "/coin_shokai/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          return;
        }
        var resList = res.body.getCoinDatasAll;
        var resList2 = res.body.takeCoinDatasAll;
        var resList3 = res.body.shainDatas;
        var resList4 = res.body.nendoDatas;
        // 検索結果表示
        this.setState({ shainList: resList3 });
        this.setState({ yearList: resList4 });
        this.setState({ getCoinAllList: resList });
        this.setState({ getCoinList: res.body.getCoinDatas });
        this.setState({ takeCoinAllList: resList2 });
        this.setState({ takeCoinList: res.body.takeCoinDatas });
        this.setState({
          allGetCoin: "受領コイン計（事務局含む）：" + res.body.allGetCoinSu,
        });
        this.setState({
          getCoin: "受領コイン計：" + res.body.getCoinSu,
        });
        this.setState({
          allTakeCoin: "授与コイン計（事務局含む）：" + res.body.allTakeCoinSu,
        });
        this.setState({
          takeCoin: "授与コイン計：" + res.body.takeCoinSu,
        });
        this.setState({ takeCoinList: res.body.takeCoinDatas });
        this.setState({ happyoSu: res.body.happyoSu });
      });
  };

  findChange = () => {
    request
      .post(restdomain + "/coin_shokai/findChange")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          return;
        }
        var resList = res.body.getCoinDatasAll;
        var resList2 = res.body.takeCoinDatasAll;
        // 検索結果表示
        this.setState({ getCoinAllList: resList });
        this.setState({ getCoinList: res.body.getCoinDatas });
        this.setState({ takeCoinAllList: resList2 });
        this.setState({ takeCoinList: res.body.takeCoinDatas });
        this.setState({
          allGetCoin: "受領コイン計（事務局含む）" + res.body.allGetCoinSu,
        });
        this.setState({
          getCoin: "受領コイン計" + res.body.getCoinSu,
        });
        this.setState({
          allTakeCoin: "授与コイン計（事務局含む）" + res.body.allTakeCoinSu,
        });
        this.setState({
          takeCoin: "授与コイン計" + res.body.takeCoinSu,
        });
        this.setState({ happyoSu: res.body.happyoSu });
      });
  };

  handleChange = (event) => {
    if (event.target.name == "year_info") {
      this.state.year_info = event.target.value;
      if (this.state.year_info === "") {
        this.find();
      }
    } else {
      this.state.target_manager = event.target.value;
    }

    if (this.state.year_info === "") {
      this.setState({ year_info: this.state.year_info });
      this.setState({ target_manager: this.state.target_manager });
      return;
    }

    this.findChange();

    this.setState({ [event.target.name]: event.target.value });
  };

  selectChange = (event) => {
    var checked = this.state.checked;
    // 初期表示はFalse
    if (checked) {
      this.setState({ checked: false });
    } else {
      this.setState({ checked: true });
    }
  };
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

  render() {
    const { classes, theme, actions } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;
    const commentShokaiLink = (props) => (
      <Link to="/comment_shokai" {...props} />
    );
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

    const MyLink = (props) => <Link to="/sample" {...props} />;
    if (!this.state.checked) {
      var getData = (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>日付</CustomTableCell>
              <CustomTableCell>投票・コイン贈与</CustomTableCell>
              <CustomTableCell>投票（授与）者</CustomTableCell>
              <CustomTableCell>受領コイン</CustomTableCell>
              <CustomTableCell>コメント</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.getCoinList.map((n) => {
              return (
                <TableRow className={classes.row} key={n.id}>
                  <CustomTableCell> {n.insert_tm}</CustomTableCell>
                  <CustomTableCell>{n.title}</CustomTableCell>
                  <CustomTableCell>{n.shimei}</CustomTableCell>
                  <CustomTableCell numeric>{n.coin}</CustomTableCell>
                  <CustomTableCell>
                    <Button
                      variant="raised"
                      color="default"
                      size="large"
                      className={classes.button}
                      onClick={() => {
                        actions.setData(
                          n.t_tohyo_pk,
                          n.t_zoyo_pk,
                          n.title,
                          n.shimei,
                          n.coin
                        );
                        sessionStorage.setItem(
                          "year_info",
                          this.state.year_info
                        );
                        sessionStorage.setItem(
                          "target_manager",
                          this.state.target_manager
                        );
                        sessionStorage.setItem("checked", this.state.checked);
                      }}
                      component={commentShokaiLink}
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
      );
      var takeData = (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>日付</CustomTableCell>
              <CustomTableCell>投票・コイン贈与</CustomTableCell>
              <CustomTableCell>投票（受領）相手</CustomTableCell>
              <CustomTableCell>授与コイン</CustomTableCell>
              <CustomTableCell>コメント</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.takeCoinList.map((y) => {
              return (
                <TableRow className={classes.row} key={y.id}>
                  <CustomTableCell> {y.insert_tm}</CustomTableCell>
                  <CustomTableCell>{y.title}</CustomTableCell>
                  <CustomTableCell>{y.shimei}</CustomTableCell>
                  <CustomTableCell numeric>{y.coin}</CustomTableCell>
                  <CustomTableCell>
                    <Button
                      variant="raised"
                      color="default"
                      size="large"
                      className={classes.button}
                      onClick={() => {
                        actions.setData(
                          y.t_tohyo_pk,
                          y.t_zoyo_pk,
                          y.title,
                          y.shimei,
                          y.coin
                        );
                        sessionStorage.setItem(
                          "year_info",
                          this.state.year_info
                        );
                        sessionStorage.setItem(
                          "target_manager",
                          this.state.target_manager
                        );
                        sessionStorage.setItem("checked", this.state.checked);
                      }}
                      component={commentShokaiLink}
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
      );
    } else {
      var getData = (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>日付</CustomTableCell>
              <CustomTableCell>投票・コイン贈与</CustomTableCell>
              <CustomTableCell>投票（授与）者</CustomTableCell>
              <CustomTableCell>受領コイン</CustomTableCell>
              <CustomTableCell>コメント</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.getCoinAllList.map((n) => {
              return (
                <TableRow className={classes.row} key={n.id}>
                  <CustomTableCell> {n.insert_tm}</CustomTableCell>
                  <CustomTableCell>{n.title}</CustomTableCell>
                  <CustomTableCell>{n.shimei}</CustomTableCell>
                  <CustomTableCell numeric>{n.coin}</CustomTableCell>
                  <CustomTableCell>
                    <Button
                      variant="raised"
                      color="default"
                      size="large"
                      className={classes.button}
                      onClick={() => {
                        actions.setData(
                          n.t_tohyo_pk,
                          n.t_zoyo_pk,
                          n.title,
                          n.shimei,
                          n.coin
                        );
                        sessionStorage.setItem(
                          "year_info",
                          this.state.year_info
                        );
                        sessionStorage.setItem(
                          "target_manager",
                          this.state.target_manager
                        );
                        sessionStorage.setItem("checked", this.state.checked);
                      }}
                      component={commentShokaiLink}
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
      );
      var takeData = (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>日付</CustomTableCell>
              <CustomTableCell>投票・コイン贈与</CustomTableCell>
              <CustomTableCell>投票（受領）相手</CustomTableCell>
              <CustomTableCell>授与コイン</CustomTableCell>
              <CustomTableCell>コメント</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.takeCoinAllList.map((y) => {
              return (
                <TableRow className={classes.row} key={y.id}>
                  <CustomTableCell> {y.insert_tm}</CustomTableCell>
                  <CustomTableCell>{y.title}</CustomTableCell>
                  <CustomTableCell>{y.shimei}</CustomTableCell>
                  <CustomTableCell numeric>{y.coin}</CustomTableCell>
                  <CustomTableCell>
                    <Button
                      variant="raised"
                      color="default"
                      size="large"
                      className={classes.button}
                      onClick={() => {
                        actions.setData(
                          y.t_tohyo_pk,
                          y.t_zoyo_pk,
                          y.title,
                          y.shimei,
                          y.coin
                        );
                        sessionStorage.setItem(
                          "year_info",
                          this.state.year_info
                        );
                        sessionStorage.setItem(
                          "target_manager",
                          this.state.target_manager
                        );
                        sessionStorage.setItem("checked", this.state.checked);
                      }}
                      component={commentShokaiLink}
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
      );
    }
    if (this.state.kengenCd == "1" || this.state.kengenCd == "0") {
      var targetSelect = (
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="Target_manager" className={classes.InputLabel}>
            対象（管理者用）
          </InputLabel>
          <Select
            native
            value={this.state.target_manager}
            onChange={this.handleChange}
            input={<Input name="target_manager" id="Target_Manager" />}
            className={classes.select}
          >
            <option value="" />
            {this.state.shainList.map((n) => {
              return <option value={n.t_shain_pk}>{n.shimei}</option>;
            })}
          </Select>
        </FormControl>
      );
    } else {
      var targetSelect = (
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="Target_manager" className={classes.InputLabel}>
            対象（管理者用）
          </InputLabel>
          <Select
            native
            value={this.state.target_manager}
            onChange={this.handleChange}
            input={<Input name="target_manager" id="Target_Manager" />}
            className={classes.select}
            disabled
          >
            <option value="" />
            {this.state.shainList.map((n) => {
              return <option value={n.t_shain_pk}>{n.shimei}</option>;
            })}
          </Select>
        </FormControl>
      );
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
                          id="logout"
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
            <div>
              <Paper className={classes.coinInfo}>
                <Table className={classes.coinInfoTable}>
                  <TableRow>
                    <th>
                      <form className={classes.root} autoComplete="off">
                        <FormControl className={classes.formControl}>
                          <InputLabel htmlFor="Target_year">
                            年度情報
                          </InputLabel>
                          <Select
                            native
                            value={this.state.year_info}
                            onChange={this.handleChange}
                            input={<Input name="year_info" id="Target_year" />}
                          >
                            <option value="" />
                            {this.state.yearList.map((n) => {
                              return <option value={n}>{n}</option>;
                            })}
                          </Select>
                        </FormControl>
                      </form>
                    </th>
                    <th>
                      <form className={classes.root} autoComplete="off">
                        <div>{targetSelect}</div>
                      </form>
                    </th>
                    <th>
                      <Typography style={{ marginTop: 15 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="default"
                              checked={this.state.checked}
                              value={this.state.checked}
                              onClick={(event) => this.selectChange(event)}
                            />
                          }
                          label="事務局表示"
                        />
                      </Typography>
                    </th>
                    <th>
                      <Typography component="p">発表数</Typography>
                      <Typography variant="headline" component="h3">
                        {this.state.happyoSu}
                      </Typography>
                    </th>
                  </TableRow>
                </Table>
              </Paper>
              <br />
              <Table className={classes.table}>
                <TableRow>
                  <h2>
                    <img
                      src="/images/yajirushi.png"
                      alt="サンプル"
                      align="top"
                      width="30"
                      height="30"
                      style={{ marginTop: 2 }}
                    />
                    <strong>獲得コイン情報</strong>
                  </h2>
                  <Paper className={classes.addToPaper}>
                    <CustomTableCell>{this.state.getCoin}</CustomTableCell>
                    <CustomTableCell>{this.state.allGetCoin}</CustomTableCell>
                  </Paper>
                </TableRow>
              </Table>
              <Paper className={classes.root}>
                <div>{getData}</div>
              </Paper>
              <br />
              <Table className={classes.table}>
                <TableRow>
                  <h2>
                    <img
                      src="/images/yajirushi.png"
                      alt="サンプル"
                      align="top"
                      width="30"
                      height="30"
                      style={{ marginTop: 2 }}
                    />
                    <strong>投票コイン情報</strong>
                  </h2>
                  <Paper className={classes.addToPaper}>
                    <CustomTableCell>{this.state.takeCoin}</CustomTableCell>
                    <CustomTableCell>{this.state.allTakeCoin}</CustomTableCell>
                  </Paper>
                </TableRow>
              </Table>
              <Paper className={classes.root}>
                <div>{takeData}</div>
              </Paper>
            </div>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

CoinShokaiForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
const mapState = (state) => ({
  count: state.count,
});

const mapDispatch = (dispatch) => ({
  actions: bindActionCreators(myActions, dispatch),
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState, mapDispatch)(CoinShokaiForm)
);
