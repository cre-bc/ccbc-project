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
} from "./tileData";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import Save from "@material-ui/icons/Save";

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
    marginLeft: 12,
    marginRight: 20,
  },
  buttonFrame2: {
    position: "static",
    marginLeft: 4,
    marginRight: -4,
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
  root2: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 800,
  },
  textField2: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: "none",
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 300,
    maxWidth: 500,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
});

const images = [
  {
    url: "/images/shain_kanri.png",
    title: "社員管理",
    width: "33%",
    path: "/",
  },
  {
    url: "/images/senkyo_kanri.png",
    title: "選挙管理",
    width: "34%",
    path: "/",
  },
  {
    url: "/images/coin_shokai.png",
    title: "コイン照会",
    width: "33%",
    path: "/",
  },
];

const images2 = [
  {
    url: "/images/senkyo.png",
    title: "投票",
    width: "33%",
    path: "/",
  },
  {
    url: "/images/tohyo_kekka.png",
    title: "投票結果",
    width: "34%",
    path: "/",
  },
  {
    url: "/images/zoyo.png",
    title: "コイン贈与",
    width: "33%",
    path: "/",
  },
];

const member = [
  {
    value: 1,
    name: "山田　太郎",
  },
  {
    value: 2,
    name: "田中　達也",
  },
  {
    value: 3,
    name: "中田　花子",
  },
  {
    value: 4,
    name: "中村　一郎",
  },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = ["山田　太郎", "田中　達也", "中田　花子", "中村　一郎"];

class PersistentDrawer extends React.Component {
  state = {
    open: false,
    anchor: "left",
    checked: [1],

    election: "平成30年10月部会",
    multiline: "Controlled",
    currency: "EUR",
    name: [],
  };

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };

  handleChange = (election) => (event) => {
    this.setState({
      [election]: event.target.value,
    });
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleToggle = (value) => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked,
    });
  };

  render() {
    const { classes, theme } = this.props;
    const { anchor, open } = this.state;

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
        <List>{kanriListItems}</List>
        <Divider />
        <List>{ippanListItems}</List>
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
              <div className={classes.appFrame}>
                <Typography variant="title" color="inherit" noWrap>
                  Most Valuable Player Vote System
                </Typography>
              </div>
              <Button
                variant="raised"
                color="inherit"
                color="secondary"
                href="../"
                className={classNames(
                  !open && classes.buttonFrame,
                  open && classes.buttonFrame2
                )}
              >
                LOGOUT
              </Button>
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
            <h2>
              <img
                src="/images/yajirushi.png"
                alt="サンプル"
                align="top"
                width="30"
                height="20"
              />
              <strong>選挙情報</strong>
            </h2>
            <table border="1">
              <tr>
                <td colspan="2">
                  <TextField
                    id="
                    election"
                    label="選挙名"
                    placeholder="選挙名を入力"
                    className={classes.textField}
                    value={this.state.election}
                    onChange={this.handleChange("election")}
                    margin="normal"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <TextField
                    id="textarea"
                    label="開始日"
                    placeholder="投票開始日を入力（yyyy/mm/dd）"
                    multiline
                    className={classes.textField2}
                    margin="normal"
                  />
                </td>
                <td>
                  <TextField
                    id="textarea"
                    label="終了日"
                    placeholder="投票終了日を入力（yyyy/mm/dd）"
                    multiline
                    className={classes.textField2}
                    margin="normal"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <TextField
                    id="textarea"
                    label="管理局所持コイン数"
                    value="98500"
                    placeholder=""
                    multiline
                    className={classes.textField2}
                    margin="normal"
                    disabled
                  />
                </td>
                <td>
                  <TextField
                    id="textarea"
                    label="配布コイン数"
                    placeholder=""
                    multiline
                    className={classes.textField2}
                    margin="normal"
                  />
                </td>
              </tr>
            </table>
            <br />
            <h2>
              <img
                src="/images/yajirushi.png"
                alt="サンプル"
                align="top"
                width="30"
                height="20"
              />
              <strong>参加者選択</strong>
            </h2>
            <div className={classes.root2}>
              <List>
                {member.map((value) => (
                  <ListItem
                    key={value.value}
                    dense
                    button
                    className={classes.listItem}
                  >
                    <Avatar alt="Remy Sharp" src="/images/sample.jpg" />
                    <ListItemText primary={`${value.name}`} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        onChange={this.handleToggle(value.value)}
                        checked={this.state.checked.indexOf(value.value) !== -1}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button variant="raised" className={classes.button}>
                全選択
              </Button>
            </div>
            <br />
            <h2>
              <img
                src="/images/yajirushi.png"
                alt="サンプル"
                align="top"
                width="30"
                height="20"
              />
              <strong>発表者選択</strong>
            </h2>
            <table border="1">
              <tr>
                <td width="50" align="center">
                  1
                </td>
                <td>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="select-multiple">氏名</InputLabel>
                    <Select
                      multiple
                      value={this.state.name}
                      onChange={this.handleChange}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                    >
                      {names.map((name) => (
                        <MenuItem
                          key={name}
                          value={name}
                          style={{
                            fontWeight:
                              this.state.name.indexOf(name) === -1
                                ? theme.typography.fontWeightRegular
                                : theme.typography.fontWeightMedium,
                          }}
                        >
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
                <td>
                  <TextField
                    id="textarea"
                    label="発表タイトル"
                    placeholder="発表タイトルを入力"
                    multiline
                    className={classes.textField2}
                    margin="normal"
                  />
                </td>

                <td align="center">
                  <Button
                    variant="raised"
                    color="primary"
                    className={classes.button}
                    size="small"
                  >
                    追加
                  </Button>
                  <Button
                    variant="raised"
                    color="secondary"
                    className={classes.button}
                    size="small"
                  >
                    削除
                  </Button>
                </td>
              </tr>
            </table>
            <Button className={classes.button} variant="raised" size="large">
              <Save
                className={classNames(classes.leftIcon, classes.iconSmall)}
              />
              Save
            </Button>
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

export default withStyles(styles, { withTheme: true })(PersistentDrawer);
