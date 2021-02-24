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
import Checkbox from "@material-ui/core/Checkbox";
import Avatar from "@material-ui/core/Avatar";
import Save from "@material-ui/icons/Save";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import Chip from "@material-ui/core/Chip";
import { Manager, Target, Popper } from "react-popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const restdomain = require("../common/constans.js").restdomain;

const columnData = [
  { id: "name", numeric: false, disablePadding: true, label: "名前" },
  {
    id: "title",
    numeric: false,
    disablePadding: true,
    label: "発表タイトル",
  },
];

class EnhancedTableHead extends React.Component {
  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const {
      onSelectAllClick,
      onSelectAllClick2,
      order,
      orderBy,
      numSelected,
      numSelected2,
      rowCount,
      disabledFlg,
    } = this.props;
    const MenuLink = (props) => <Link to="/menu" {...props} />;

    if (!disabledFlg) {
      return (
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              参加者
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount}
                onChange={onSelectAllClick}
              />
            </TableCell>
            <TableCell padding="checkbox">
              発表者
              <Checkbox
                indeterminate={numSelected2 > 0 && numSelected2 < rowCount}
                checked={numSelected2 === rowCount}
                onChange={onSelectAllClick2}
              />
            </TableCell>
            {columnData.map((column) => {
              return (
                <TableCell
                  key={column.id}
                  numeric={column.numeric}
                  padding={column.disablePadding ? "none" : "default"}
                  sortDirection={orderBy === column.id ? order : false}
                  colSpan={2}
                >
                  <Tooltip
                    title="Sort"
                    placement={column.numeric ? "bottom-end" : "bottom-start"}
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={order}
                      onClick={this.createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              );
            }, this)}
          </TableRow>
        </TableHead>
      );
    } else {
      return (
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">参加者</TableCell>
            <TableCell padding="checkbox">発表者</TableCell>
            {columnData.map((column) => {
              return (
                <TableCell
                  key={column.id}
                  numeric={column.numeric}
                  padding={column.disablePadding ? "none" : "default"}
                  sortDirection={orderBy === column.id ? order : false}
                  colSpan={2}
                >
                  <Tooltip
                    title="Sort"
                    placement={column.numeric ? "bottom-end" : "bottom-start"}
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={order}
                      onClick={this.createSortHandler(column.id)}
                    >
                      {column.label}
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
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  onSelectAllClick2: PropTypes.func.isRequired,
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
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="title" id="tableTitle">
            参加者
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
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: "auto",
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

class PersistentDrawer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      order: "asc",
      orderBy: "name",
      selected: [],
      page: 0,
      rowsPerPage: 5,
      open: false,
      open2: false,
      anchor: "left",
      checked: [1],
      selected2: [],
      open2: false,
      anchor2: "left",
      checked2: [1],
      election: null,
      startDate: null,
      endDate: null,
      multiline: "Controlled",
      currency: "EUR",
      name: [],
      anchorEl: null,
      coin: "0",
      resultList: [],
      happyotitle: [],
      bcaccount: null,
      bccoin: "0",
      configCoin: "1",
      disabledFlg: true,
      tSenkyoPk: 0,
      haifuCoinList: [],
      dialogOpen: false,
      tokenId: null,
      msg: null,
      loadFlg: false,
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
      this.state.tShainPk = Number(loginInfo["tShainPk"]);
      this.setState({ imageFileName: loginInfo["imageFileName"] });
      this.setState({ shimei: loginInfo["shimei"] });
      this.setState({ kengenCd: loginInfo["kengenCd"] });
      this.setState({ tokenId: loginInfo["tokenId"] });
    }

    // 遷移元画面からの引き渡しパラメータ
    const { senkyoKanri } = this.props;
    var senkyoPk = null;
    if (senkyoKanri.pSenkyoPk === null) {
      var senkyoTorokuParamInfo = JSON.parse(
        sessionStorage.getItem("senkyoTorokuParamInfo")
      )[0];
      senkyoPk = senkyoTorokuParamInfo["tSenkyoPk"];
    } else {
      senkyoPk = senkyoKanri.pSenkyoPk;
    }
    if (senkyoPk === 0) {
      this.setState({ disabledFlg: false });
      var now = new Date();
      var month = now.getMonth() + 1;
      this.setState({
        election: now.getFullYear() + "年" + month + "月部会",
      });
      var account = null;

      request
        .post(restdomain + "/senkyo_toroku/find")
        .send(this.state)
        .end((err, res) => {
          if (err) {
            return;
          }
          var resList = res.body.data;
          var bccoin = String(res.body.bccoin);
          // 検索結果表示
          this.setState({ resultList: resList });
          this.setState({ bccoin: bccoin });
        });
    } else {
      this.setState({ disabledFlg: true });
      this.state.tSenkyoPk = senkyoPk;
      request
        .post(restdomain + "/senkyo_toroku/findShokai")
        .send(this.state)
        .end((err, res) => {
          if (err) {
            return;
          }
          var resList = res.body.data;
          var resList2 = res.body.senkyoData;
          // 検索結果表示
          this.setState({ resultList: resList });
          this.setState({ election: resList2[0].senkyo_nm });
          this.setState({ configCoin: resList2[0].config_coin });
          this.setState({ bccoin: "-" });
          this.setState({ coin: resList2[0].haifu_coin });
          this.setState({ startDate: resList2[0].tohyo_kaishi_dt });
          this.setState({ endDate: resList2[0].tohyo_shuryo_dt });
          var happyotitle_copy = [];
          var selected_copy = [];
          var selected2_copy = [];
          for (var i in resList) {
            if (
              resList[i].happyotitle == "" ||
              resList[i].happyotitle == null
            ) {
              happyotitle_copy.push([""]);
            } else {
              happyotitle_copy.push([resList[i].happyotitle]);
            }
            if (
              resList[i].t_shussekisha_pk != "" &&
              resList[i].t_shussekisha_pk != null
            ) {
              // selected_copy.push([resList[i].id])
              selected_copy[i] = resList[i].id;
            }
            if (
              resList[i].t_presenter_pk != "" &&
              resList[i].t_presenter_pk != null
            ) {
              // selected2_copy.push([resList[i].id])
              selected2_copy[i] = resList[i].id;
            }
          }
          this.setState({ happyotitle: happyotitle_copy });
          this.setState({ selected: selected_copy });
          this.setState({ selected2: selected2_copy });
        });
    }
    var senkyoTorokuParamInfo = [
      {
        tSenkyoPk: senkyoPk,
      },
    ];
    sessionStorage.setItem(
      "senkyoTorokuParamInfo",
      JSON.stringify(senkyoTorokuParamInfo)
    );
    // 「senkyoKanri.pSenkyoPk」で遷移元からの選挙PKが取得できる
    // alert(senkyoKanri.pSenkyoPk)
    // pSenkyoPkが0であれば追加ボタンによる遷移、1以上であれば照会ボタンからの遷移となる
    // なお、reduxによる画面パラメータ受け渡しは、F5を押下してブラウザリロードすると初期化されてしまうので、
    // sessionStorageに格納すること
    // 実装については、tohyo_shokai_kobetsu.jsの463行目付近を参考にすること
  }

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
  };

  handleSelectAllClick = (event, checked) => {
    var calCoin = 0;
    var selected = [];
    var jogaiCoin = this.state.configCoin * 50;
    var haifuCoinList = [];

    if (checked) {
      selected = this.state.resultList.map((n) => n.id);
      this.setState({ selected: this.state.resultList.map((n) => n.id) });
    } else {
      this.setState({ selected: [] });
    }
    var happyoshaCount = 0;
    for (var i in this.state.resultList) {
      var resultdata = this.state.resultList[i];
      for (var x in this.state.selected2) {
        if (resultdata.id == this.state.selected2[x]) {
          if (resultdata.kengen_cd != "3") {
            happyoshaCount = happyoshaCount + 1;
          }
        }
      }
    }
    var shussekiFlg = "false";
    var happyoFlg = "false";
    for (var j in this.state.resultList) {
      var resultdata = this.state.resultList[j];
      for (var y in selected) {
        if (resultdata.id == selected[y]) {
          shussekiFlg = "true";
          for (var z in this.state.selected2) {
            if (selected[y] == this.state.selected2[z]) {
              if (resultdata.kengen_cd != "3") {
                happyoFlg = "true";
              }
            }
          }
        }
      }
      if (shussekiFlg == "true") {
        if (happyoFlg == "true") {
          calCoin =
            happyoshaCount * this.state.configCoin * 10 * 5 -
            jogaiCoin +
            calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin:
              happyoshaCount * this.state.configCoin * 10 * 5 - jogaiCoin,
          });
        } else {
          calCoin = happyoshaCount * this.state.configCoin * 10 * 5 + calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin: happyoshaCount * this.state.configCoin * 10 * 5,
          });
        }
      }
      shussekiFlg = "false";
      happyoFlg = "false";
    }
    this.setState({ coin: calCoin });
    this.setState({ haifuCoinList: haifuCoinList });
  };

  handleClick = (event, id) => {
    var calCoin = 0;
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    var jogaiCoin = this.state.configCoin * 50;
    var haifuCoinList = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    this.setState({ selected: newSelected });

    var happyoshaCount = 0;
    for (var i in this.state.resultList) {
      var resultdata = this.state.resultList[i];
      for (var x in this.state.selected2) {
        if (resultdata.id == this.state.selected2[x]) {
          if (resultdata.kengen_cd != "3") {
            happyoshaCount = happyoshaCount + 1;
          }
        }
      }
    }
    var shussekiFlg = "false";
    var happyoFlg = "false";
    for (var j in this.state.resultList) {
      var resultdata = this.state.resultList[j];
      for (var y in newSelected) {
        if (resultdata.id == newSelected[y]) {
          shussekiFlg = "true";
          for (var z in this.state.selected2) {
            if (newSelected[y] == this.state.selected2[z]) {
              if (resultdata.kengen_cd != "3") {
                happyoFlg = "true";
              }
            }
          }
        }
      }
      if (shussekiFlg == "true") {
        if (happyoFlg == "true") {
          calCoin =
            happyoshaCount * this.state.configCoin * 10 * 5 -
            jogaiCoin +
            calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin:
              happyoshaCount * this.state.configCoin * 10 * 5 - jogaiCoin,
          });
        } else {
          calCoin = happyoshaCount * this.state.configCoin * 10 * 5 + calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin: happyoshaCount * this.state.configCoin * 10 * 5,
          });
        }
      }
      shussekiFlg = "false";
      happyoFlg = "false";
    }
    this.setState({ coin: calCoin });
    this.setState({ haifuCoinList: haifuCoinList });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = (id) => this.state.selected.indexOf(id) !== -1;

  // 2つめ
  handleSelectAllClick2 = (event, checked) => {
    var calCoin = 0;
    var length = 0;
    var selected2 = [];
    var jogaiCoin = this.state.configCoin * 50;
    var haifuCoinList = [];

    if (checked) {
      selected2 = this.state.resultList.map((n) => n.id);
      this.setState({ selected2: this.state.resultList.map((n) => n.id) });
      if (this.state.selected.length > 0) {
        length = this.state.resultList.length - this.state.selected.length;
      }
    } else {
      this.setState({ selected2: [] });
    }
    var happyoshaCount = 0;
    for (var i in this.state.resultList) {
      var resultdata = this.state.resultList[i];
      for (var x in selected2) {
        if (resultdata.id == selected2[x]) {
          if (resultdata.kengen_cd != "3") {
            happyoshaCount = happyoshaCount + 1;
          }
        }
      }
    }
    var shussekiFlg = "false";
    var happyoFlg = "false";
    for (var j in this.state.resultList) {
      var resultdata = this.state.resultList[j];
      for (var y in this.state.selected) {
        if (resultdata.id == this.state.selected[y]) {
          shussekiFlg = "true";
          for (var z in selected2) {
            if (this.state.selected[y] == selected2[z]) {
              if (resultdata.kengen_cd != "3") {
                happyoFlg = "true";
              }
            }
          }
        }
      }
      if (shussekiFlg == "true") {
        if (happyoFlg == "true") {
          calCoin =
            happyoshaCount * this.state.configCoin * 10 * 5 -
            jogaiCoin +
            calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin:
              happyoshaCount * this.state.configCoin * 10 * 5 - jogaiCoin,
          });
        } else {
          calCoin = happyoshaCount * this.state.configCoin * 10 * 5 + calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin: happyoshaCount * this.state.configCoin * 10 * 5,
          });
        }
      }
      shussekiFlg = "false";
      happyoFlg = "false";
    }
    this.setState({ coin: calCoin });
    this.setState({ haifuCoinList: haifuCoinList });
  };

  handleClick3 = (event, id) => {
    var calCoin = 0;
    const { selected2 } = this.state;
    const selectedIndex2 = selected2.indexOf(id);
    let newSelected2 = [];
    var jogaiCoin = this.state.configCoin * 50;
    var haifuCoinList = [];

    if (selectedIndex2 === -1) {
      newSelected2 = newSelected2.concat(selected2, id);
    } else if (selectedIndex2 === 0) {
      newSelected2 = newSelected2.concat(selected2.slice(1));
    } else if (selectedIndex2 === selected2.length - 1) {
      newSelected2 = newSelected2.concat(selected2.slice(0, -1));
    } else if (selectedIndex2 > 0) {
      newSelected2 = newSelected2.concat(
        selected2.slice(0, selectedIndex2),
        selected2.slice(selectedIndex2 + 1)
      );
    }
    this.setState({ selected2: newSelected2 });

    var happyoshaCount = 0;
    for (var i in this.state.resultList) {
      var resultdata = this.state.resultList[i];
      for (var x in newSelected2) {
        if (resultdata.id == newSelected2[x]) {
          if (resultdata.kengen_cd != "3") {
            happyoshaCount = happyoshaCount + 1;
          }
        }
      }
    }
    var shussekiFlg = "false";
    var happyoFlg = "false";
    for (var j in this.state.resultList) {
      var resultdata = this.state.resultList[j];
      for (var y in this.state.selected) {
        if (resultdata.id == this.state.selected[y]) {
          shussekiFlg = "true";
          for (var z in newSelected2) {
            if (this.state.selected[y] == newSelected2[z]) {
              if (resultdata.kengen_cd != "3") {
                happyoFlg = "true";
              }
            }
          }
        }
      }
      if (shussekiFlg == "true") {
        if (happyoFlg == "true") {
          calCoin =
            happyoshaCount * this.state.configCoin * 10 * 5 -
            jogaiCoin +
            calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin:
              happyoshaCount * this.state.configCoin * 10 * 5 - jogaiCoin,
          });
        } else {
          calCoin = happyoshaCount * this.state.configCoin * 10 * 5 + calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin: happyoshaCount * this.state.configCoin * 10 * 5,
          });
        }
      }
      shussekiFlg = "false";
      happyoFlg = "false";
    }
    this.setState({ coin: calCoin });
    this.setState({ haifuCoinList: haifuCoinList });
  };

  isSelected2 = (id) => this.state.selected2.indexOf(id) !== -1;
  // ↑ここまで

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };

  handleChange2 = (name, id) => (event) => {
    const happyotitle_copy = this.state.happyotitle.slice();
    happyotitle_copy[id - 1] = event.target.value;
    this.setState({ happyotitle: happyotitle_copy });
  };

  handleChange3 = (name, id) => (event) => {
    var configCoin = event.target.value;
    var calCoin = 0;
    var selected = [];
    var jogaiCoin = configCoin * 50;
    var happyoshaCount = 0;
    var haifuCoinList = [];
    for (var i in this.state.resultList) {
      var resultdata = this.state.resultList[i];
      for (var x in this.state.selected2) {
        if (resultdata.id == this.state.selected2[x]) {
          if (resultdata.kengen_cd != "3") {
            happyoshaCount = happyoshaCount + 1;
          }
        }
      }
    }
    var shussekiFlg = "false";
    var happyoFlg = "false";
    for (var j in this.state.resultList) {
      var resultdata = this.state.resultList[j];
      for (var y in this.state.selected) {
        if (resultdata.id == this.state.selected[y]) {
          shussekiFlg = "true";
          for (var z in this.state.selected2) {
            if (this.state.selected[y] == this.state.selected2[z]) {
              if (resultdata.kengen_cd != "3") {
                happyoFlg = "true";
              }
            }
          }
        }
      }
      if (shussekiFlg == "true") {
        if (happyoFlg == "true") {
          calCoin = happyoshaCount * configCoin * 10 * 5 - jogaiCoin + calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin: happyoshaCount * configCoin * 10 * 5 - jogaiCoin,
          });
        } else {
          calCoin = happyoshaCount * configCoin * 10 * 5 + calCoin;
          haifuCoinList.push({
            tShainPk: resultdata.t_shain_pk,
            haifuCoin: happyoshaCount * configCoin * 10 * 5,
          });
        }
      }
      shussekiFlg = "false";
      happyoFlg = "false";
    }
    this.setState({ coin: calCoin });
    this.setState({ configCoin: configCoin });
    this.setState({ haifuCoinList: haifuCoinList });
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

  handleClick2 = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleSubmit() {
    this.setState({ loadFlg: true });
    request
      .post(restdomain + "/senkyo_toroku/create")
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
          return;
        }
        this.props.history.push("/senkyo_kanri");
      });
  }

  render() {
    const { classes, theme } = this.props;
    const { anchor, open, open2 } = this.state;
    const {
      resultList,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
    } = this.state;
    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, resultList.length - page * rowsPerPage);
    const loginLink = (props) => <Link to="../" {...props} />;
    const MenuLink = (props) => <Link to="/menu" {...props} />;

    const {
      order2,
      orderBy2,
      selected2,
      rowsPerPage2,
      page2,
      coin,
    } = this.state;
    const emptyRows2 =
      rowsPerPage2 -
      Math.min(rowsPerPage2, resultList.length2 - page2 * rowsPerPage2);

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
              <h2>
                <a href="#bottom" title="ページ最下部へ">
                  <div align="right">
                    <img
                      src="/images/yajirusi-shita.png"
                      width="50"
                      height="50"
                    />
                  </div>
                </a>
                <img
                  src="/images/yajirushi.png"
                  alt="サンプル"
                  align="top"
                  width="30"
                  height="30"
                  style={{ marginTop: 2 }}
                />
                <strong>選挙情報</strong>
              </h2>
              <Typography
                component="p"
                style={{
                  color: "red",
                }}
              >
                {this.state.msg}
              </Typography>
              <Paper className={classes.root}>
                <TextField
                  id="textarea"
                  label="選挙名"
                  placeholder="選挙名を入力"
                  className={classes.textField}
                  value={this.state.election}
                  onChange={this.handleChange("election")}
                  margin="normal"
                  style={{ fontSize: "200%" }}
                  disabled={this.state.disabledFlg}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <br />
                <TextField
                  id="date"
                  label="開始日"
                  type="date"
                  className={classes.textField2}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={this.handleChange("startDate")}
                  disabled={this.state.disabledFlg}
                  value={this.state.startDate}
                />
                <TextField
                  id="date"
                  label="終了日"
                  type="date"
                  className={classes.textField2}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={this.handleChange("endDate")}
                  disabled={this.state.disabledFlg}
                  value={this.state.endDate}
                />
                <br />
                <TextField
                  id="textarea"
                  label="所持コイン数"
                  value={this.state.bccoin}
                  placeholder=""
                  multiline
                  className={classes.textField2}
                  margin="normal"
                  disabled
                />
                <TextField
                  id="number"
                  label="設定コイン（１点あたり）"
                  value={this.state.configCoin}
                  className={classes.textField2}
                  margin="normal"
                  onChange={this.handleChange3("configCoin")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={this.state.disabledFlg}
                />
                <TextField
                  id="textarea"
                  label="配布コイン数"
                  value={this.state.coin}
                  placeholder=""
                  multiline
                  className={classes.textField2}
                  margin="normal"
                  disabled
                />
              </Paper>
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
                <strong>参加者選択</strong>
              </h2>
              <Paper className={classes.root}>
                <div className={classes.tableWrapper}>
                  <Table className={classes.table} aria-labelledby="tableTitle">
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={this.handleSelectAllClick}
                      onRequestSort={this.handleRequestSort}
                      rowCount={this.state.resultList.length}
                      numSelected2={selected2.length}
                      onSelectAllClick2={this.handleSelectAllClick2}
                      disabledFlg={this.state.disabledFlg}
                    />
                    <TableBody>
                      {this.state.resultList
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((n, i) => {
                          const isSelected = this.isSelected(n.id);
                          const isSelected2 = this.isSelected2(n.id);
                          return (
                            <TableRow
                              hover
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={-1}
                              key={n.id}
                              selected={isSelected}
                            >
                              <TableCell
                                padding="checkbox"
                                style={{ width: "5%" }}
                              >
                                <Checkbox
                                  onClick={(event) =>
                                    this.handleClick(event, n.id)
                                  }
                                  checked={isSelected}
                                  disabled={this.state.disabledFlg}
                                />
                              </TableCell>
                              <TableCell
                                padding="checkbox"
                                style={{ width: "5%" }}
                              >
                                <Checkbox
                                  onClick={(event) =>
                                    this.handleClick3(event, n.id)
                                  }
                                  checked={isSelected2}
                                  disabled={this.state.disabledFlg}
                                />
                              </TableCell>
                              <TableCell padding="none" style={{ width: "5%" }}>
                                <Avatar
                                  src={restUrl + `uploads/${n.image_file_nm}`}
                                />
                              </TableCell>
                              <TableCell
                                padding="none"
                                style={{ width: "90%" }}
                              >
                                {n.shimei}
                              </TableCell>
                              <TableCell
                                padding="none"
                                style={{ width: "70%" }}
                              >
                                <TextField
                                  id="happyotitle"
                                  name="happyotitle"
                                  label="Title"
                                  className={classes.textField}
                                  value={this.state.happyotitle[n.id - 1]}
                                  onChange={this.handleChange2(
                                    "happyotitle",
                                    n.id
                                  )}
                                  margin="normal"
                                  disabled={this.state.disabledFlg}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 49 * emptyRows }}>
                          <TableCell colSpan={6} />
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
              {(() => {
                return (
                  <div>
                    <Button
                      className={classes.button}
                      variant="raised"
                      size="large"
                      onClick={this.handleDialogOpen}
                      disabled={this.state.disabledFlg}
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
                      open={this.state.dialogOpen}
                      onClose={this.handleDialogClose}
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
                          onClick={this.handleSubmit.bind(this)}
                          color="primary"
                          autoFocus
                          disabled={this.state.loadFlg}
                        >
                          はい
                        </Button>
                        <Button
                          onClick={this.handleDialogClose}
                          color="primary"
                          disabled={this.state.loadFlg}
                        >
                          いいえ
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>
                );
              })()}
              <a href="#top" title="ページ最上部へ">
                <div align="right">
                  <img src="/images/yajirusi-ue.png" width="50" height="50" />
                </div>
              </a>
              <a name="bottom" />
            </form>
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

const mapState = (state) => ({
  senkyoKanri: state.senkyoKanri,
});

export default withStyles(styles, { withTheme: true })(
  connect(mapState)(PersistentDrawer)
);
