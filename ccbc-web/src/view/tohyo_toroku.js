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
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Avatar from "@material-ui/core/Avatar";
import Save from "@material-ui/icons/Save";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const restdomain = require("../common/constans.js").restdomain;

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
  headLine: {},
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 500,
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
});

function getSteps1() {
  return ["", "", "", "", "", "", "", "", "", ""];
}

function getSteps2() {
  return ["", "", "", "", "", "", "", "", "", ""];
}

function getSteps3() {
  return ["", "", "", "", "", "", "", "", "", ""];
}

function getSteps4() {
  return ["", "", "", "", "", "", "", "", "", ""];
}

function getSteps5() {
  return ["", "", "", "", "", "", "", "", "", ""];
}

class TohyoTorokuForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    activeStep1: [],
    activeStep2: [],
    activeStep3: [],
    activeStep4: [],
    activeStep5: [],
    completed: {},
    comment: [],
    coin: 0,
    tohyoCoin: 0,
    headList: [],
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    configCoin: 0,
    submitFlg: true,
    alertOpen: false,
    dialogOpen: false,
    tokenId: null,
    msg: null,
    loadFlg: false,
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
      this.setState({ tokenId: loginInfo["tokenId"] });
    }

    request
      .post(restdomain + "/tohyo_toroku/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          return;
        }
        var resList = res.body.data;
        var head = [];
        if (resList.length === 0) {
          head.push(false);
        } else {
          head.push(true);
        }
        // 検索結果表示
        this.setState({ resultList: resList });
        this.setState({ headList: head });

        for (var i in resList) {
          this.state.activeStep1[i] = 4;
          this.state.activeStep2[i] = 4;
          this.state.activeStep3[i] = 4;
          this.state.activeStep4[i] = 0;
          this.state.activeStep5[i] = 0;
          this.state.config_coin = resList[i].config_coin;
        }
        this.calculateCoin();
      });
  }

  calculatePointLine = (index) => {
    var sum = 0;
    sum += this.state.activeStep1[index] + 1;
    sum += this.state.activeStep2[index] + 1;
    sum += this.state.activeStep3[index] + 1;
    sum += this.state.activeStep4[index] + 1;
    sum += this.state.activeStep5[index] + 1;
    return sum;
  };

  calculateCoinLine = (index) => {
    var sum = 0;
    sum += this.state.activeStep1[index] + 1;
    sum += this.state.activeStep2[index] + 1;
    sum += this.state.activeStep3[index] + 1;
    sum += this.state.activeStep4[index] + 1;
    sum += this.state.activeStep5[index] + 1;
    return sum * this.state.config_coin;
  };

  calculateCoin = () => {
    var sum = 0;
    for (var i in this.state.resultList) {
      sum += this.state.activeStep1[i] + 1;
      sum += this.state.activeStep2[i] + 1;
      sum += this.state.activeStep3[i] + 1;
      sum += this.state.activeStep4[i] + 1;
      sum += this.state.activeStep5[i] + 1;
    }
    this.setState({ tohyoCoin: sum });
    this.state.tohyoCoin = sum;
  };

  getCalculateCoin = () => {
    var sum = 0;
    for (var i in this.state.resultList) {
      sum += this.state.activeStep1[i] + 1;
      sum += this.state.activeStep2[i] + 1;
      sum += this.state.activeStep3[i] + 1;
      sum += this.state.activeStep4[i] + 1;
      sum += this.state.activeStep5[i] + 1;
    }
    return sum * this.state.resultList[0].config_coin;
  };

  // ★★パフォーマンス改善により、setState→refsへ修正（onChangeを排除）
  // handleChange = (name, cnt) => event => {
  //   // テキストフィールドのonChangeイベントでsetStateすると劇遅になる
  //   const comment_copy = this.state.comment.slice()
  //   comment_copy[cnt] = event.target.value
  //   //this.state.comment = comment_copy
  //   this.setState({ comment: comment_copy })

  //   //this.state.comment[cnt] = event.target.value

  //   var flg = false
  //   for (var i in this.state.resultList) {
  //     if (
  //       typeof this.state.comment[i] === 'undefined' ||
  //       (this.state.comment[i] != null && this.state.comment[i].length === 0)
  //     ) {
  //       flg = true
  //     }
  //   }
  //   this.state.submitFlg = flg
  // }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleStep1 = (step1, cnt) => () => {
    const activeStep1_copy = this.state.activeStep1.slice();
    activeStep1_copy[cnt] = step1;
    this.setState({ activeStep1: activeStep1_copy });
    this.calculateCoin();
  };

  handleStep2 = (step2, cnt) => () => {
    const activeStep2_copy = this.state.activeStep2.slice();
    activeStep2_copy[cnt] = step2;
    this.setState({ activeStep2: activeStep2_copy });
    this.calculateCoin();
  };

  handleStep3 = (step3, cnt) => () => {
    const activeStep3_copy = this.state.activeStep3.slice();
    activeStep3_copy[cnt] = step3;
    this.setState({ activeStep3: activeStep3_copy });
    this.calculateCoin();
  };

  handleStep4 = (step4, cnt) => () => {
    const activeStep4_copy = this.state.activeStep4.slice();
    activeStep4_copy[cnt] = step4;
    this.setState({ activeStep4: activeStep4_copy });
    this.calculateCoin();
  };

  handleStep5 = (step5, cnt) => () => {
    const activeStep5_copy = this.state.activeStep5.slice();
    activeStep5_copy[cnt] = step5;
    this.setState({ activeStep5: activeStep5_copy });
    this.calculateCoin();
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

  handleCheck() {
    var flg = false;
    for (var i in this.state.resultList) {
      if (
        typeof this.state.comment[i].value === "undefined" ||
        (this.state.comment[i].value != null &&
          this.state.comment[i].value.length === 0)
      ) {
        flg = true;
      }
    }
    this.state.submitFlg = flg;

    if (this.state.submitFlg === true) {
      this.setState({ alertOpen: true });
      return;
    }
    this.setState({ dialogOpen: true });
  }

  handleSubmit = () => {
    this.setState({ loadFlg: true });
    var bkcomment = this.state.comment;
    const comment_copy = this.state.comment.slice();
    for (var i in this.state.comment) {
      comment_copy[i] = this.state.comment[i].value;
    }
    this.state.comment = comment_copy;

    request
      .post(restdomain + "/tohyo_toroku/create")
      .send(this.state)
      .end((err, res) => {
        this.setState({ loadFlg: false });
        if (err) {
          return;
        }
        if (!res.body.status) {
          this.setState({
            msg: "不正なログインです。",
          });
          this.setState({ dialogOpen: false });
          this.state.comment = bkcomment;
          return;
        }
        this.props.history.push("/menu");
      });
  };

  handleClose = () => {
    this.setState({ alertOpen: false });
    this.setState({ dialogOpen: false });
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;
    const MenuLink = (props) => <Link to="/menu" {...props} />;

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

    const steps1 = getSteps1();
    const steps2 = getSteps2();
    const steps3 = getSteps3();
    const steps4 = getSteps4();
    const steps5 = getSteps5();
    const {
      activeStep1,
      activeStep2,
      activeStep3,
      activeStep4,
      activeStep5,
    } = this.state;

    const infoHelp = (
      <div>
        <div>発表者に対して評価とコメントをつけて下さい。</div>
        <div>（配布しきれなかったコインは自動で回収されます）</div>
      </div>
    );

    var head = this.state.headList.map((data, i) => {
      if (!data) {
        return (
          <Card className={classes.card}>
            <CardContent>
              <Typography gutterBottom variant="headline" component="h2">
                有効な選挙がありません。
              </Typography>
            </CardContent>
          </Card>
        );
      } else {
        return (
          <Card className={classes.card}>
            <CardContent>
              <Typography
                component="p"
                style={{
                  color: "red",
                }}
              >
                {this.state.msg}
              </Typography>
              <Typography gutterBottom variant="headline" component="h2">
                {this.state.resultList[0].senkyo_nm}
              </Typography>
              <Typography component="p" style={{ fontSize: "120%" }}>
                <Tooltip id="tooltip-right" title={infoHelp} placement="right">
                  <label>
                    投票コイン数：{this.getCalculateCoin()}コイン（
                    {this.state.resultList[0].config_coin}コイン/1点）
                  </label>
                </Tooltip>
              </Typography>
            </CardContent>
          </Card>
        );
      }
    });

    var resList = this.state.resultList.map((data, i) => {
      return (
        <div>
          <Paper className={classes.paper}>
            <Table className={classes.table}>
              <TableBody>
                <TableRow>
                  <div>
                    <table>
                      <tr>
                        <td rowspan="3" width="28%">
                          <Avatar
                            alt="Adelle Charles"
                            src={restUrl + `uploads/${data.image_file_nm}`}
                            className={classNames(
                              classes.avatar,
                              classes.bigAvatar
                            )}
                          />
                        </td>

                        <td width="7%" className={classes.tdSize}>
                          <Tooltip
                            id="tooltip-right"
                            title={documentHelp}
                            placement="right"
                          >
                            <label>資料作成</label>
                          </Tooltip>
                        </td>
                        <td width="25%">
                          <Stepper
                            nonLinear
                            activeStep={activeStep1[i]}
                            className={classes.stepSize2}
                          >
                            {steps1.map((label, index) => {
                              return (
                                <Step key={label} className={classes.stepSize2}>
                                  <StepButton
                                    onClick={this.handleStep1(index, i)}
                                    completed={this.state.completed[index]}
                                    className={classes.stepSize2}
                                  >
                                    {label}
                                  </StepButton>
                                </Step>
                              );
                            })}
                          </Stepper>
                        </td>
                        <td rowspan="6">
                          <TextField
                            id="comment"
                            name="comment"
                            label="コメント"
                            multiline
                            rows="12"
                            rowsMax="12"
                            inputRef={(input) => {
                              this.state.comment[i] = input;
                            }}
                            className={classes.textField}
                            margin="normal"
                            style={{ fontSize: "120%" }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className={classes.tdSize}>
                          <Tooltip
                            id="tooltip-right"
                            title={presentationHelp}
                            placement="right"
                          >
                            <label>発表力</label>
                          </Tooltip>
                        </td>
                        <td>
                          <Stepper
                            nonLinear
                            activeStep={activeStep2[i]}
                            className={classes.stepSize2}
                          >
                            {steps2.map((label, index) => {
                              return (
                                <Step key={label} className={classes.stepSize2}>
                                  <StepButton
                                    onClick={this.handleStep2(index, i)}
                                    completed={this.state.completed[index]}
                                    className={classes.stepSize2}
                                  >
                                    {label}
                                  </StepButton>
                                </Step>
                              );
                            })}
                          </Stepper>
                        </td>
                      </tr>
                      <tr>
                        <td className={classes.tdSize}>
                          <Tooltip
                            id="tooltip-right"
                            title={expressionHelp}
                            placement="right"
                          >
                            <label>表現力</label>
                          </Tooltip>
                        </td>
                        <td>
                          <Stepper
                            nonLinear
                            activeStep={activeStep3[i]}
                            className={classes.stepSize2}
                          >
                            {steps3.map((label, index) => {
                              return (
                                <Step key={label} className={classes.stepSize2}>
                                  <StepButton
                                    onClick={this.handleStep3(index, i)}
                                    completed={this.state.completed[index]}
                                    className={classes.stepSize2}
                                  >
                                    {label}
                                  </StepButton>
                                </Step>
                              );
                            })}
                          </Stepper>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Typography
                            variant="headline"
                            className={classes.headLine}
                          >
                            {data.title}
                          </Typography>
                        </td>

                        <td className={classes.tdSize}>
                          <Tooltip
                            id="tooltip-right"
                            title={influenceHelp}
                            placement="right"
                          >
                            <label>影響力</label>
                          </Tooltip>
                        </td>
                        <td>
                          <Stepper
                            nonLinear
                            activeStep={activeStep4[i]}
                            className={classes.stepSize2}
                          >
                            {steps4.map((label, index) => {
                              return (
                                <Step key={label} className={classes.stepSize2}>
                                  <StepButton
                                    onClick={this.handleStep4(index, i)}
                                    completed={this.state.completed[index]}
                                    className={classes.stepSize2}
                                  >
                                    {label}
                                  </StepButton>
                                </Step>
                              );
                            })}
                          </Stepper>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Typography
                            variant="subheading"
                            style={{ fontSize: "120%" }}
                          >
                            {data.shimei}
                          </Typography>
                        </td>

                        <td className={classes.tdSize}>
                          <Tooltip
                            id="tooltip-right"
                            title={breakthroughHelp}
                            placement="right"
                          >
                            <label>限界突破</label>
                          </Tooltip>
                        </td>
                        <td>
                          <Stepper
                            nonLinear
                            activeStep={activeStep5[i]}
                            className={classes.stepSize2}
                          >
                            {steps5.map((label, index) => {
                              return (
                                <Step key={label} className={classes.stepSize2}>
                                  <StepButton
                                    onClick={this.handleStep5(index, i)}
                                    completed={this.state.completed[index]}
                                    className={classes.stepSize2}
                                  >
                                    {label}
                                  </StepButton>
                                </Step>
                              );
                            })}
                          </Stepper>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Typography
                            variant="subheading"
                            style={{ fontSize: "140%" }}
                          >
                            {this.calculatePointLine(i)}点<label>　</label>
                            {this.calculateCoinLine(i)}コイン
                          </Typography>
                        </td>
                      </tr>
                    </table>
                  </div>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          {(() => {
            if (i === this.state.resultList.length - 1) {
              return (
                <div>
                  <br />
                  <Button
                    className={classes.button}
                    variant="raised"
                    size="large"
                    onClick={this.handleCheck.bind(this)}
                    //disabled={this.state.submitFlg}
                  >
                    <Save
                      className={classNames(
                        classes.leftIcon,
                        classes.iconSmall
                      )}
                    />
                    SAVE
                  </Button>
                  <Dialog
                    open={this.state.alertOpen}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      {"警告メッセージ"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        コメントはすべて入力してください。
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.handleClose}
                        color="primary"
                        autoFocus
                      >
                        はい
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Dialog
                    open={this.state.dialogOpen}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    disableBackdropClick={true}
                  >
                    <DialogTitle id="alert-dialog-title">
                      {"確認メッセージ"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        入力情報を登録してよろしいですか？
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        autoFocus
                        disabled={this.state.loadFlg}
                      >
                        はい
                      </Button>
                      <Button
                        onClick={this.handleClose}
                        color="primary"
                        disabled={this.state.loadFlg}
                      >
                        いいえ
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              );
            }
          })()}
        </div>
      );
    });

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
            <form className={classes.container} noValidate autoComplete="off">
              <div>{head}</div>
              <div>{resList}</div>
            </form>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

TohyoTorokuForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(TohyoTorokuForm);
