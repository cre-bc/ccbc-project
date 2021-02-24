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
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import ButtonBase from "@material-ui/core/ButtonBase";
import {
  mailFolderListItems,
  otherMailFolderListItems,
  kanriListItems,
  ippanListItems,
  kojiListItems,
  systemName,
  restUrl,
  titleItems,
} from "./tileData";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";

import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Avatar from "@material-ui/core/Avatar";
import Save from "@material-ui/icons/Save";
import Menu from "@material-ui/core/Menu";

import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import Collapse from "@material-ui/core/Collapse";
import Portal from "@material-ui/core/Portal";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Icon from "@material-ui/core/Icon";
import ListItem from "@material-ui/core/ListItem";
import moment from "moment";
import "moment/locale/ja";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as myActions from "../actions/tohyo_shokai_shosai";

const restdomain = require("../common/constans.js").restdomain;

const CustomTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "whitesmoke",
    color: "#4e454a",
    fontSize: 28,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 80,
  },
  body: {
    fontSize: 24,
    paddingTop: 10,
    paddingBottom: 10,
    color: "#4e454a",
    fontWeight: 20,
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
  completed: {
    display: "inline-block",
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
  bigAvatar: {
    width: 110,
    height: 110,
  },
  middleAvatar: {
    width: 80,
    height: 80,
  },
  smallAvatar: {
    width: 50,
    height: 50,
  },
  paper: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
    tableLayout: "fixed",
    backgroundColor: "whitesmoke",
  },
  table: {
    marginLeft: 0,
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default,
    },
  },
  gurade: {
    background: "linear-gradient(90deg, #FF1493 100%, #f5f5f5 0%)",
  },
  gurade2: {
    background: "linear-gradient(90deg, #FF1493 90%, #f5f5f5 95%)",
  },
  gurade3: {
    background: "linear-gradient(90deg, #FF1493 70%, #f5f5f5 75%)",
  },
  gurade4: {
    background: "linear-gradient(90deg, #FF1493 50%, #f5f5f5 55%)",
  },
  gurade5: {
    background: "linear-gradient(90deg, #FF1493 20%, #f5f5f5 25%)",
  },
  coin: {
    width: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  rankAvatar: {
    paddingLeft: 30,
  },
  rankTitle: {
    whiteSpace: "nowrap",
    marginTop: "15px",
  },
  td: {
    paddingLeft: "240px",
  },
  medalAvatar: {
    width: 130,
    height: 130,
  },
  shimei: {
    paddingRight: 50,
    whiteSpace: "nowrap",
  },
  nendo_senkyo_name: {
    padding: 20,
    marginTop: 10,
  },
  nendo_senkyo_table: {
    width: 500,
  },
  body_name: {
    paddingLeft: 125,
    color: "#393f4c",
  },
  head_name: {
    paddingLeft: 30,
    color: "#393f4c",
  },
  coinAvater: {
    width: 40,
    height: 40,
    align: "top",
  },
  rank1: {
    fontSize: 40,
  },
  rank1Name: {
    fontSize: 40,
    color: "#393f4c",
  },
  rank2: {
    fontSize: 35,
    color: "#393f4c",
  },
  background1: {
    position: "relative",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  background1Shift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "background1Shift-before": {
    content: " ",
    position: "absolute",
    top: "100%",
    left: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: "0 10 10 0",
    borderColor: "transparent",
    borderRightColor: "#a6a6a6",
  },
  "background1-after": {
    content: " ",
    position: "absolute",
    top: "100%",
    right: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: "10 10 0 0",
    borderColor: "transparent",
    borderTopColor: "#a6a6a6",
  },
});

class TohyoShokaiKobetsuForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    comment: {},
    haifuCoin: 150,
    tohyoCoin: 0,
    resultList: [],
    resultList2: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    tSenkyoPk: 0,
    pName: "",
    pNendo: "",
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
      this.setState({ tShainPk: loginInfo["tShainPk"] });
      this.state.tShainPk = Number(loginInfo["tShainPk"]);
      this.setState({ imageFileName: loginInfo["imageFileName"] });
      this.setState({ shimei: loginInfo["shimei"] });
      this.setState({ kengenCd: loginInfo["kengenCd"] });

      // 遷移元画面からの引き渡しパラメータ
      const { tohyoShokaiKobetsu } = this.props;
      if (tohyoShokaiKobetsu.pSenkyoPk === 0) {
        var tohyoShosaiKobetsuParamInfo = JSON.parse(
          sessionStorage.getItem("tohyoShosaiKobetsuParamInfo")
        )[0];
        this.state.tSenkyoPk = tohyoShosaiKobetsuParamInfo["tSenkyoPk"];
        this.state.pName = tohyoShosaiKobetsuParamInfo["pName"];
        this.state.pNendo = tohyoShosaiKobetsuParamInfo["pNendo"];
      } else {
        this.state.tSenkyoPk = tohyoShokaiKobetsu.pSenkyoPk;
        this.state.pName = tohyoShokaiKobetsu.pName;
        this.state.pNendo = tohyoShokaiKobetsu.pNendo;

        var tohyoShosaiKobetsuParamInfo = [
          {
            tSenkyoPk: tohyoShokaiKobetsu.pSenkyoPk,
            pName: tohyoShokaiKobetsu.pName,
            pNendo: tohyoShokaiKobetsu.pNendo,
          },
        ];
        sessionStorage.setItem(
          "tohyoShosaiKobetsuParamInfo",
          JSON.stringify(tohyoShosaiKobetsuParamInfo)
        );
      }

      request
        .post(restdomain + "/tohyo_shokai_kobetsu/find")
        .send(this.state)
        .end((err, res) => {
          if (err) return;
          // 検索結果表示
          this.setState({ resultList: res.body.data });
          this.setState({ resultList2: res.body.data2 });
        });
    }
  }

  handleChange = (name, cnt) => (event) => {
    this.setState({
      [name[cnt]]: event.target.value,
    });
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

  handleClick = (event) => {
    const { tohyo_shokai_shosai, actions } = this.props;

    var tSenkyoPk = event.currentTarget.getAttribute("data-tSenkyoPk");
    var tPresenterPk = event.currentTarget.getAttribute("data-tPresenterPk");
    var tRank = Number(event.currentTarget.getAttribute("data-rank")) + 1;
    var tTotalCoin = event.currentTarget.getAttribute("data-sumCoin");

    actions.setTohyoShokaiShosaiData(
      tPresenterPk,
      tSenkyoPk,
      tRank,
      tTotalCoin
    );
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;
    const tohyoShokaiShosaiLink = (props) => (
      <Link to="/tohyo_shokai_shosai" {...props} />
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
              <Paper className={classes.nendo_senkyo_name}>
                <Table className={classes.nendo_senkyo_table}>
                  <TableRow>
                    <th>
                      <Typography component="p">年度</Typography>
                      <Typography variant="headline" component="h3">
                        {this.state.pNendo}年
                      </Typography>
                    </th>
                    <th>
                      <Typography component="p">選挙名</Typography>
                      <Typography variant="headline" component="h3">
                        {this.state.pName}
                      </Typography>
                    </th>
                  </TableRow>
                </Table>
              </Paper>
              <br />
              <br />
              <h2>
                <img
                  src="/images/yajirushi.png"
                  alt="サンプル"
                  align="top"
                  width="30"
                  height="30"
                  style={{ marginTop: 2 }}
                />
                <strong>ランキング</strong>
              </h2>
              <Paper className={classes.paper}>
                <Table className={classes.table}>
                  <TableHead>
                    {this.state.resultList.map((n) => {
                      return (
                        <TableRow className={classes.background1}>
                          <CustomTableCell
                            component="th"
                            scope="row"
                            className={classes.rankAvatar}
                          >
                            {(() => {
                              if (n.rank === "0") {
                                return (
                                  <Avatar
                                    alt="金メダル"
                                    src="/images/medal_g_n.png"
                                    className={classes.medalAvatar}
                                  />
                                );
                              } else if (n.rank === "1") {
                                return (
                                  <Avatar
                                    alt="銀メダル"
                                    src="/images/medal_s_n.png"
                                    className={classes.medalAvatar}
                                  />
                                );
                              } else if (n.rank === "2") {
                                return (
                                  <Avatar
                                    alt="銅メダル"
                                    src="/images/medal_c_n.png"
                                    className={classes.medalAvatar}
                                  />
                                );
                              }
                              return (
                                <CustomTableCell
                                  component="th"
                                  scope="row"
                                  style={{ paddingLeft: 35, border: 0 }}
                                >
                                  NO.{Number(n.rank) + 1}
                                </CustomTableCell>
                              );
                            })()}
                          </CustomTableCell>
                          <CustomTableCell>
                            <Table>
                              <TableHead>
                                {(() => {
                                  if (n.rank === "0") {
                                    return (
                                      <TableRow>
                                        <CustomTableCell style={{ width: 200 }}>
                                          <Avatar
                                            alt="Remy Sharp"
                                            src={
                                              restUrl +
                                              `uploads/${n.image_file_nm}`
                                            }
                                            className={classes.bigAvatar}
                                          />
                                        </CustomTableCell>
                                        <CustomTableCell>
                                          <Typography
                                            href="#"
                                            className={classes.rank1Name}
                                            onClick={this.handleClick}
                                            component={tohyoShokaiShosaiLink}
                                            data-tSenkyoPk={
                                              this.state.tSenkyoPk
                                            }
                                            data-tPresenterPk={n.t_presenter_pk}
                                            data-rank={n.rank}
                                            data-sumCoin={n.sumCoin}
                                          >
                                            {n.shimei}
                                          </Typography>
                                        </CustomTableCell>
                                      </TableRow>
                                    );
                                  } else if (n.rank === "1") {
                                    return (
                                      <TableRow>
                                        <CustomTableCell style={{ width: 200 }}>
                                          <Avatar
                                            alt="Remy Sharp"
                                            src={
                                              restUrl +
                                              `uploads/${n.image_file_nm}`
                                            }
                                            className={classes.bigAvatar}
                                          />
                                        </CustomTableCell>
                                        <CustomTableCell>
                                          <Typography
                                            href="#"
                                            className={classes.rank1Name}
                                            onClick={this.handleClick}
                                            component={tohyoShokaiShosaiLink}
                                            data-tSenkyoPk={
                                              this.state.tSenkyoPk
                                            }
                                            data-tPresenterPk={n.t_presenter_pk}
                                            data-rank={n.rank}
                                            data-sumCoin={n.sumCoin}
                                          >
                                            {n.shimei}
                                          </Typography>
                                        </CustomTableCell>
                                      </TableRow>
                                    );
                                  } else if (n.rank === "2") {
                                    return (
                                      <TableRow>
                                        <CustomTableCell style={{ width: 200 }}>
                                          <Avatar
                                            alt="Remy Sharp"
                                            src={
                                              restUrl +
                                              `uploads/${n.image_file_nm}`
                                            }
                                            className={classes.bigAvatar}
                                          />
                                        </CustomTableCell>
                                        <CustomTableCell>
                                          <Typography
                                            href="#"
                                            className={classes.rank1Name}
                                            onClick={this.handleClick}
                                            component={tohyoShokaiShosaiLink}
                                            data-tSenkyoPk={
                                              this.state.tSenkyoPk
                                            }
                                            data-tPresenterPk={n.t_presenter_pk}
                                            data-rank={n.rank}
                                            data-sumCoin={n.sumCoin}
                                          >
                                            {n.shimei}
                                          </Typography>
                                        </CustomTableCell>
                                      </TableRow>
                                    );
                                  }
                                  return (
                                    <TableRow>
                                      <CustomTableCell style={{ width: 200 }}>
                                        <Avatar
                                          alt="Remy Sharp"
                                          src={
                                            restUrl +
                                            `uploads/${n.image_file_nm}`
                                          }
                                          className={classes.bigAvatar}
                                        />
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        <Typography
                                          href="#"
                                          className={classes.rank1Name}
                                          onClick={this.handleClick}
                                          component={tohyoShokaiShosaiLink}
                                          data-tSenkyoPk={this.state.tSenkyoPk}
                                          data-tPresenterPk={n.t_presenter_pk}
                                          data-rank={n.rank}
                                          data-sumCoin={n.sumCoin}
                                        >
                                          {n.shimei}
                                        </Typography>
                                      </CustomTableCell>
                                    </TableRow>
                                  );
                                })()}
                                <TableRow>
                                  {(() => {
                                    if (n.rank === "0") {
                                      return (
                                        <CustomTableCell
                                          colspan="2"
                                          className={classes.rankTitle}
                                        >
                                          <span className={classes.rank1}>
                                            {n.title}
                                          </span>
                                        </CustomTableCell>
                                      );
                                    } else if (n.rank === "1") {
                                      return (
                                        <CustomTableCell
                                          colspan="2"
                                          className={classes.rankTitle}
                                        >
                                          <span className={classes.rank1}>
                                            {n.title}
                                          </span>
                                        </CustomTableCell>
                                      );
                                    } else if (n.rank === "2") {
                                      return (
                                        <CustomTableCell
                                          colspan="2"
                                          className={classes.rankTitle}
                                        >
                                          <span className={classes.rank1}>
                                            {n.title}
                                          </span>
                                        </CustomTableCell>
                                      );
                                    }
                                    return (
                                      <CustomTableCell
                                        colspan="2"
                                        className={classes.rankTitle}
                                      >
                                        <span className={classes.rank1}>
                                          {n.title}
                                        </span>
                                      </CustomTableCell>
                                    );
                                  })()}
                                  {(() => {
                                    if (n.rank === "0") {
                                      return (
                                        <CustomTableCell
                                          className={classes.coin}
                                        >
                                          <Typography
                                            style={{ fontSize: "180%" }}
                                          >
                                            <img
                                              alt="コイン"
                                              src="/images/coin.png"
                                              className={classes.coinAvater}
                                            />
                                            {n.sumCoin}
                                          </Typography>
                                          <div
                                            style={{
                                              background:
                                                "linear-gradient(90deg, #FF1493 " +
                                                n.bar +
                                                "%, #f5f5f5 " +
                                                n.bar +
                                                "%)",
                                            }}
                                          >
                                            <br />
                                          </div>
                                        </CustomTableCell>
                                      );
                                    } else if (n.rank === "1") {
                                      return (
                                        <CustomTableCell
                                          className={classes.coin}
                                        >
                                          <Typography
                                            style={{ fontSize: "180%" }}
                                          >
                                            <img
                                              alt="コイン"
                                              src="/images/coin.png"
                                              className={classes.coinAvater}
                                            />
                                            {n.sumCoin}
                                          </Typography>
                                          <div
                                            style={{
                                              background:
                                                "linear-gradient(90deg, #FF1493 " +
                                                n.bar +
                                                "%, #f5f5f5 " +
                                                n.bar +
                                                "%)",
                                            }}
                                          >
                                            <br />
                                          </div>
                                        </CustomTableCell>
                                      );
                                    } else if (n.rank === "2") {
                                      return (
                                        <CustomTableCell
                                          className={classes.coin}
                                        >
                                          <Typography
                                            style={{ fontSize: "180%" }}
                                          >
                                            <img
                                              alt="コイン"
                                              src="/images/coin.png"
                                              className={classes.coinAvater}
                                            />
                                            {n.sumCoin}
                                          </Typography>
                                          <div
                                            style={{
                                              background:
                                                "linear-gradient(90deg, #FF1493 " +
                                                n.bar +
                                                "%, #f5f5f5 " +
                                                n.bar +
                                                "%)",
                                            }}
                                          >
                                            <br />
                                          </div>
                                        </CustomTableCell>
                                      );
                                    } else if (n.rank === "3") {
                                      return (
                                        <CustomTableCell
                                          className={classes.coin}
                                        >
                                          <Typography
                                            style={{ fontSize: "180%" }}
                                          >
                                            <img
                                              alt="コイン"
                                              src="/images/coin.png"
                                              className={classes.coinAvater}
                                            />
                                            {n.sumCoin}
                                          </Typography>
                                          <div
                                            style={{
                                              background:
                                                "linear-gradient(90deg, #FF1493 " +
                                                n.bar +
                                                "%, #f5f5f5 " +
                                                n.bar +
                                                "%)",
                                            }}
                                          >
                                            <br />
                                          </div>
                                        </CustomTableCell>
                                      );
                                    }
                                    return (
                                      <CustomTableCell
                                        component="th"
                                        scope="row"
                                        className={classes.coin}
                                      >
                                        <Typography
                                          style={{ fontSize: "180%" }}
                                        >
                                          <img
                                            alt="コイン"
                                            src="/images/coin.png"
                                            width="30"
                                            height="30"
                                          />
                                          {n.sumCoin}
                                        </Typography>
                                        <div
                                          style={{
                                            background:
                                              "linear-gradient(90deg, #FF1493 " +
                                              n.bar +
                                              "%, #f5f5f5 " +
                                              n.bar +
                                              "%)",
                                          }}
                                        >
                                          <br />
                                        </div>
                                      </CustomTableCell>
                                    );
                                  })()}
                                </TableRow>
                              </TableHead>
                            </Table>
                          </CustomTableCell>
                        </TableRow>
                      );
                    })}
                  </TableHead>
                </Table>
              </Paper>
              <br />
              <br />
              <h2>
                <img
                  src="/images/yajirushi.png"
                  alt="サンプル"
                  align="top"
                  width="30"
                  height="30"
                  style={{ marginTop: 2 }}
                />
                <strong>未投票者</strong>
              </h2>
              <Table className={classes.nendo_senkyo_table}>
                <Paper className={classes.nendo_senkyo_name}>
                  <Typography component="p">氏名（漢字）</Typography>
                  <Typography variant="headline" component="h3">
                    {this.state.resultList2.map((n) => {
                      return <div>{n.shimei}</div>;
                    })}
                  </Typography>
                </Paper>
              </Table>
            </div>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

TohyoShokaiKobetsuForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  tohyoShokaiKobetsu: state.tohyoShokaiKobetsu,
  tohyo_shokai_shosai: state.tohyoShokaiShosai,
});

const mapDispatch = (dispatch) => ({
  actions: bindActionCreators(myActions, dispatch),
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState, mapDispatch)(TohyoShokaiKobetsuForm)
);
