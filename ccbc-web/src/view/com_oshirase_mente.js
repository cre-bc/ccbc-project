import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { Link } from 'react-router-dom'
import { kanriListItems, restUrl, titleItems2 } from './tileData'
import Avatar from '@material-ui/core/Avatar'
import Chip from '@material-ui/core/Chip'
import { Manager, Target, Popper } from 'react-popper'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import MenuList from '@material-ui/core/MenuList'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import FilterListIcon from '@material-ui/icons/FilterList'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import NativeSelect from '@material-ui/core/NativeSelect'
import AddIcon from '@material-ui/icons/Add'
import Icon from '@material-ui/core/Icon'
import EditIcon from '@material-ui/icons/Edit'
import moment from 'moment'
import 'moment/locale/ja'
import request from 'superagent'

const restdomain = require('../common/constans.js').restdomain

let counter = 0

function getNendo(val) {
  var result = '日付文字列が不正です。' //日付不正時のメッセージ
  try {
    var y = Number(val.substr(0, 4))
    var m = Number(val.substr(4, 2))
    var d = Number(val.substr(6, 2))
    var dt = new Date(y, m - 1, d)
    if (dt.getFullYear() == y && dt.getMonth() == m - 1 && dt.getDate() == d) {
      if (m < 4) {
        //4月はじまり
        result = y - 1
      } else {
        result = y
      }
    }
    return result
  } catch (ex) {
    return result
  }
}

function getArray(array1) {
  var array2 = array1.filter(function (x, i, self) {
    return self.indexOf(x) === i
  })
  return array2
}

// function desc(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1
//   }
//   return 0
// }

// function getSorting(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => -desc(a, b, orderBy)
//     : (a, b) => desc(a, b, orderBy)
// }

const columnData = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: '日付'
  },
  {
    id: 'tytle',
    numeric: false,
    disablePadding: true,
    label: '件名'
  },
  {
    id: 'calorie',
    numeric: false,
    disablePadding: true,
    label: '内容'
  }
]

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property)
  }

  render() {
    const {
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount
    } = this.props

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {columnData.map(column => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'dense' : 'none'}
                sortDirection={orderBy === column.id ? order : false}
                style={{ fontSize: '120%' }}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={order === column.id}
                    direction={orderBy}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            )
          }, this)}
        </TableRow>
      </TableHead>
    )
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
}

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85)
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark
      },
  spacer: {
    flex: '1 1 100%'
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: '0 0 auto'
  }
})

let EnhancedTableToolbar = props => {
  const { numSelected, classes } = props

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subheading">
            {numSelected} 件選択
          </Typography>
        ) : (
            <Typography variant="title" id="tableTitle">
              おしらせ一覧
          </Typography>
          )}
      </div>
      <div className={classes.spacer} />
      {/* <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton aria-label="Filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </div> */}
    </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired
}

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar)

