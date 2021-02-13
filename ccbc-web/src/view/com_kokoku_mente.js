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
import { comKanriListItems, restUrl, titleItems2 } from "./tileData";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import MenuList from "@material-ui/core/MenuList";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import SwipeableViews from "react-swipeable-views";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import moment from "moment";
import "moment/locale/ja";
import request from "superagent";

const restdomain = require("../common/constans.js").restdomain;
var createObjectURL =
  (window.URL || window.webkitURL).createObjectURL || window.createObjectURL;

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const drawerWidth = 240;
const drawerWidthTab = 100;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  tab: {
    flexGrow: 1,
    display: "table-header-group",
    width: `calc(100% - ${drawerWidthTab}px)`,
    position: "absolute",
    marginLeft: "2%",
  },
  pre: {
    marginTop: 5,
    opacity: 0,
    appearance: "none",
    position: "absolute",
  },
  imagePre: {
    clear: "right",
    marginLeft: "35%",
    height: 120,
    width: 300,
    canvas: true,
  },
  fileButton: {
    marginTop: 20,
    float: "left",
  },
  submitButton: {
    margin: 0,
    top: "auto",
    left: "auto",
    bottom: "auto",
    position: "absolute",
  },
  massage: {
    marginTop: 100,
    marginLeft: 20,
  },
  checked: {},
  size: {
    width: 40,
    height: 40,
  },
  sizeIcon: {
    fontSize: 20,
  },

  appFrame: {
    zIndex: 1,
    overflow: "flex",
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
    height: 300,
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100,
    },
    "&:hover, &$focusVisible": {
      zIndex: 1,
      "& $imageBackdrop": {
        opacity: 1,
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
    fontSize: "300%",
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
  chip: {
    height: "300%",
    margin: theme.spacing.unit,
  },
  appBarColorDefault: {
    backgroundColor: "rgba(255, 136, 0, 0.92)",
  },
});

class ComKokokuMenteForm extends React.Component {
  state = {
    open: false,
    open2: false,
    openDialog: false,
    anchor: "left",
  };
  constructor(props) {
    super(props);
    const params = this.props.match;
    this.state = {
      loaded: false,
      mode: params.params.mode,
      resultList: [],
      open: false,
      anchor: "left",
      name: [],
      index: 0,
      renban: "",
      file_path: "",
      comment: "",
      delete_flg: false,
      srcImageUrl: null,
      gazo: null,
      msg: null,
    };
  }
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
    
