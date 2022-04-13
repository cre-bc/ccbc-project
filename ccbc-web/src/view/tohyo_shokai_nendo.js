import React from "react";
import request from "superagent";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";
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
import { Link } from "react-router-dom";
import { kanriListItems, systemName, restUrl, titleItems } from "./tileData";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import {
  Tooltip as Tooltip2,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

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
});

class TohyoShokaiNendoForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    comment: {},
    haifuCoin: 150,
    resultList: [],
    resultcoin: [],
    dispheight: 0,
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    pNendo: null,
    pNendoStr: null,
    pNendoEnd: null,
    data: [],
    maxCoinGraph: 0,
    maxCoinGraphData: [0, 1000, 2000, 3000, 4000, 5000],
    maxHappyoGraph: 0,
    maxHappyoGraphData: [0, 1, 2, 3, 4, 5],
  };

  constructor(props) {
    super(props);
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    const { tohyo_shokai_nendo } = this.props;

    if (tohyo_shokai_nendo.pNendo === 0) {
      var tohyoShosaiNendoParamInfo = JSON.parse(
        sessionStorage.getItem("tohyoShosaiNendoParamInfo")
      )[0];
      this.state.pNendo = tohyoShosaiNendoParamInfo["pNendo"];
      var Nendo = this.state.pNendo;
      var NendoS = Nendo + "/04/01";
      var NendoE = parseInt(Nendo) + 1;
      NendoE = NendoE + "/03/31";
      this.state.pNendoStr = NendoS;
      this.state.pNendoEnd = NendoE;
    } else {
      this.state.pNendo = tohyo_shokai_nendo.pNendo;
      var Nendo = this.state.pNendo;
      var NendoS = Nendo + "/04/01";
      var NendoE = parseInt(Nendo) + 1;
      NendoE = NendoE + "/03/31";
      this.state.pNendoStr = NendoS;
      this.state.pNendoEnd = NendoE;

      var tohyoShosaiNendoParamInfo = [
        {
          pNendo: tohyo_shokai_nendo.pNendo,
        },
      ];

      sessionStorage.setItem(
        "tohyoShosaiNendoParamInfo",
        JSON.stringify(tohyoShosaiNendoParamInfo)
      );
    }

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
      .post(restdomain + "/tohyo_shokai_nendo/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          return;
        }
        var resList = res.body.data;
        var rescoin = res.body.getcoin;
        var resdcnt = res.body.dcnt;
        var head = [];
        if (resList.length === 0) {
          head.push(false);
        } else {
          head.push(true);
        }

        //画面表示高さ設定
        var disp_height = 0;
        disp_height = resdcnt * 60;
        if (disp_height < 400) {
          disp_height = 400;
        }

        // 検索結果表示
        this.setState({ resultList: resList });
        this.setState({ resultcoin: rescoin });
        this.setState({ dispheight: disp_height });
        this.setState({ headList: head });

        //グラフ表示情報（氏名、発表数、取得コイン数）設定
        const data = [];
        var maxCoin = 0;
        var maxHappyo = 0;
        for (var i in this.state.resultList) {
          data.push({
            name: this.state.resultList[i].shimei,
            発表数: Number(this.state.resultList[i].presen_cnt),
            コイン数: Number(this.state.resultcoin[i]),
          });
          if (maxCoin < Number(this.state.resultcoin[i])) {
            maxCoin = Number(this.state.resultcoin[i]);
          }
          if (maxHappyo < Number(this.state.resultList[i].presen_cnt)) {
            maxHappyo = Number(this.state.resultList[i].presen_cnt);
          }
        }
        this.setState({ data: data });
        var maxCoinGraph = 0;
        var maxCoinGraphCnt = 0;
        var maxCoinGraphCntData = [];
        if (maxCoin > 0) {
          maxCoinGraph = Math.ceil(maxCoin / 10000) * 10000;
          maxCoinGraphCnt = maxCoinGraph / 5;
          for (var i = 0; i <= maxCoinGraph; i += maxCoinGraphCnt) {
            maxCoinGraphCntData.push(i);
          }
          this.state.maxCoinGraphData = maxCoinGraphCntData;
        }
        this.setState({ maxCoinGraph: maxCoinGraph });
        this.setState({ maxCoinGraphCntData: maxCoinGraphCntData });

        var maxHappyoGraph = 0;
        var maxHappyoGraphCnt = 0;
        var maxHappyoGraphCntData = [];
        if (maxHappyo > 0) {
          maxHappyoGraph = Math.ceil(maxHappyo / 10) * 10;
          maxHappyoGraphCnt = maxHappyoGraph / 5;
          for (var i = 0; i <= maxHappyoGraph; i += maxHappyoGraphCnt) {
            maxHappyoGraphCntData.push(i);
          }
          this.state.maxHappyoGraphData = maxHappyoGraphCntData;
        }
        this.setState({ maxHappyoGraph: maxHappyoGraph });
        this.setState({ maxHappyoGraphCntData: maxHappyoGraphCntData });
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

    this.setState({ open2: false });
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
              {(() => {
                if (this.state.resultList.length != 0) {
                  return (
                    <div>
                      <BarChart
                        width={1200}
                        height={this.state.dispheight}
                        layout="vertical"
                        data={this.state.data}
                        margin={{ top: 20, right: 20, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis type="category" dataKey="name" />
                        <XAxis
                          xAxisId="top"
                          orientation="top"
                          type="number"
                          dataKey="コイン数"
                          stroke="#8884d8"
                          domain={[0, this.state.maxCoinGraph]}
                          ticks={[
                            this.state.maxCoinGraphData[0],
                            this.state.maxCoinGraphData[1],
                            this.state.maxCoinGraphData[2],
                            this.state.maxCoinGraphData[3],
                            this.state.maxCoinGraphData[4],
                            this.state.maxCoinGraphData[5],
                          ]}
                        />
                        <XAxis
                          xAxisId="bottom"
                          orientation="bottom"
                          type="number"
                          dataKey="発表数"
                          stroke="#82ca9d"
                          domain={[0, this.state.maxHappyoGraph]}
                          ticks={[
                            this.state.maxHappyoGraphData[0],
                            this.state.maxHappyoGraphData[1],
                            this.state.maxHappyoGraphData[2],
                            this.state.maxHappyoGraphData[3],
                            this.state.maxHappyoGraphData[4],
                            this.state.maxHappyoGraphData[5],
                          ]}
                        />
                        <Tooltip2 />
                        <Legend />
                        <Bar xAxisId="top" dataKey="コイン数" fill="#8884d8" />
                        <Bar xAxisId="bottom" dataKey="発表数" fill="#82ca9d" />
                      </BarChart>
                    </div>
                  );
                }
              })()}
            </div>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

TohyoShokaiNendoForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  tohyo_shokai_nendo: state.tohyo_shokai_nendo,
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState)(TohyoShokaiNendoForm)
);
