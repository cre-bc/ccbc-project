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
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";
import AddIcon from "@material-ui/icons/Add";
import Icon from "@material-ui/core/Icon";
import EditIcon from "@material-ui/icons/Edit";
import moment from "moment";
import "moment/locale/ja";
import request from "superagent";
import QRCode from "qrcode.react";

const restdomain = require("../common/constans.js").restdomain;

// //createData,desc,getSortingは外だし、または、不要
// let counter = 0;
// function createData(date, name, tytle, calories, coin, qr) {
//   counter += 1;
//   return { id: counter, date, name, tytle, calories, coin, qr };
// }

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => -desc(a, b, orderBy)
    : (a, b) => desc(a, b, orderBy);
}

const rows = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "商品コード",
  },
  {
    id: "tytle",
    numeric: false,
    disablePadding: true,
    label: "商品分類",
  },

  {
    id: "calorie",
    numeric: false,
    disablePadding: true,
    label: "商品名",
  },
  {
    id: "coin",
    numeric: false,
    disablePadding: true,
    label: "コイン",
  },
  {
    id: "seller_shain_pk",
    numeric: false,
    disablePadding: true,
    label: "販売社員",
  },
  {
    id: "qr",
    numeric: false,
    disablePadding: true,
    label: "",
  },
];

class EnhancedTableHead extends React.Component {
  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
            />
          </TableCell>
          {rows.map((row) => {
            return (
              <TableCell
                key={row.id}
                numeric={row.numeric}
                padding={row.disablePadding ? "dense" : "none"}
                sortDirection={orderBy === row.id ? order : false}
                style={{ fontSize: "120%" }}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? "bottom-end" : "bottom-start"}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={order === row.id}
                    direction={orderBy}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = (theme) => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: "1 1 100%",
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: "0 0 auto",
  },
});

let EnhancedTableToolbar = (props) => {
  const { numSelected, classes } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subheading">
            {numSelected} 件選択
          </Typography>
        ) : (
          <Typography variant="title" id="tableTitle">
            商品一覧
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  root2: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
  },
  root3: {
    display: "flex",
    flexWrap: "wrap",
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
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  button: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
});

class ComShohinMenteForm extends React.Component {
  state = {
    age: "",
    open: false,
    open2: false,
    openAdd: false,
    openEdit: false,
    openDelete: false,
    anchor: "left",
    order: "asc",
    orderBy: "name",
    selected: [],
    page: 0,
    rowsPerPage: 5,
  };