    // データ取得
    this.read(0);
  }

  read = (index) => {
    //データ取得部分
    request
    .post(restdomain + "/com_kokoku_mente/find")
    .send(this.state)
    .end((err, res) => {
      if (err) return;
      // 検索結果表示
      this.setState({ resultList: res.body.data });
      this.setState({ index: index });
      if (this.state.resultList.length > 0) {
        this.setState({ 
          renban: this.state.resultList[index].renban,
          file_path: this.state.resultList[index].file_path,
          comment: this.state.resultList[index].comment,
          delete_flg: (this.state.resultList[index].delete_flg == '0'? false : true),
        })
      }
    });
  }

  handleClickOpen = () => {
    if (this.state.comment == "" || this.state.comment == null) {
      alert("広告メッセージを入力してください。");
      return;
    }
    if (this.state.file_path == "" && this.state.gazo == null) {
      alert("画像を選択してください。");
      return;
    }

    this.setState({ openDialog: true });
  };

  handleClose = () => {
    this.setState({ openDialog: false });
  };

  save = () => {
    this.setState({ openDialog: false });

    var form = new FormData()
    form.append('image', this.state.gazo);
    form.append('renban', this.state.renban);
    form.append('file_path', this.state.file_path);
    form.append('comment', this.state.comment);
    form.append('delete_flg', (this.state.delete_flg ? "1" : "0"));
    form.append('userid', this.state.userid)

    request
      .post(restdomain + '/com_kokoku_mente/create')
      .send(form)
      .end((err, res) => {
        if (err) {
          console.log("Error:", err);
          alert("更新に失敗しました。");
          return;
        }
        alert("更新しました。");
        this.setState({ gazo: null, srcImageUrl: null })
        this.read(this.state.index);
      })
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

  handleChange = (event, index) => {
    this.setItems(index);
  };

  handleChangeIndex = (index) => {
    // this.setItems(index);
  };

  setItems = (index) => {
    this.setState({ index: index });
    if (this.state.resultList.length > index) {
      this.setState({ 
        renban: this.state.resultList[index].renban,
        file_path: this.state.resultList[index].file_path,
        comment: this.state.resultList[index].comment,
        delete_flg: (this.state.resultList[index].delete_flg == '0'? false : true),
      })
    } else {
      this.setState({ 
        renban: "",
        file_path: "",
        comment: "",
        delete_flg: false,
      })
    }
  }

  handleCheckedChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };

  onFileChange(e) {
    var files = e.target.files;
    this.setState({ gazo: files[0] });
    this.setState({ file_path: files[0].name });
    var image_url = createObjectURL(files[0]);
    this.setState({ srcImageUrl: image_url });
  }

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const loginLink = (props) => <Link to="../" {...props} />;
    const { fullScreen } = this.props;

    let preview = new Array(5);
    for (var i = 0; i < preview.length; i++) {
      preview[i] = "";
    }
    for (var i = 0; i < this.state.resultList.length; i++) {
      preview[i] = (
        <div>
          <img width="400" height="250" src={restUrl + `uploads/advertise/${this.state.resultList[i].file_path}`} />
        </div>
      );
    }

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
        {comKanriListItems()}
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
            <Typography
              component="p"
              style={{
                color: 'red'
              }}
            >
              {this.state.msg}
            </Typography>
            <div className={classes.drawerHeader} />
            {/* 下のdivの中身を画面に応じて変えること。ヘッダ部分は共通のため、触らないこと。 */}
            <div>
              <div className={classes.tab}>
                <AppBar position="static" color="default">
                  <Tabs
                    value={this.state.index}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                  >
                    {preview.map((item, i) => (
                      <Tab label={"広告" + (i + 1)} />
                    ))}
                  </Tabs>
                </AppBar>

                <SwipeableViews
                  axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                  index={this.state.index}
                  onChangeIndex={this.handleChangeIndex}
                >
                  {preview.map((item, i) => (
                    <TabContainer dir={theme.direction}>
                      <div>
                        <Typography variant="headline" align="left">
                          {"広告" + (i + 1)}
                        </Typography>
                        <div className={classes.fileButton}>
                          <Button
                            variant="raised"
                            aria-label="登録"
                            color="inherit"
                            onClick={this.clickPostBtn}
                            size="medium"
                            component="label"
                          >
                            <Icon className={classes.rightIcon}>attachment</Icon>
                            ファイルを選択
                            <input
                              type="file"
                              className={classes.pre}
                              accept="image/*"
                              onChange={(e) => {
                                this.onFileChange(e);
                              }}
                            />
                          </Button>
                        </div>
                        <div className={classes.imagePre}>
                        <div>
                          {this.state.srcImageUrl && (
                            <img width="400" height="250" src={this.state.srcImageUrl} />
                          )}
                          {(!this.state.srcImageUrl && this.state.file_path != "") && (
                            <img width="400" height="250" src={restUrl + `uploads/advertise/${this.state.file_path}`} />
                          )}
                        </div>
                        </div>
                        <div className={classes.massage}>
                          <TextField
                            value={this.state.comment}
                            id="massage"
                            label="広告メッセージ(1000文字)"
                            placeholder="内容"
                            rows="10"
                            inputProps={{maxLength: "1000"}}
                            multiline
                            fullWidth
                            className={classes.textField}
                            margin="normal"
                            onChange={(e) => {
                              this.setState({ comment: e.target.value });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.delete_flg}
                              onChange={(e) => {
                                this.setState({ delete_flg: e.target.checked})
                              }}
                            />
                          }
                          label="広告情報を無効にする"
                        />
                      </div>
                    </TabContainer>
                  ))}
                </SwipeableViews>

                <div className={classes.submitButton}>
                  <Button
                    variant="raised"
                    aria-label="登録"
                    onClick={this.handleClickOpen}
                    size="midiam"
                    fullWidth
                  >
                    <Icon className={classes.rightIcon}>save</Icon>
                    　登録
                  </Button>
                  <Dialog
                    fullScreen={fullScreen}
                    open={this.state.openDialog}
                    onClose={this.handleClose}
                    aria-labelledby="post-dialog"
                  >
                    <DialogTitle id="post-dialog">
                      {"広告とメッセージを登録します"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        {"広告" + (this.state.index + 1) + "を更新します。よろしいですか？"}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.clickPostBtn}
                        onClick={this.save}
                        color="primary"
                        autoFocus
                      >
                        はい
                      </Button>
                      <Button onClick={this.handleClose} color="primary">
                        いいえ
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </div>
            </div>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

ComKokokuMenteForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ComKokokuMenteForm);
