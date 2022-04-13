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
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as Tooltip2,
} from "recharts";

const restdomain = require("../common/constans.js").restdomain;

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    fontSize: 18,
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
  PnlAvatar: {
    width: 60,
    height: 60,
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

class TohyoShokaiShosaiForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: "left",
    completed: {},
    comment: {},
    haifuCoin: 150,
    tohyoCoin: 0,
    resultList: [],
    tohyo_coin: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    tPresenterPk: 0,
    tSenkyoPk: 0,
    tRank: null,
    tTotalCoin: null,
    sum_document: 0,
    sum_presentation: 0,
    sum_expression: 0,
    sum_influence_pt: 0,
    sum_breakthrough_pt: 0,
    senkyo_nm: "",
    pnlnm: {},
  };

  constructor(props) {
    super(props);
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    const { tohyo_shokai_shosai } = this.props;
    if (tohyo_shokai_shosai.t_senkyo_pk === 0) {
      var tohyoShosaiShosaiParamInfo = JSON.parse(
        sessionStorage.getItem("tohyoShosaiShosaiParamInfo")
      )[0];
      this.setState({
        tPresenterPk: tohyoShosaiShosaiParamInfo["t_presenter_pk"],
      });
      this.state.tPresenterPk = Number(
        tohyoShosaiShosaiParamInfo["t_presenter_pk"]
      );
      this.setState({ tSenkyoPk: tohyoShosaiShosaiParamInfo["t_senkyo_pk"] });
      this.state.tSenkyoPk = Number(tohyoShosaiShosaiParamInfo["t_senkyo_pk"]);
      this.setState({ tRank: tohyoShosaiShosaiParamInfo["t_rank"] });
      this.setState({ tTotalCoin: tohyoShosaiShosaiParamInfo["t_totalcoin"] });
    } else {
      this.setState({ tPresenterPk: tohyo_shokai_shosai.t_presenter_pk });
      this.state.tPresenterPk = Number(tohyo_shokai_shosai.t_presenter_pk);
      this.setState({ tSenkyoPk: tohyo_shokai_shosai.t_senkyo_pk });
      this.state.tSenkyoPk = Number(tohyo_shokai_shosai.t_senkyo_pk);
      this.setState({ tRank: tohyo_shokai_shosai.t_rank });
      this.setState({ tTotalCoin: tohyo_shokai_shosai.t_totalcoin });

      var tohyoShosaiShosaiParamInfo = [
        {
          t_presenter_pk: tohyo_shokai_shosai.t_presenter_pk,
          t_senkyo_pk: tohyo_shokai_shosai.t_senkyo_pk,
          t_rank: tohyo_shokai_shosai.t_rank,
          t_totalcoin: tohyo_shokai_shosai.t_totalcoin,
        },
      ];

      sessionStorage.setItem(
        "tohyoShosaiShosaiParamInfo",
        JSON.stringify(tohyoShosaiShosaiParamInfo)
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
      .post(restdomain + "/tohyo_shokai_shosai/find")
      .send(this.state)
      .end((err, res) => {
        if (err) {
          return;
        }
        var resList = res.body.data;
        var coin = res.body.tohyo_coin;
        this.setState({ tohyo_coin: coin });
        if (resList.length != 0) {
          this.state.senkyo_nm = resList[0].senkyo_nm;
        }
        var head = [];
        if (resList.length === 0) {
          head.push(false);
        } else {
          head.push(true);
        }

        // 検索結果表示
        this.setState({ resultList: resList });
        this.setState({ headList: head });

        // 各評価ポイントの集計
        var sum1 = 0,
          sum2 = 0,
          sum3 = 0,
          sum4 = 0,
          sum5 = 0;
        for (var i in this.state.resultList) {
          sum1 += this.state.resultList[i].document_pt;
          sum2 += this.state.resultList[i].presentation_pt;
          sum3 += this.state.resultList[i].expression_pt;
          sum4 += this.state.resultList[i].influence_pt;
          sum5 += this.state.resultList[i].breakthrough_pt;
        }
        this.setState({ sum_document: sum1 });
        this.setState({ sum_presentation: sum2 });
        this.setState({ sum_expression: sum3 });
        this.setState({ sum_influence: sum4 });
        this.setState({ sum_breakthrough: sum5 });

        // コメントパネル名設定
        var pnlno = 0;
        for (var i in this.state.resultList) {
          pnlno += 1;
          this.state.pnlnm[i] = "panel" + pnlno;
        }
      });
  }

  handleChange = (name, cnt) => (event) => {
    this.setState({
      [name[cnt]]: event.target.value,
    });
  };

  handleChangePnl = (panel) => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
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
    const { expanded } = this.state;

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

    const dataRadar = [
      { rank: "資料作成", value: this.state.sum_document },
      { rank: "発表力", value: this.state.sum_presentation },
      { rank: "表現力", value: this.state.sum_expression },
      { rank: "影響力", value: this.state.sum_influence },
      { rank: "限界突破", value: this.state.sum_breakthrough },
    ];

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
                      <Paper className={classes.root} elevation={4}>
                        <Typography variant="subhead" component="p">
                          {this.state.resultList[0].senkyo_nm}
                        </Typography>
                        <br />
                        <Typography variant="headline" component="h3">
                          全体順位：{this.state.tRank}位　獲得コイン：
                          {this.state.tTotalCoin}コイン
                        </Typography>
                        <Typography variant="headline" component="h3">
                          『{this.state.resultList[0].presen_title}』
                        </Typography>
                        <table>
                          <tr>
                            <td>
                              <Avatar
                                alt="Adelle Charles"
                                src={
                                  restUrl +
                                  `uploads/${this.state.resultList[0].presen_image}`
                                }
                                className={classNames(classes.PnlAvatar)}
                              />
                            </td>
                            <td>
                              <Typography
                                component="p"
                                variant="title"
                                color="textSecondary"
                              >
                                {this.state.resultList[0].presen_shimei}
                              </Typography>
                            </td>
                          </tr>
                        </table>
                      </Paper>

                      <RadarChart // レーダーチャートのサイズや位置、データを指定
                        height={400} // レーダーチャートの全体の高さを指定
                        width={500} // レーダーチャートの全体の幅を指定
                        cx="50%" // 要素の左を基準に全体の50%移動
                        cy="50%" // 要素の上を基準に全体の50%移動
                        data={dataRadar} // ここにArray型のデータを指定
                      >
                        <PolarGrid /> // レーダーのグリッド線を表示
                        <PolarAngleAxis
                          dataKey="rank" // Array型のデータの、数値を表示したい値のキーを指定
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, this.state.resultList.length * 10]}
                        />
                        <Radar // レーダーの色や各パラメーターのタイトルを指定
                          name="点数" // hoverした時に表示される名前を指定
                          dataKey="value" // Array型のデータのパラメータータイトルを指定
                          stroke="#8884d8" // レーダーの線の色を指定
                          fill="#8884d8" // レーダーの中身の色を指定
                          fillOpacity={0.6} // レーダーの中身の色の薄さを指定
                        />
                        <Tooltip2 /> //hoverすると各パラメーターの値が表示される
                      </RadarChart>

                      {this.state.resultList.map((data, i) => {
                        return (
                          <div>
                            <ExpansionPanel
                              expanded={expanded === i}
                              onChange={this.handleChangePnl(i)}
                            >
                              <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                              >
                                <Typography
                                  className={classes.heading}
                                  style={{
                                    fontSize: "18px",
                                    flexBasis: "10.00%",
                                  }}
                                >
                                  <Avatar
                                    alt="Adelle Charles"
                                    src={
                                      restUrl + `uploads/${data.tohyo_image}`
                                    }
                                    className={classNames(classes.PnlAvatar)}
                                  />
                                  {data.tohyo_shimei}
                                </Typography>
                                <Typography style={{ fontSize: "18px" }}>
                                  投票：{this.state.tohyo_coin[i]}
                                  コイン　資料作成：{data.document_pt}
                                  点　発表力：{data.presentation_pt}点　表現力：
                                  {data.expression_pt}点　影響力：
                                  {data.influence_pt}点　限界突破：
                                  {data.breakthrough_pt}点　コメントを読む
                                </Typography>
                              </ExpansionPanelSummary>
                              <ExpansionPanelDetails>
                                <Typography
                                  style={{
                                    fontSize: "18px",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {data.tohyo_comment}
                                </Typography>
                              </ExpansionPanelDetails>
                            </ExpansionPanel>
                          </div>
                        );
                      })}
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

TohyoShokaiShosaiForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  tohyo_shokai_shosai: state.tohyo_shokai_shosai,
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState)(TohyoShokaiShosaiForm)
);
