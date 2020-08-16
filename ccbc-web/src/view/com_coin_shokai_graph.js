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

/** 検索条件部分 */
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

/** 投票照会より流用 */
import request from 'superagent'
import { connect } from 'react-redux'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

/** ボタン部分 */
import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import KeyboardVoiceICon from '@material-ui/icons/KeyboardVoice'
import Icon from '@material-ui/core/Icon'
import SaveIcon from '@material-ui/icons/Save'
import PageviewIcon from '@material-ui/icons/Pageview'
import Assessment from '@material-ui/icons/Assessment'
import NavigationIcon from '@material-ui/icons/Navigation'

//表示させたいデータ群
const data_event = [
  { name: '吉田　裕一', 使用コイン: 1500, 受領コイン: 1600 },
  { name: '角谷　貴之', 使用コイン: 1000, 受領コイン: 1600 },
  { name: '井上　卓', 使用コイン: 750, 受領コイン: 750 },
  { name: '石垣　努', 使用コイン: 500, 受領コイン: 1000 },
  { name: '山城　博紀', 使用コイン: 100, 受領コイン: 600 }
]
/** 検索部分のリストボックス */
const ranges1 = [
  {
    value: 'ソート１',
    label: '使用コイン（昇順）'
  },
  {
    value: 'ソート２',
    label: '使用コイン（降順）'
  },
  {
    value: 'ソート３',
    label: '受領コイン（昇順）'
  },
  {
    value: 'ソート４',
    label: '受領コイン（降順）'
  },
  {
    value: 'ソート５',
    label: '氏名（昇順）'
  },
  {
    value: 'ソート６',
    label: '氏名（降順）'
  }
]
const ranges2 = [
  {
    value: 'イベント１',
    label: 'チャット'
  },
  {
    value: 'イベント２',
    label: '記事投稿'
  },
  {
    value: 'イベント３',
    label: 'ショッピングカート'
  },
  {
    value: 'イベント４',
    label: 'HARVEST投票'
  }
]
const drawerWidth = 240

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  margin: {
    margin: theme.spacing.unit
  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    flexBasis: 200,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  /** ここからボタン */
  button: {
    margin: theme.spacing.unit
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  },
  /** ここまでボタン */
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
  }
})

class ComCoinShokaiGraphForm extends React.Component {
  state = {
    open: false,
    open2: false,
    anchor: 'left'
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount() {
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
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }
  handleChange = prop => event => {
    this.setState({ [prop]: event.target.value })
  }

  handleChange2 = prop => event => {
    this.setState({ [prop]: event.target.value })
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

  render() {
    const { classes, theme } = this.props
    const { anchor, open, open2 } = this.state
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
            <div>
              <form className={classes.container} noValidate>
                <TextField
                  id="date"
                  label="日付（開始）"
                  type="month"
                  defaultValue="2019-6-23"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                <TextField
                  id="date"
                  label="日付（終了）"
                  type="month"
                  defaultValue="2019-6-23"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                <TextField
                  select
                  label="イベント"
                  className={classNames(classes.textField)}
                  value={this.state.weightRange2}
                  onChange={this.handleChange2('weightRange2')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />
                  }}
                >
                  {ranges2.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="ソート順"
                  className={classNames(classes.textField)}
                  value={this.state.weightRange}
                  onChange={this.handleChange('weightRange')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />
                  }}
                >
                  {ranges1.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </form>
              <Button
                size="midium"
                variant="raised"
                aria-label="Delete"
                className={classes.button}
              >
                <PageviewIcon
                  className={classNames(classes.leftIcon, classes.iconSmall)}
                />
                検索
              </Button>
              <br />
              <div>
                <ComposedChart //グラフ全体のサイズや位置、データを指定。場合によってmarginで上下左右の位置を指定する必要あり。
                  width={1280} //グラフ全体の幅を指定
                  height={650} //グラフ全体の高さを指定
                  layout="vertical" //グラフのX軸とY軸を入れ替え
                  data={data_event} //Array型のデータを指定
                  margin={{ top: 20, right: 60, bottom: 0, left: 150 }} //marginを指定
                >
                  <XAxis //X軸に関する設定
                    xAxisId="use"
                    orientation="top"
                    type="number" //データタイプをnumberに変更。デフォルトではcategoryになっている
                    domain={[0, 5000]} //軸の表示領域を指定
                    stroke="#000000"
                  />
                  <XAxis //X軸に関する設定
                    xAxisId="get"
                    orientation="bottom"
                    type="number" //データタイプをnumberに変更。デフォルトではcategoryになっている
                    domain={[0, 5000]} //軸の表示領域を指定
                    stroke="#000000"
                  />
                  <YAxis //Y軸に関する設定
                    type="category" //データタイプをcategoryに変更
                    dataKey="name" //Array型のデータの、Y軸に表示したい値のキーを指定
                    stroke="#000000" //軸の色を黒に指定
                  />
                  <Tooltip />{' '}
                  ////hoverさせた時に具体的な値を表示させるように指定
                  <CartesianGrid //グラフのグリッドを指定
                    stroke="#000000" //グリッド線の色を指定
                    strokeDasharray="3 3" //グリッド線を点線に指定
                  />
                  <Legend />
                  <Bar
                    xAxisId="use"
                    dataKey="使用コイン"
                    barSize={20}
                    stroke="rgba(34, 80, 162, 0.2)"
                    fillOpacity={1}
                    fill="#FC6903"
                  />
                  <Bar
                    xAxisId="get"
                    dataKey="受領コイン"
                    barSize={20}
                    stroke="rgba(34, 80, 162, 0.2)"
                    fillOpacity={1}
                    fill="#fccb00"
                  />
                </ComposedChart>
              </div>
            </div>
          </main>
          {after}
        </div>
      </div>
    )
  }
}

ComCoinShokaiGraphForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
}

export default withStyles(styles, { withTheme: true })(ComCoinShokaiGraphForm)
