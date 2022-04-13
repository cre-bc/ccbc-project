import React from "react";
import request from "superagent";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import {
  kanriListItems,
  systemName,
  restUrl,
  documentHelp,
  presentationHelp,
  expressionHelp,
  influenceHelp,
  breakthroughHelp,
  titleItems,
} from "./tileData";

import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Avatar from "@material-ui/core/Avatar";

import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import pink from "@material-ui/core/colors/pink";
import green from "@material-ui/core/colors/green";
import Slide from "@material-ui/core/Slide";
import MenuItem from "@material-ui/core/MenuItem";

const restdomain = require("../common/constans.js").restdomain;

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  table: {
    minWidth: 1020,
    fontSize: "18px",
  },
  listroot: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
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
  completed: {
    display: "inline-block",
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  textField2: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
  stepSize: {
    width: 20,
    height: 10,
    textAlign: "left",
    verticalAlign: "top",
  },
  stepSize2: {
    width: 15,
    height: 20,
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
  pinkAvatar: {
    margin: 10,
    color: "#fff",
    backgroundColor: pink[500],
  },
  greenAvatar: {
    margin: 10,
    color: "#fff",
    backgroundColor: green[500],
  },
  row: {
    display: "flex",
    justifyContent: "center",
  },
  button: {
    margin: theme.spacing.unit,
  },
  paperroot: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textFieldDate: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  rootRadio: {
    display: "flex",
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
  rootSelect: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControlSelect: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  rootTable: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
  },
  textFieldTextField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },
  formControlComponents: {
    margin: theme.spacing.unit,
  },
});

function getSteps1() {
  return ["", "", "", "", "", "", "", "", "", ""];
}

class CommentShokaiForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    comment: {},
    haifuCoin: 150,
    tohyoCoin: 0,
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    checkedA: true,
    checkedB: true,
    checkedF: true,
    value: "female",
    age: "",
    name: "hai",
    name2: "Cat in the Hat",
    age2: "",
    multiline: "Controlled",
    currency: "EUR",
    name3: "Composed TextField",
    tTohyoPk: null,
    tZoyoPk: null,
    title: "",
    tohyosha: "",
    coin: 0,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };
  handleChange2 = (event) => {
    this.setState({ value: event.target.value });
  };
  handleChangeSelect = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handleChange3 = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };
  handleChange4 = (event) => {
    this.setState({ name: event.target.value });
  };
  constructor(props) {
    super(props);
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    // 遷移元画面からの引き渡しパラメータ
    const { coinShokai } = this.props;
    // if (coinShokai.tTohyoPk != null) {
    //   this.state.tTohyoPk = Number(coinShokai.tTohyoPk)
    // }
    // if (coinShokai.tZoyoPk != null) {
    //   this.state.tZoyoPk = Number(coinShokai.tZoyoPk)
    // }
    // this.state.title = coinShokai.title
    // this.state.tohyosha = coinShokai.tohyosha
    // this.state.coin = coinShokai.coin
    if (coinShokai.tTohyoPk === 0) {
      var commentShokaiParamInfo = JSON.parse(
        sessionStorage.getItem("commentShokaiParamInfo")
      )[0];
      if (commentShokaiParamInfo["tTohyoPk"] != null) {
        this.state.tTohyoPk = Number(commentShokaiParamInfo["tTohyoPk"]);
        this.state.tZoyoPk = null;
      } else {
        this.state.tZoyoPk = Number(commentShokaiParamInfo["tZoyoPk"]);
        this.state.tTohyoPk = null;
      }
      this.state.title = commentShokaiParamInfo["title"];
      this.state.tohyosha = commentShokaiParamInfo["tohyosha"];
      this.state.coin = commentShokaiParamInfo["coin"];
    } else {
      if (coinShokai.tTohyoPk != null) {
        this.state.tTohyoPk = Number(coinShokai.tTohyoPk);
        this.state.tZoyoPk = null;
      } else {
        this.state.tZoyoPk = Number(coinShokai.tZoyoPk);
        this.state.tTohyoPk = null;
      }
      this.state.title = coinShokai.title;
      this.state.tohyosha = coinShokai.tohyosha;
      this.state.coin = coinShokai.coin;

      var commentShokaiParamInfo = [
        {
          tTohyoPk: this.state.tTohyoPk,
          tZoyoPk: this.state.tZoyoPk,
          title: this.state.title,
          tohyosha: this.state.tohyosha,
          coin: this.state.coin,
        },
      ];

      sessionStorage.setItem(
        "commentShokaiParamInfo",
        JSON.stringify(commentShokaiParamInfo)
      );
    }

    // セッションストレージからログイン情報を取得
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
    }

    request
      .post(restdomain + "/comment_shokai/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          return;
        }
        var resList = res.body.data;
        this.setState({ resultList: resList });
      });
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
  };
  handleChangeChecked = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };

  render() {
    const { classes, theme, coinShokai } = this.props;
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
    const steps1 = getSteps1();

    var resList = this.state.resultList.map((data, i) => {
      if (this.state.tTohyoPk != null) {
        return (
          <div>
            <h2>
              <img
                src="/images/yajirushi.png"
                alt="サンプル"
                align="top"
                width="30"
                height="30"
                style={{ marginTop: 2 }}
              />
              <strong>コメント情報</strong>
            </h2>
            <Paper className={classes.root}>
              <TableBody className={classes.table}>
                <TableRow component="th" scope="row">
                  <TableCell style={{ fontSize: "18px" }}>
                    投票・コイン贈与
                  </TableCell>
                  <TableCell style={{ fontSize: "18px", minWidth: "300px" }}>
                    {this.state.title}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    投票（授与）者
                  </TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    {this.state.tohyosha}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>受領コイン</TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    {this.state.coin}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Tooltip
                      id="tooltip-right"
                      title={documentHelp}
                      placement="right"
                    >
                      <label>資料作成</label>
                    </Tooltip>
                  </TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Stepper
                      nonLinear
                      activeStep={data.hyoka1 - 1}
                      className={classes.stepSize2}
                    >
                      {steps1.map((label, index) => {
                        return (
                          <Step key={label} className={classes.stepSize2}>
                            <StepButton
                              completed={this.state.completed[index]}
                              className={classes.stepSize2}
                              disabled={true}
                            >
                              {label}
                            </StepButton>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Tooltip
                      id="tooltip-right"
                      title={presentationHelp}
                      placement="right"
                    >
                      <label>発表力</label>
                    </Tooltip>
                  </TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Stepper
                      nonLinear
                      activeStep={data.hyoka2 - 1}
                      className={classes.stepSize2}
                    >
                      {steps1.map((label, index) => {
                        return (
                          <Step key={label} className={classes.stepSize2}>
                            <StepButton
                              completed={this.state.completed[index]}
                              className={classes.stepSize2}
                              disabled={true}
                            >
                              {label}
                            </StepButton>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Tooltip
                      id="tooltip-right"
                      title={expressionHelp}
                      placement="right"
                    >
                      <label>表現力</label>
                    </Tooltip>
                  </TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Stepper
                      nonLinear
                      activeStep={data.hyoka3 - 1}
                      className={classes.stepSize2}
                    >
                      {steps1.map((label, index) => {
                        return (
                          <Step key={label} className={classes.stepSize2}>
                            <StepButton
                              completed={this.state.completed[index]}
                              className={classes.stepSize2}
                              disabled={true}
                            >
                              {label}
                            </StepButton>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Tooltip
                      id="tooltip-right"
                      title={influenceHelp}
                      placement="right"
                    >
                      <label>影響力</label>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Stepper
                      nonLinear
                      activeStep={data.hyoka4 - 1}
                      className={classes.stepSize2}
                    >
                      {steps1.map((label, index) => {
                        return (
                          <Step key={label} className={classes.stepSize2}>
                            <StepButton
                              completed={this.state.completed[index]}
                              className={classes.stepSize2}
                              disabled={true}
                            >
                              {label}
                            </StepButton>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    <Tooltip
                      id="tooltip-right"
                      title={breakthroughHelp}
                      placement="right"
                    >
                      <label>限界突破</label>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Stepper
                      nonLinear
                      activeStep={data.hyoka5 - 1}
                      className={classes.stepSize2}
                    >
                      {steps1.map((label, index) => {
                        return (
                          <Step key={label} className={classes.stepSize2}>
                            <StepButton
                              completed={this.state.completed[index]}
                              className={classes.stepSize2}
                              disabled={true}
                            >
                              {label}
                            </StepButton>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>コメント</TableCell>
                  <TableCell
                    style={{ fontSize: "18px", whiteSpace: "pre-wrap" }}
                  >
                    {data.hyoka_comment}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Paper>
          </div>
        );
      } else {
        return (
          <div>
            <h2>
              <img
                src="/images/yajirushi.png"
                alt="サンプル"
                align="top"
                width="30"
                height="30"
                style={{ marginTop: 3 }}
              />
              <strong>コメント情報</strong>
            </h2>
            <Paper className={classes.root}>
              <TableBody className={classes.table}>
                <TableRow component="th" scope="row">
                  <TableCell style={{ fontSize: "18px" }}>
                    投票・コイン贈与
                  </TableCell>
                  <TableCell style={{ fontSize: "18px", minWidth: "300px" }}>
                    {this.state.title}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>
                    投票（授与）者
                  </TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    {this.state.tohyosha}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>受領コイン</TableCell>
                  <TableCell style={{ fontSize: "18px" }}>
                    {this.state.coin}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontSize: "18px" }}>コメント</TableCell>
                  <TableCell
                    style={{ fontSize: "18px", whiteSpace: "pre-wrap" }}
                  >
                    {data.zoyo_comment}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Paper>
          </div>
        );
      }
    });

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
                    <Paper className={classes.root}>
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
            {resList}
          </main>
          {after}
        </div>
      </div>
    );
  }
}

CommentShokaiForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  coinShokai: state.coinShokai,
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState)(CommentShokaiForm)
);