  constructor(props) {
    super(props);
    const params = this.props.match;
    this.state = {
      status: true,
      loaded: false,
      mode: params.params.mode,
      readonly: false,
      selected: [],
      resultList: [],
      resultAllList: [],
      shainList: [],
      open: false,
      anchor: "left",
      anchorEl: null,
      addFlg: true,
      Target_year: "",
      nendoList: [],
      page: 0,
      rowsPerPage: 5,
      checked: false,
      name: [],
      m_shohin_pk: null,
      shohin_code: "",
      shohin_bunrui: "",
      shohin_bunrui_mei: "",
      shohin_nm1: "",
      shohin_nm2: "",
      coin: "",
      seller_shain_pk: "",
      shimei: "",
      targetCode: 0,
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

    //データ取得部分
    request
      .post(restdomain + "/com_shohin_mente/find")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        // 検索結果表示
        this.setState({ resultList: res.body.shohinData });
        this.setState({ shainList: res.body.shainData });
      });
  }

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

  handleClickOpenAdd = () => {
    this.setState({ openAdd: true });
  };

  handleCloseAdd = () => {
    this.setState({ openAdd: false });
  };

  handleClickOpenEdit = () => {
    if (this.isSelected && this.state.selected.length == 1) {
      this.setState({ openEdit: true });
    }
  };

  handleCloseEdit = () => {
    this.setState({ openEdit: false });
  };

  handleClickOpenDelete = () => {
    if (this.isSelected && this.state.selected.length == 1) {
      this.setState({ openDelete: true });
    }
  };

  handleCloseDelete = () => {
    this.setState({ openDelete: false });
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    const resultList =
      order === "desc"
        ? this.state.resultList.sort((a, b) =>
            b[orderBy] < a[orderBy] ? -1 : 1
          )
        : this.state.resultList.sort((a, b) =>
            a[orderBy] < b[orderBy] ? -1 : 1
          );

    this.setState({ resultList, order, orderBy });
    this.setState({ selected: [] });
    this.setState({ m_shohin_pk: null });
    this.setState({ shohin_code: null });
    this.setState({ shohin_bunrui: null });
    this.setState({ shohin_bunrui_mei: null });
    this.setState({ shohin_nm1: null });
    this.setState({ shohin_nm2: null });
    this.setState({ coin: null });
    this.setState({ seller_shain_pk: null });
    // this.setState({ shimei: null });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected.unshift(id);
    }
    this.setState({ selected: newSelected });

    let check = false;
    check = this.state.selected.indexOf(id) !== -1;
    if (check == true) {
      this.setState({ m_shohin_pk: null });
      this.setState({ shohin_code: null });
      this.setState({ shohin_bunrui: null });
      this.setState({ shohin_bunrui_mei: null });
      this.setState({ shohin_nm1: null });
      this.setState({ shohin_nm2: null });
      this.setState({ coin: null });
      this.setState({ seller_shain_pk: null });
      this.setState({ shimei: null });
    } else {
      if (this.state.page == 1) id = id + 5;
      if (this.state.page == 2) id = id + 10;
      this.setState({ m_shohin_pk: this.state.resultList[id].m_shohin_pk });
      this.setState({ shohin_code: this.state.resultList[id].shohin_code });
      this.setState({ shohin_bunrui: this.state.resultList[id].shohin_bunrui });
      this.setState({
        shohin_bunrui_mei: this.state.resultList[id].shohin_bunrui_mei,
      });
      this.setState({ shohin_nm1: this.state.resultList[id].shohin_nm1 });
      this.setState({ shohin_nm2: this.state.resultList[id].shohin_nm2 });
      this.setState({ coin: this.state.resultList[id].coin });
      this.setState({
        seller_shain_pk: this.state.resultList[id].seller_shain_pk,
      });
      this.setState({ shimei: this.state.resultList[id].shimei });
    }
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
    this.setState({ selected: [] });
    this.setState({ m_shohin_pk: null });
    this.setState({ shohin_code: null });
    this.setState({ shohin_bunrui: null });
    this.setState({ shohin_bunrui_mei: null });
    this.setState({ shohin_nm1: null });
    this.setState({ shohin_nm2: null });
    this.setState({ coin: null });
    this.setState({ seller_shain_pk: null });
    // this.setState({ shimei: null });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleChange = (event) => {
    this.setState({ targetCode: event.target.value });
    this.state.targetCode = Number(event.target.value);
    this.read();
  };

  read = async () => {
    request
      .post(restdomain + "/com_shohin_mente/find")
      .send(this.state)
      .end((err, res) => {
        if (err) return;
        // 検索結果表示
        this.setState({ resultList: res.body.shohinData });
        this.setState({ shainList: res.body.shainData });
      });
    this.setState({ selected: [] });
    this.setState({ m_shohin_pk: null });
    this.setState({ shohin_code: null });
    this.setState({ shohin_bunrui: null });
    this.setState({ shohin_bunrui_mei: null });
    this.setState({ shohin_nm1: null });
    this.setState({ shohin_nm2: null });
    this.setState({ coin: null });
    this.setState({ seller_shain_pk: null });
  };

  checkInput = () => {
    if (this.state.shohin_code == "") {
      alert("商品コードを入力してください。");
      return false;
    }
    if (
      this.state.shohin_bunrui == null ||
      this.state.shohin_bunrui == "" ||
      this.state.shohin_bunrui == "0"
    ) {
      alert("商品分類を選択してください。");
      return false;
    }
    if (this.state.shohin_nm1 == "") {
      alert("商品名1段目を入力してください。");
      return false;
    }
    if (this.state.coin == "") {
      alert("コインを入力してください。");
      return false;
    }
    return true;
  };

  handleSubmit = async () => {
    if (this.checkInput() == false) {
      return;
    }
    await fetch(restdomain + "/com_shohin_mente/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return;
          }
          this.setState({ openAdd: false });
          this.read();
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  handleSubmitEdit = async () => {
    if (this.checkInput() == false) {
      return;
    }
    await fetch(restdomain + "/com_shohin_mente/edit", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return;
          }
          this.setState({ openEdit: false });
          this.read();
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  handleSubmitDelete = async () => {
    await fetch(restdomain + "/com_shohin_mente/delete", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return;
          }
          this.setState({ openDelete: false });
          this.read();
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  handleChange_shohin_code(e) {
    this.setState({ shohin_code: e.target.value });
  }

  handleChange_shohin_bunrui(e) {
    this.setState({ shohin_bunrui: e.target.value });
  }

  handleChange_shohin_nm1(e) {
    this.setState({ shohin_nm1: e.target.value });
  }

  handleChange_shohin_nm2(e) {
    this.setState({ shohin_nm2: e.target.value });
  }

  handleChange_coin(e) {
    this.setState({ coin: e.target.value });
  }

  handleChange_seller_shain(e) {
    this.setState({ seller_shain_pk: e.target.value });
  }

  handleChange_shimei(e) {
    this.setState({ shimei: e.target.value });
  }

  isSelected = (id) => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, theme } = this.props;
    const {
      anchor,
      open,
      open2,
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      resultList,
    } = this.state;

    //モックから切り替える時はdata.lengthを修正
    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, resultList.length - page * rowsPerPage);
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
            <div className={classes.drawerHeader} />
            {/* 下のdivの中身を画面に応じて変えること。ヘッダ部分は共通のため、触らないこと。 */}
            <div className={classes.root3}>
              {/* 商品分類選択 */}
              <FormControl className={classes.formControl}>
                {/* <InputLabel htmlFor="age-native-simple" /> */}
                <InputLabel shrink htmlFor="age-native-simple">
                  商品分類
                </InputLabel>
                <Select
                  native
                  value={this.state.targetCode}
                  onChange={this.handleChange}
                  input={
                    <Input
                      name="shohin_bunrui"
                      id="age-native-label-placeholder"
                    />
                  }
                >
                  <option value={0} />
                  <option value={1}>菓子</option>
                  <option value={2}>飲料</option>
                  <option value={3}>食品</option>
                  <option value={9}>その他</option>
                </Select>
              </FormControl>
            </div>
            <div>
              {/* 追加ボタン */}
              <Button
                onClick={this.handleClickOpenAdd}
                // variant="extendedFab"
                variant="raised"
                aria-label="Delete"
                className={classes.button}
              >
                <AddIcon className={classes.extendedIcon} />
                追加
              </Button>

              {/* 編集ボタン */}
              <Button
                onClick={this.handleClickOpenEdit}
                variant="raised"
                aria-label="Delete"
                className={classes.button}
              >
                <EditIcon className={classes.extendedIcon} />
                編集
              </Button>

              {/* 削除ボタン */}
              <Button
                onClick={this.handleClickOpenDelete}
                variant="contained"
                variant="raised"
                className={classes.button}
              >
                <DeleteIcon className={classes.extendedIcon} />
                削除
              </Button>
            </div>
            <div>
              {/* 一覧 */}
              <Paper className={classes.root2}>
                <EnhancedTableToolbar numSelected={selected.length} />
                <div className={classes.tableWrapper}>
                  <Table className={classes.table} aria-labelledby="tableTitle">
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      // onSelectAllClick={this.handleSelectAllClick}
                      onRequestSort={this.handleRequestSort}
                      rowCount={this.state.resultList.length}
                      // モックデータの場合以下を使用する
                      //rowCount={data.length}
                    />
                    <TableBody>
                      {this.state.resultList
                        //{data
                        .sort(getSorting(order, orderBy))
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((n, id) => {
                          const isSelected = this.isSelected(id);
                          return (
                            <TableRow
                              hover
                              onClick={(event) => this.handleClick(event, id)}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={-1}
                              key={id}
                              selected={isSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox checked={isSelected} />
                              </TableCell>
                              {/* 一覧　商品コード */}
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: "15%", fontSize: "120%" }}
                              >
                                {/* PK表示確認用 */}
                                {/* {n.m_shohin_pk} */}
                                {n.shohin_code}
                              </TableCell>
                              {/* 一覧　商品分類名称 */}
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: "25%", fontSize: "120%" }}
                              >
                                {n.shohin_bunrui_mei}
                              </TableCell>
                              {/* 一覧　商品名１と商品名２*/}
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: "35%", fontSize: "120%" }}
                              >
                                <div style={{ whiteSpace: "pre-line" }}>
                                  {n.shohin_nm1} {n.shohin_nm2}
                                </div>
                              </TableCell>
                              {/* 一覧　コイン数*/}
                              <TableCell
                                numeric
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: "10%", fontSize: "120%" }}
                              >
                                <div style={{ whiteSpace: "pre-line" }}>
                                  {n.coin}
                                </div>
                              </TableCell>
                              {/* 一覧　販売社員名称*/}
                              <TableCell
                                numeric
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: "10%", fontSize: "120%" }}
                              >
                                <div style={{ whiteSpace: "pre-line" }}>
                                  {n.shimei}
                                </div>
                              </TableCell>
                              {/* 一覧　ＱＲコード*/}
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: "15%", fontSize: "120%" }}
                              >
                                <div>
                                  <QRCode value={"CCC_" + n.shohin_code} />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 49 * emptyRows }}>
                          <TableCell colSpan={3} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  component="div"
                  count={resultList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  backIconButtonProps={{
                    "aria-label": "Previous Page",
                  }}
                  nextIconButtonProps={{
                    "aria-label": "Next Page",
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </Paper>
            </div>
            <div>
              {/* 追加ボタン */}
              <Button
                onClick={this.handleClickOpenAdd}
                // variant="extendedFab"
                variant="raised"
                aria-label="Delete"
                className={classes.button}
              >
                <AddIcon className={classes.extendedIcon} />
                追加
              </Button>

              <Dialog
                open={this.state.openAdd}
                onClose={this.handleCloseAdd}
                aria-labelledby="form-dialog-title"
              >
                <DialogTitle id="form-dialog-title">商品の追加</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    商品分類、商品名、コインを入力してください。
                  </DialogContentText>
                  <TextField
                    margin="normal"
                    id="shohin_code"
                    label="商品コード"
                    fullWidth
                    inputProps={{ maxLength: "4" }}
                    onChange={this.handleChange_shohin_code.bind(this)}
                  />
                  <FormControl>
                    {/* <InputLabel htmlFor="age-native-simple" /> */}
                    <InputLabel shrink htmlFor="age-native-simple">
                      商品分類
                    </InputLabel>
                    <Select
                      native
                      value={this.state.shohin_bunrui}
                      // onChange={this.handleChange}
                      input={
                        <Input
                          name="shohin_bunrui"
                          id="shohin_bunrui"
                          onChange={this.handleChange_shohin_bunrui.bind(this)}
                        />
                      }
                    >
                      <option value={0} />
                      <option value={1}>菓子</option>
                      <option value={2}>飲料</option>
                      <option value={3}>食品</option>
                      <option value={9}>その他</option>
                    </Select>
                  </FormControl>

                  <TextField
                    margin="normal"
                    id="shohin_nm1"
                    label="商品名1段目(11文字)"
                    fullWidth
                    inputProps={{ maxLength: "11" }}
                    onChange={this.handleChange_shohin_nm1.bind(this)}
                  />
                  <TextField
                    margin="normal"
                    id="shohin_nm2"
                    label="商品名2段目(11文字)"
                    fullWidth
                    inputProps={{ maxLength: "11" }}
                    onChange={this.handleChange_shohin_nm2.bind(this)}
                  />
                  <TextField
                    margin="normal"
                    id="coin"
                    type="number"
                    label="コイン"
                    fullWidth
                    inputProps={{ maxLength: "6" }}
                    onChange={this.handleChange_coin.bind(this)}
                  />
                  {/* 直接コードを入力する場合*/}
                  {/* <TextField
                    margin="normal"
                    id="seller_shain"
                    type="number"
                    label="販売社員ID"
                    fullWidth
                    onChange={this.handleChange_seller_shain.bind(this)}
                  /> */}

                  <FormControl>
                    <InputLabel shrink htmlFor="age-native-simple">
                      販売社員ID
                    </InputLabel>
                    <Select
                      native
                      value={this.state.seller_shain_pk}
                      // onChange={this.handleChangeShainList}
                      input={
                        <Input
                          name="seller_shain_pk"
                          id="seller_shain_pk"
                          onChange={this.handleChange_seller_shain.bind(this)}
                        />
                      }
                    >
                      <option value={""} />
                      {this.state.shainList.map((option) => (
                        <option value={option.t_shain_pk}>
                          {option.shimei}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseAdd} color="primary">
                    戻る
                  </Button>
                  <Button
                    onClick={this.handleSubmit.bind(this)}
                    color="secondary"
                  >
                    決定
                  </Button>
                </DialogActions>
              </Dialog>

              {/* 編集ボタン */}
              <Button
                onClick={this.handleClickOpenEdit}
                variant="raised"
                aria-label="Delete"
                className={classes.button}
              >
                <EditIcon className={classes.extendedIcon} />
                編集
              </Button>
              <Dialog
                open={this.state.openEdit}
                onClose={this.handleCloseEdit}
                aria-labelledby="form-dialog-title2"
              >
                <DialogTitle id="form-dialog-title2">商品の編集</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    商品分類、商品名、コインを入力してください。
                  </DialogContentText>
                  <TextField
                    margin="normal"
                    id="shohin_code"
                    label="商品コード"
                    defaultValue={this.state.shohin_code}
                    fullWidth
                    inputProps={{ maxLength: "4" }}
                    onChange={this.handleChange_shohin_code.bind(this)}
                  />
                  <FormControl>
                    <InputLabel shrink htmlFor="age-native-simple">
                      商品分類
                    </InputLabel>
                    <Select
                      native
                      value={this.state.shohin_bunrui}
                      // onChange={this.handleChange}
                      input={
                        <Input
                          name="shohin_bunrui"
                          id="shohin_bunrui"
                          onChange={this.handleChange_shohin_bunrui.bind(this)}
                        />
                      }
                    >
                      <option value={0} />
                      <option value={1}>菓子</option>
                      <option value={2}>飲料</option>
                      <option value={3}>食品</option>
                      <option value={9}>その他</option>
                    </Select>
                  </FormControl>
                  <TextField
                    margin="normal"
                    id="shohin_nm1"
                    label="商品名1段目(11文字)"
                    defaultValue={this.state.shohin_nm1}
                    fullWidth
                    inputProps={{ maxLength: "11" }}
                    onChange={this.handleChange_shohin_nm1.bind(this)}
                  />
                  <TextField
                    margin="normal"
                    id="shohin_nm2"
                    label="商品名2段目(11文字)"
                    defaultValue={this.state.shohin_nm2}
                    fullWidth
                    inputProps={{ maxLength: "11" }}
                    onChange={this.handleChange_shohin_nm2.bind(this)}
                  />
                  <TextField
                    margin="normal"
                    id="coin"
                    type="number"
                    label="コイン"
                    defaultValue={this.state.coin}
                    fullWidth
                    inputProps={{ maxLength: "6" }}
                    onChange={this.handleChange_coin.bind(this)}
                  />
                  {/* 直接コードを入力する場合*/}
                  {/* <TextField
                    margin="normal"
                    id="seller_shain"
                    type="number"
                    label="販売社員ID"
                    defaultValue={this.state.seller_shain_pk}
                    fullWidth
                    onChange={this.handleChange_seller_shain.bind(this)}
                  /> */}

                  <FormControl>
                    <InputLabel shrink htmlFor="age-native-simple">
                      販売社員ID
                    </InputLabel>
                    <Select
                      native
                      value={this.state.seller_shain_pk}
                      // onChange={this.handleChangeShainList}
                      input={
                        <Input
                          name="seller_shain_pk"
                          id="seller_shain_pk"
                          onChange={this.handleChange_seller_shain.bind(this)}
                        />
                      }
                    >
                      <option value={""} />
                      {this.state.shainList.map((option) => (
                        <option value={option.t_shain_pk}>
                          {option.shimei}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseEdit} color="primary">
                    戻る
                  </Button>
                  <Button
                    color="secondary"
                    onClick={this.handleSubmitEdit.bind(this)}
                  >
                    決定
                  </Button>
                </DialogActions>
              </Dialog>

              {/* 削除ボタン */}
              <Button
                onClick={this.handleClickOpenDelete}
                variant="contained"
                variant="raised"
                className={classes.button}
              >
                <DeleteIcon className={classes.extendedIcon} />
                削除
              </Button>

              <Dialog
                open={this.state.openDelete}
                onClose={this.handleCloseDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"削除してよろしいですか。"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {/* コメント */}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseDelete} color="primary">
                    いいえ
                  </Button>
                  <Button
                    onClick={this.handleSubmitDelete.bind(this)}
                    color="secondary"
                    autoFocus
                  >
                    はい
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </main>
          {after}
        </div>
      </div>
    );
  }
}

ComShohinMenteForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ComShohinMenteForm);