const drawerWidth = 240

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  root2: {
    width: '100%',
    marginTop: theme.spacing.unit * 3
  },
  root3: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%'
  },
  buttonFrame: {
    position: 'static',
    marginRight: 24
  },
  buttonFrame2: {
    position: 'static',
    marginRight: 0
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  'appBarShift-left': {
    marginLeft: drawerWidth
  },
  'appBarShift-right': {
    marginRight: drawerWidth
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: 'none'
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  'content-left': {
    marginLeft: -drawerWidth
  },
  'content-right': {
    marginRight: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  'contentShift-left': {
    marginLeft: 0
  },
  'contentShift-right': {
    marginRight: 0
  },
  image: {
    position: 'relative',
    height: 300,
    [theme.breakpoints.down('xs')]: {
      width: '100% !important', // Overrides inline-style
      height: 100
    },
    '&:hover, &$focusVisible': {
      zIndex: 1,
      '& $imageBackdrop': {
        opacity: 1
      },
      '& $imageMarked': {
        opacity: 0
      },
      '& $imageTitle': {
        border: '4px solid currentColor'
      }
    }
  },
  focusVisible: {},
  imageButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white
  },
  imageSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center 40%'
  },
  imageBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create('opacity')
  },
  imageTitle: {
    position: 'relative',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px ${theme
      .spacing.unit + 6}px`,
    fontSize: '300%'
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    bottom: -2,
    left: 'calc(50% - 9px)',
    transition: theme.transitions.create('opacity')
  },
  chip: {
    height: '300%',
    margin: theme.spacing.unit
  },
  appBarColorDefault: {
    backgroundColor: 'rgba(255, 136, 0, 0.92)'
  },
  table: {
    minWidth: 1020
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  },
  button: {
    margin: theme.spacing.unit
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  }
})

class ComOshiraseMenteForm extends React.Component {
  state = {
    age: '',
    open: false,
    open2: false,
    openAdd: false,
    openEdit: false,
    openDelete: false,
    anchor: 'left',
    order: 'asc',
    orderBy: 'name',
    // selected: [],
    page: 0,
    rowsPerPage: 5,
    notice_dt: null,
    title: null,
    comment: null

  }

  constructor(props) {
    super(props)
    const params = this.props.match
    this.state = {
      status: true,
      loaded: false,
      mode: params.params.mode,
      readonly: false,
      selected: [],
      resultList: [],
      resultAllList: [],
      open: false,
      anchor: 'left',
      anchorEl: null,
      addFlg: true,
      Target_year: '',
      nendoList: [],
      order: 'asc',
      orderBy: 'name',
      page: 0,
      rowsPerPage: 5,
      // checked: [1],
      name: [],
      // notice_dt: null,
      // title: null,
      // comment: null
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    // 現在年の取得。取得した年を初期表示する
    var yyyy = getNendo(moment(new Date()).format('YYYYMMDD'))
    //var yyyy = new Date().getFullYear()
    this.setState({ Target_year: yyyy })
    this.state.targetYear = yyyy

    // var loginInfos = JSON.parse(sessionStorage.getItem('loginInfo'))

    // for (var i in loginInfos) {
    //   var loginInfo = loginInfos[i]
    //   this.setState({ userid: loginInfo['userid'] })
    //   this.setState({ password: loginInfo['password'] })
    //   this.setState({ tShainPk: loginInfo['tShainPk'] })
    //   this.setState({ imageFileName: loginInfo['imageFileName'] })
    //   this.setState({ shimei: loginInfo['shimei'] })
    //   this.setState({ kengenCd: loginInfo['kengenCd'] })
    // }

    // request.get(restdomain + '/com_oshirase_mente/find').end((err, res) => {
    //   if (err) return
    //   // 検索結果表示
    //   this.setState({ resultList: res.body.data })
    // })

    request
      .post(restdomain + '/com_oshirase_mente/find')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        // 検索結果表示
        // this.state.resultList = res.body.data
        this.setState({ resultList: res.body.data })
      })

    // 年度表示
    request
      .get(restdomain + '/com_oshirase_mente/find')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        // 年度リスト生成
        var nendoList = []
        for (var i in res.body.data) {
          var r = res.body.data[i]
          var d = moment(new Date(r.notice_dt)).format('YYYYMMDD')
          var nendo = getNendo(d)
          nendoList.push(nendo)
        }
        if (
          this.state.resultList.length === 0 ||
          getNendo(moment(new Date()).format('YYYYMMDD')) != yyyy
        ) {
          nendoList.push(getNendo(moment(new Date()).format('YYYYMMDD')))
        }
        // 年度重複削除
        var nendoList2 = getArray(nendoList)
        this.state.nendoList = nendoList2
        this.setState({ nendoList: nendoList2 })
      })

  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  handleLogoutClick = () => {
    // ログアウト時にsessionStorageをクリアする
    sessionStorage.clear()
  }

  handleToggle = () => {
    this.setState({ open2: !this.state.open2 })
  }

  handleToggleClose = event => {
    if (this.target1.contains(event.target)) {
      return
    }

    this.setState({ open2: false })
  }

  handleClickOpenAdd = () => {
    this.setState({ openAdd: true })
  }

  handleCloseAdd = () => {
    this.setState({ openAdd: false })
  }

  handleClickOpenEdit = () => {
    this.setState({ openEdit: true })
  }

  handleCloseEdit = () => {
    this.setState({ openEdit: false })
  }

  handleClickOpenDelete = () => {
    this.setState({ openDelete: true })
  }

  handleCloseDelete = () => {
    this.setState({ openDelete: false })
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    const resultList =
      order === 'desc'
        ? this.state.resultList.sort(
          (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
        )
        : this.state.resultList.sort(
          (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
        )

    this.setState({ resultList, order, orderBy })
  }

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState(state => ({ selected: state.resultList.map(n => n.id) }))
      return
    }
    this.setState({ selected: [] })
  }

  handleClick = (event, id) => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    this.setState({ selected: newSelected })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  // handleChange = name => event => {
  //   this.setState({ [name]: event.target.value })
  // }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
    //postdata(event.target.value)
    this.state.targetYear = Number(event.target.value)
    request
      //    .get('/com_oshirase_mente/find')
      .post(restdomain + '/com_oshirase_mente/find')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        // 検索結果表示
        this.setState({ resultList: res.body.data })
      })
  }

  handleSubmit() {
    // this.setState({ loadFlg: true })
    // const comment_copy = this.state.comment.slice()
    // for (var i in this.state.comment) {
    // comment_copy[i] = this.state.comment[i].value
    // }
    // this.state.comment = comment_copy

    request
      .post(restdomain + '/com_oshirase_mente/create')
      .send(this.state)
      .end((err, res) => {
        // this.setState({ loadFlg: false })
        if (err) {
          return
        }
        // if (!res.body.status) {
        //   this.setState({
        //     msg: '不正なログインです。'
        //   })
        //   this.setState({ dialogOpen: false })
        //   return
        // }
        // this.props.history.push('/menu')
        this.setState({ resultList: res.body.data })
        // this.handleChange()
        this.setState({ openAdd: false })
      })
  }

  // handleSubmit = event => {
  //   // this.setState({ loadFlg: true })
  //   var form = new FormData()
  //   form.append('image', this.state.gazo)

  //   request
  //     .post(restdomain + '/com_oshirase_mente/create')
  //     .send(form)
  //     //.send(form)
  //     .end((err, res) => {
  //       // this.setState({ loadFlg: false })
  //       if (err) {
  //         return
  //       }
  //       if (res.body.status) {
  //         this.props.history.push('/shain_kensaku')
  //       } else {
  //         if (res.body.tokencheck) {
  //           this.setState({
  //             msg: '入力したユーザIDは既に登録済みです。'
  //           })
  //         } else {
  //           this.setState({
  //             msg: '不正なログインです。'
  //           })
  //         }
  //         this.setState({ dialogOpen: false })
  //         return
  //       }
  //     })
  // }

  handleSubmitEdit() {
    request
      .post(restdomain + '/com_oshirase_mente/edit')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        this.setState({ resultList: res.body.data })
        this.setState({ openEdit: false })
      })
  }

  handleSubmitDelete() {
    request
      .post(restdomain + '/com_oshirase_mente/delete')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        this.setState({ resultList: res.body.data })
        this.setState({ openDelete: false })
      })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render() {
    const { classes, theme } = this.props
    const {
      anchor,
      open,
      open2,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      resultList
    } = this.state
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, resultList.length - page * rowsPerPage)
    const loginLink = props => <Link to="../" {...props} />

    const drawer = (
      <Drawer
        variant="persistent"
        anchor={anchor}
        open={open}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
                <ChevronLeftIcon />
              )}
          </IconButton>
        </div>
        <Divider />
        {kanriListItems()}
      </Drawer>
    )

    let before = null
    let after = null

    if (anchor === 'left') {
      before = drawer
    } else {
      after = drawer
    }

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-${anchor}`]]: open
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
                    ref={node => {
                      this.target1 = node
                    }}
                  >
                    <Chip
                      avatar={
                        <Avatar
                          src={restUrl + `uploads/${this.state.imageFileName}`}
                        />
                      }
                      label={this.state.shimei + '　' + this.state.coin}
                      className={classes.chip}
                      aria-label="More"
                      aria-haspopup="true"
                      onClick={this.handleToggle}
                      className={classNames(
                        !open && classes.buttonFrame,
                        open && classes.buttonFrame2
                      )}
                      style={{ fontSize: '100%' }}
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
                    style={{ transformOrigin: '0 0 0' }}
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
                [classes[`contentShift-${anchor}`]]: open
              }
            )}
          >
            <div className={classes.drawerHeader} />
            {/* 下のdivの中身を画面に応じて変えること。ヘッダ部分は共通のため、触らないこと。 */}
            <div className={classes.root3}>
              {/* 年度選択 */}
              <FormControl className={classes.formControl}>
                {/* <InputLabel htmlFor="age-native-simple" /> */}
                <InputLabel shrink htmlFor="Target_year-simple">
                  年度
                </InputLabel>
                <Select
                  native
                  id="Target_year-simple"
                  value={this.state.Target_year}
                  onChange={this.handleChange}
                  inputProps={{
                    name: 'Target_year',
                    id: 'Target_year-simple'
                  }}
                // input={<Input name="age" id="age-native-label-placeholder" />}
                >
                  {/* <option value="">2019年</option>
                  <option value={10}>2018年</option>
                  <option value={20}>2017年</option> */}
                  {this.state.nendoList.map(n => {
                    return <option value={n}>{n}年</option>
                  })}
                </Select>
              </FormControl>
            </div>
            <div>
              {/* 一覧 */}
              <Paper className={classes.root2}>
                {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
                <div className={classes.tableWrapper}>
                  <Table className={classes.table} aria-labelledby="tableTitle">
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={this.handleSelectAllClick}
                      onRequestSort={this.handleRequestSort}
                      rowCount={this.state.resultList.length}
                    />
                    {/* <div className={classes.tableWrapper}> */}
                    {/* <Table className={classes.table} aria-labelledby="tableTitle"> */}
                    {/* <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={this.handleSelectAllClick}
                      onRequestSort={this.handleRequestSort}
                      rowCount={this.state.resultList.length}
                    /> */}
                    <TableBody>
                      {this.state.resultList
                        // .sort(getSorting(order, orderBy))
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((n, id) => {
                          const isSelected = this.isSelected(id)
                          return (
                            <TableRow
                              hover
                              onClick={event => this.handleClick(event, id)}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={-1}
                              key={n.id}
                              selected={isSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox checked={isSelected} />
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: '10%', fontSize: '120%' }}
                              >
                                {moment(new Date(n.notice_dt)).format(
                                  'YYYY/MM/DD'
                                )}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: '30%', fontSize: '120%' }}
                              >
                                {n.title}
                              </TableCell>
                              <TableCell
                                // numeric
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: '60%', fontSize: '120%' }}
                              >
                                {n.comment}
                              </TableCell>
                              {/* <TableCell numeric>{n.fat}</TableCell>
                              <TableCell numeric>{n.carbs}</TableCell>
                              <TableCell numeric>{n.protein}</TableCell> */}
                            </TableRow>
                          )
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
                    'aria-label': 'Previous Page'
                  }}
                  nextIconButtonProps={{
                    'aria-label': 'Next Page'
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </Paper>
            </div>
            <div>
              {/* 追加ボタン */}
              {/* <Button
                onClick={this.handleClickOpenAdd}
                variant="outlined"
                color="secondary"
                className={classes.button}
              >
                追加
              </Button> */}
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
                <DialogTitle id="form-dialog-title">おしらせの追加</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    日付、件名、内容を入力してください。
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="notice_dt"
                    name="notice_dt"
                    label="日付"
                    type="date"
                    // defaultValue="2019-05-24"
                    fullWidth
                    inputRef={input => {
                      this.state.notice_dt = input
                    }}
                  />
                  <TextField
                    margin="normal"
                    id="title"
                    name="title"
                    label="件名(25文字)"
                    // defaultValue="財界さっぽろ様の「企業特集」に掲載されました"
                    fullWidth
                    inputRef={input => {
                      this.state.title = input
                    }}
                  />
                  <TextField
                    id="comment"
                    name="comment"
                    label="内容(1000文字)"
                    multiline
                    rows="4"
                    // defaultValue="詳細は下記をご覧ください。"
                    className={classes.textField}
                    margin="normal"
                    fullWidth
                    inputRef={input => {
                      this.state.comment = input
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.handleCloseAdd}
                    color="primary">
                    戻る
                  </Button>
                  <Button
                    onClick={this.handleSubmit.bind(this)}
                    // onClick={this.handleCloseAdd}
                    color="secondary">
                    決定
                  </Button>
                </DialogActions>
              </Dialog>

              {/* 編集ボタン */}
              {/* <Button
                onClick={this.handleClickOpenEdit}
                variant="outlined"
                color="primary"
                className={classes.button}
              >
                編集
              </Button> */}
              <Button
                onClick={this.handleClickOpenEdit}
                // variant="extendedFab"
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
                <DialogTitle id="form-dialog-title2">
                  おしらせの編集
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    日付、件名、内容を入力してください。
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name2"
                    label="日付"
                    type="date"
                    defaultValue="2019-05-24"
                    fullWidth
                  />
                  <TextField
                    margin="normal"
                    id="tytle2"
                    label="件名(25文字)"
                    defaultValue="事業内容に2018年度の実績を追加しました"
                    fullWidth
                  />
                  <TextField
                    id="multiline-static2"
                    label="内容(1000文字)"
                    multiline
                    rows="4"
                    defaultValue="事業内容に2018年度の実績を追加しました。詳細は下記ページをご覧ください。https://www.hokkaido-ima.co.jp/"
                    className={classes.textField}
                    margin="normal"
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseEdit} color="primary">
                    戻る
                  </Button>
                  <Button
                    // onClick={this.handleCloseEdit}
                    color="secondary"
                    onClick={this.handleSubmitEdit.bind(this)}
                  >
                    決定
                  </Button>
                </DialogActions>
              </Dialog>

              {/* 削除ボタン */}
              {/* <Button
                onClick={this.handleClickOpenDelete}
                variant="outlined"
                className={classes.button}
              >
                削除
              </Button> */}

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
                  {'削除してよろしいですか。'}
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
                    // onClick={this.handleCloseDelete}
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
    )
  }
}

ComOshiraseMenteForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
}

export default withStyles(styles, { withTheme: true })(ComOshiraseMenteForm)
