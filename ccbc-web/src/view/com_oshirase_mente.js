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

let counter = 0
function createData(date, name, tytle, calories) {
  counter += 1
  return { id: counter, date, name, tytle, calories }
}

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => -desc(a, b, orderBy)
    : (a, b) => desc(a, b, orderBy)
}

const rows = [
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
  // { id: 'calorie', numeric: true, disablePadding: false, label: '内容' }
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
          {rows.map(row => {
            return (
              <TableCell
                key={row.id}
                numeric={row.numeric}
                padding={row.disablePadding ? 'dense' : 'none'}
                sortDirection={orderBy === row.id ? order : false}
                style={{ fontSize: '120%' }}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
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
    selected: [],
    data: [
      createData(
        20190627,
        '2019/06/27',
        '2021年度卒業者対象のインターンシップ情報を掲載いたしました',
        '2021年度卒業者対象のインターンシップ情報を掲載いたしました。詳細は下記をご覧ください。https://www.hokkaido-ima.co.jp/'
      ),
      createData(
        20190625,
        '2019/06/25',
        'SSLサーバー証明書 月額版サービス「wwwあり/なし」両方のhttps表示に対応しました',
        '各種関連サービスにおきまして提供内容の拡張を行いました。これにより、wwwあり/なし両方のURLでお客様のホームぺージをhttpsで表示することができるようになる証明書がご利用いただけます。'
      ),
      createData(
        20190624,
        '2019/06/24',
        'お問い合わせ窓口受付時間変更のお知らせ',
        '2019年6月24日（月）より、技術内容の問い合わせ窓口の受付時間を変更いたします。'
      ),
      createData(
        20190620,
        '2019/06/20',
        'Webサーババージョン2への切替えに関するご案内',
        'サーババージョン1環境で公開中のホームページ閲覧に関する重要な内容となりますので、内容をご確認いただき是非サーババージョン2環境への切替えをご検討いただきますよう、お願い申し上げます。'
      ),
      createData(
        20190526,
        '2019/05/26',
        '事業内容に2018年度の実績を追加しました',
        '事業内容に2018年度の実績を追加しました。詳細は下記ページをご覧ください。https://www.hokkaido-ima.co.jp/'
      ),
      createData(
        20190416,
        '2019/04/16',
        '財界さっぽろ様の「企業特集」に掲載されました',
        '財界さっぽろ様の「企業特集」に掲載されました。詳細は下記ページをご覧ください。https://www.hokkaido-ima.co.jp/'
      ),
      createData(
        20190101,
        '2019/01/01',
        'Windows 10（バージョン 1809　ビルド 17763）の対応について',
        'Windows 10(バージョン 1809　ビルド 17763)の対応状況について、ご案内させていただきます。'
      ),
      createData(
        20190310,
        '2019/03/10',
        'サーバメンテナンスのお知らせ',
        '下記日程におきまして、メンテナンス作業を実施致します。これに伴いサービス停止の影響が発生致します。詳細につきましては、下記をご参照ください。ご迷惑をお掛け致しますが、ご了承くださいますようよろしくお願い申し上げます。'
      ),
      createData(
        20190626,
        '2019/06/26',
        'メンテナンスのお知らせ',
        '下記日程におきまして、メンテナンス作業を実施致します。これに伴いサービス停止の影響が発生致します。詳細につきましては、下記をご参照ください。ご迷惑をお掛け致しますが、ご了承くださいますようよろしくお願い申し上げます。'
      ),
      createData(
        20190610,
        '2019/06/10',
        '緊急メンテナンスのお知らせ',
        '下記日程におきまして、緊急メンテナンス作業を実施致します。これに伴いサービス停止の影響が発生致します。詳細につきましては、下記をご参照ください。ご迷惑をお掛け致しますが、ご了承くださいますようよろしくお願い申し上げます。'
      ),
      createData(
        20190607,
        '2019/06/07',
        '管理者機能・ご利用メニュー障害発生のご報告',
        '下記の時間帯、以下障害が発生しておりました。現在は復旧しております。ご迷惑をお掛けいたしました。深くお詫び申し上げます。	2019年6月6日（木）1時25分～同日2時6分　※24時間表記'
      )
    ],
    page: 0,
    rowsPerPage: 5
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
    // 現在年の取得。取得した年を初期表示する
    var yyyy = getNendo(moment(new Date()).format('YYYYMMDD'))
    //var yyyy = new Date().getFullYear()
    this.setState({ Target_year: yyyy })
    this.state.targetYear = yyyy

    var loginInfos = JSON.parse(sessionStorage.getItem('loginInfo'))

    for (var i in loginInfos) {
      var loginInfo = loginInfos[i]
      this.setState({ userid: loginInfo['userid'] })
      this.setState({ password: loginInfo['password'] })
      this.setState({ tShainPk: loginInfo['tShainPk'] })
      this.setState({ imageFileName: loginInfo['imageFileName'] })
      this.setState({ shimei: loginInfo['shimei'] })
      this.setState({ kengenCd: loginInfo['kengenCd'] })
    }

    request.get(restdomain + '/con_oshirase_mente/find').end((err, res) => {
      if (err) return
      // 検索結果表示
      this.setState({ resultList: res.body.data })
    })

    /** 年度表示
    request
      .get(restdomain + '/con_oshirase_mente/findall')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        // 年度リスト生成
        var nendoList = []
        for (var i in res.body.data) {
          var r = res.body.data[i]
          var d = moment(new Date(r.tohyo_kaishi_dt)).format('YYYYMMDD')
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
    */

    request
      .post(restdomain + '/con_oshirase_mente/findall')
      .send(this.state)
      .end((err, res) => {
        if (err) return
        // 検索結果表示
        this.setState({ resultAllList: res.body.data })
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

    this.setState({ order, orderBy })
  }

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState(state => ({ selected: state.data.map(n => n.id) }))
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

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render() {
    const { classes, theme } = this.props
    const {
      anchor,
      open,
      open2,
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page
    } = this.state
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage)
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
                <InputLabel shrink htmlFor="age-native-simple">
                  年度
                </InputLabel>
                <Select
                  native
                  value={this.state.age}
                  onChange={this.handleChange('age')}
                  // inputProps={{
                  //   name: 'age',
                  //   id: 'age-native-simple'
                  // }}
                  input={<Input name="age" id="age-native-label-placeholder" />}
                >
                  <option value="">2019年</option>
                  <option value={10}>2018年</option>
                  <option value={20}>2017年</option>
                </Select>
              </FormControl>
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
                      onSelectAllClick={this.handleSelectAllClick}
                      onRequestSort={this.handleRequestSort}
                      rowCount={data.length}
                    />
                    <TableBody>
                      {data
                        .sort(getSorting(order, orderBy))
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map(n => {
                          const isSelected = this.isSelected(n.id)
                          return (
                            <TableRow
                              hover
                              onClick={event => this.handleClick(event, n.id)}
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
                                {n.name}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: '30%', fontSize: '120%' }}
                              >
                                {n.tytle}
                              </TableCell>
                              <TableCell
                                // numeric
                                component="th"
                                scope="row"
                                padding="dense"
                                style={{ width: '60%', fontSize: '120%' }}
                              >
                                {n.calories}
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
                  count={data.length}
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
                    id="name1"
                    label="日付"
                    type="date"
                    defaultValue="2019-05-24"
                    fullWidth
                  />
                  <TextField
                    margin="normal"
                    id="tytle1"
                    label="件名(25文字)"
                    defaultValue="財界さっぽろ様の「企業特集」に掲載されました"
                    fullWidth
                  />
                  <TextField
                    id="multiline-static"
                    label="内容(1000文字)"
                    multiline
                    rows="4"
                    defaultValue="詳細は下記をご覧ください。"
                    className={classes.textField}
                    margin="normal"
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseAdd} color="primary">
                    戻る
                  </Button>
                  <Button onClick={this.handleCloseAdd} color="secondary">
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
                  <Button onClick={this.handleCloseEdit} color="secondary">
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
                    onClick={this.handleCloseDelete}
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
