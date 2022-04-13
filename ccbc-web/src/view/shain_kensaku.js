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
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Search from "@material-ui/icons/Search";
import Edit from "@material-ui/icons/Edit";
import * as myActions from "../actions/shain_toroku";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

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
  headLine: {
    width: 350,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300,
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
  rootForm: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  button2: { margin: theme.spacing.unit },
});

class ShainKensakuForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    comment: {},
    haifuCoin: 150,
    tohyoCoin: 0,
    kengenData: [],
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    kengen: "",
  };

  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    var loginInfos = JSON.parse(sessionStorage.getItem("loginInfo"));
    this.setState({ userid: loginInfos[0].userid });
    this.setState({ password: loginInfos[0].password });
    this.setState({ tShainPk: loginInfos[0].tShainPk });
    this.state.tShainPk = Number(loginInfos[0].tShainPk);
    this.setState({ imageFileName: loginInfos[0].imageFileName });
    this.setState({ shimei: loginInfos[0].shimei });
    this.setState({ kengenCd: loginInfos[0].kengenCd });

    // 検索条件クリア
    this.setState({ election: "" });
    this.setState({ kengen: "" });
    //権限リスト生成
    request
      .post(restdomain + "/shain_kensaku/makeKenegenList")
      .end((err, res) => {
        if (err) return;

        this.state.kengenData = res.body.data;
        this.setState({ kengenData: res.body.data });
      });
  }

  handleChange = (event) => {
    this.state.election = event.target.value;
    this.setState({ election: event.target.value });
  };

  // 検索処理
  handleClick = () => {
    request
      .post(restdomain + "/shain_kensaku/find")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        // 検索結果表示
        this.state.resultList = res.body.data;
        this.setState({ resultList: res.body.data });
      });
  };

  // 権限変更時
  handleChange2 = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    this.state.kengen = event.target.value;
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

  editClick = (event) => {
    const { shainToroku, actions } = this.props;

    var pShainPk = event.currentTarget.getAttribute("data-num");

    actions.setShainTorokuData(pShainPk);
  };

  newClick = (event) => {
    const { shainToroku, actions } = this.props;
    actions.setShainTorokuData(null);
  };

  handleToggleClose = (event) => {
    if (this.target1.contains(event.target)) {
      return;
    }

    this.setState({ open2: false });
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;
    const sampleLink = (props) => <Link to="/sample" {...props} />;
    const shainTorokuLink = (props) => <Link to="/shain_toroku" {...props} />;

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
              <h2>
                <img
                  src="/images/yajirushi.png"
                  alt="サンプル"
                  align="top"
                  width="30"
                  height="30"
                  style={{ marginTop: 2 }}
                />
                <strong>検索条件</strong>
              </h2>
              <form className={classes.root} autoComplete="off">
                <TextField
                  id="shimei"
                  label="氏名"
                  placeholder="氏名を入力"
                  className={classes.textField}
                  value={this.state.election}
                  onChange={this.handleChange}
                  margin="normal"
                />
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="kengen-simple">権限</InputLabel>
                  <Select
                    native
                    value={this.state.kengen}
                    onChange={this.handleChange2}
                    inputProps={{
                      name: "kengen",
                      id: "kengen-simple",
                    }}
                  >
                    <option value="" />
                    {this.state.kengenData.map((n) => {
                      return <option value={n.kengen_cd}>{n.kengen_nm}</option>;
                    })}
                  </Select>
                </FormControl>
              </form>
              <Button
                variant="raised"
                color="default"
                size="large"
                className={classes.button2}
                onClick={this.handleClick}
              >
                <Search
                  className={classNames(classes.leftIcon, classes.iconSmall)}
                />
                SEARCH
              </Button>
              <Button
                variant="raised"
                color="default"
                size="large"
                className={classes.button2}
                onClick={this.newClick}
                component={shainTorokuLink}
              >
                <Edit
                  className={classNames(classes.leftIcon, classes.iconSmall)}
                />
                NEW REGIST
              </Button>
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
                <strong>検索結果</strong>
              </h2>
              <Paper className={classes.root}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <CustomTableCell colSpan={2}>氏名</CustomTableCell>
                      <CustomTableCell>権限</CustomTableCell>
                      <CustomTableCell>編集</CustomTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.resultList.map((n) => {
                      return (
                        <TableRow>
                          <CustomTableCell style={{ width: "5%" }}>
                            <Avatar
                              alt="Adelle Charles"
                              src={restUrl + `uploads/${n.image_file_nm}`}
                              className={classNames(classes.PnlAvatar)}
                            />
                          </CustomTableCell>
                          <CustomTableCell style={{ width: "45%" }}>
                            {n.shimei}
                          </CustomTableCell>
                          <CustomTableCell style={{ width: "30%" }}>
                            {n.kengen_nm}
                          </CustomTableCell>
                          <CustomTableCell style={{ width: "20%" }}>
                            <Button
                              variant="raised"
                              color="default"
                              size="large"
                              className={classes.button2}
                              component={shainTorokuLink}
                              onClick={this.editClick}
                              data-num={n.t_shain_pk}
                            >
                              <Edit
                                className={classNames(
                                  classes.leftIcon,
                                  classes.iconSmall
                                )}
                              />
                              EDIT
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

ShainKensakuForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  shainToroku: state.shainToroku,
});

const mapDispatch = (dispatch) => ({
  actions: bindActionCreators(myActions, dispatch),
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState, mapDispatch)(ShainKensakuForm)
);
