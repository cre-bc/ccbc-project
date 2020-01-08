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
import TextField from '@material-ui/core/TextField'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  )
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired
}



const drawerWidth = 240
const drawerWidthTab = 100

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  tab: {
    flexGrow: 1,
    display: 'table-header-group',
    width: `calc(100% - ${drawerWidthTab}px)`,
    position: 'absolute',
    marginLeft: '2%'
  },
  pre: {
    marginTop: 5,
    opacity: 0,
    appearance: 'none',
    position: 'absolute'
  },
  imagePre: {
    clear: 'right',
    marginLeft: '35%',
    height: 120,
    width: 300,
    canvas: true
  },
  fileButton: {
    marginTop: 20,
    float: 'left'
  },
  submitButton: {
    margin: 0,
    top: 'auto',
    left: 'auto',
    bottom: 'auto',
    position: 'absolute'
  },
  massage: {
    marginTop: 100,
    marginLeft: 20
  },
  checked: {},
  size: {
    width: 40,
    height: 40
  },
  sizeIcon: {
    fontSize: 20
  },

  appFrame: {
    zIndex: 1,
    overflow: 'flex',
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

class ComKokokuMenteForm extends React.Component {
  state = {
    open: false,
    open2: false,
    openDialog: false,
    anchor: 'left',
    checkedA: true
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

  handleClickOpen = () => {
    this.setState({ openDialog: true })
  }

  handleClose = () => {
    this.setState({ openDialog: false })
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

  handleChange = (event, value) => {
    this.setState({ value })
  }

  handleChangeIndex = index => {
    this.setState({ value: index })
  }

  handleCheckedChange1 = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleCheckedChange2 = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleCheckedChange3 = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleCheckedChange4 = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleCheckedChange5 = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  onFileChange1(e) {
    const files = e.target.files
    if (files.length > 0) {
      var file = files[0]
      var reader = new FileReader()
      reader.onload = e => {
        this.setState({ imageData1: e.target.result })
      }
      reader.readAsDataURL(file)
    } else {
      this.setState({ imageData1: null })
    }
  }
  onFileChange2(e) {
    const files = e.target.files
    if (files.length > 0) {
      var file = files[0]
      var reader = new FileReader()
      reader.onload = e => {
        this.setState({ imageData2: e.target.result })
      }
      reader.readAsDataURL(file)
    } else {
      this.setState({ imageData2: null })
    }
  }
  onFileChange3(e) {
    const files = e.target.files
    if (files.length > 0) {
      var file = files[0]
      var reader = new FileReader()
      reader.onload = e => {
        this.setState({ imageData3: e.target.result })
      }
      reader.readAsDataURL(file)
    } else {
      this.setState({ imageData3: null })
    }
  }

  onFileChange4(e) {
    const files = e.target.files
    if (files.length > 0) {
      var file = files[0]
      var reader = new FileReader()
      reader.onload = e => {
        this.setState({ imageData4: e.target.result })
      }
      reader.readAsDataURL(file)
    } else {
      this.setState({ imageData4: null })
    }
  }

  onFileChange5(e) {
    const files = e.target.files
    if (files.length > 0) {
      var file = files[0]
      var reader = new FileReader()
      reader.onload = e => {
        this.setState({ imageData5: e.target.result })
      }
      reader.readAsDataURL(file)
    } else {
      this.setState({ imageData5: null })
    }
  }

  handleSubmit = () => {
    this.setState({ loadFlg: true })
    var bkcomment = this.state.comment
    const comment_copy = this.state.comment.slice()
    for (var i in this.state.comment) {
      comment_copy[i] = this.state.comment[i].value
    }
    this.state.comment = comment_copy

    // request
    //   .post(restdomain + '/com_kokoku_mente/create')
    //   .send(this.state)
    //   .end((err, res) => {
    //     this.setState({ loadFlg: false })
    //     if (err) {
    //       return
    //     }
    //     if (!res.body.status) {
    //       this.setState({
    //         msg: '不正なログインです。'
    //       })
    //       this.setState({ dialogOpen: false })
    //       this.state.comment = bkcomment
    //       return
    //     }
    //     this.props.history.push('/menu')
    //   })
  }

  render() {
    const { classes, theme } = this.props
    const { anchor, open, open2 } = this.state
    const loginLink = props => <Link to="../" {...props} />
    const { fullScreen } = this.props

    const imageData1 = this.state.imageData1
    const imageData2 = this.state.imageData2
    const imageData3 = this.state.imageData3
    const imageData4 = this.state.imageData4
    const imageData5 = this.state.imageData5

    const checked1 = this.state.checked1
    const checked2 = this.state.checked2
    const checked3 = this.state.checked3
    const checked4 = this.state.checked4
    const checked5 = this.state.checked5

    let preview1 = ''
    let preview2 = ''
    let preview3 = ''
    let preview4 = ''
    let preview5 = ''

    if (imageData1 != null) {
      preview1 = (
        <div>
          <img width="400" height="250" src={imageData1} />
        </div>
      )
    }
    if (imageData2 != null) {
      preview2 = (
        <div>
          <img width="400" height="250" src={imageData2} />
        </div>
      )
    }
    if (imageData3 != null) {
      preview3 = (
        <div>
          <img width="400" height="250" src={imageData3} />
        </div>
      )
    }
    if (imageData4 != null) {
      preview4 = (
        <div>
          <img width="400" height="250" src={imageData4} />
        </div>
      )
    }
    if (imageData5 != null) {
      preview5 = (
        <div>
          <img width="400" height="250" src={imageData5} />
        </div>
      )
    }

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
              <div className={classes.tab}>
                <AppBar position="static" color="default">
                  <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                  >
                    <Tab label="広告１" />
                    <Tab label="広告２" />
                    <Tab label="広告３" />
                    <Tab label="広告４" />
                    <Tab label="広告５" />
                  </Tabs>
                </AppBar>

                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={this.state.value}
                  onChangeIndex={this.handleChangeIndex}
                >
                  <TabContainer dir={theme.direction}>
                    <div>
                      <Typography variant="headline" align="left">
                        広告１
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
                            onChange={e => {
                              this.onFileChange1(e)
                            }}
                          />
                        </Button>
                      </div>
                      <div className={classes.imagePre}>{preview1}</div>
                      <div className={classes.massage}>
                        <TextField
                          value={this.state.massage1}
                          id="massage1"
                          label="広告メッセージ(500文字)"
                          placeholder="内容"
                          rows="10"
                          length="500"
                          multiline
                          fullWidth
                          className={classes.textField}
                          margin="normal"
                        />
                      </div>
                    </div>
                    <div>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.checked1}
                            onChange={this.handleCheckedChange1('checked1')}
                            value={checked1}
                          />
                        }
                        label="広告情報を無効にする"
                      />
                    </div>
                  </TabContainer>
                  <TabContainer dir={theme.direction}>
                    <div>
                      <Typography variant="headline" align="left">
                        広告２
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
                            onChange={e => {
                              this.onFileChange2(e)
                            }}
                          />
                        </Button>
                      </div>
                      <div className={classes.imagePre}>{preview2}</div>
                      <div className={classes.massage}>
                        <TextField
                          value={this.state.massage2}
                          id="massage2"
                          label="広告メッセージ(500文字)"
                          placeholder="内容"
                          rows="10"
                          multiline
                          fullWidth
                          className={classes.textField}
                          margin="normal"
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.checked2}
                              onChange={this.handleCheckedChange2('checked2')}
                              value={checked2}
                            />
                          }
                          label="広告情報を無効にする"
                        />
                      </div>
                    </div>
                  </TabContainer>
                  <TabContainer dir={theme.direction}>
                    <div>
                      <Typography variant="headline" align="left">
                        広告３
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
                            onChange={e => {
                              this.onFileChange3(e)
                            }}
                          />
                        </Button>
                      </div>
                      <div className={classes.imagePre}>{preview3}</div>
                      <div className={classes.massage}>
                        <TextField
                          value={this.state.massage3}
                          id="massage3"
                          label="広告メッセージ(500文字)"
                          placeholder="内容"
                          rows="10"
                          multiline
                          fullWidth
                          className={classes.textField}
                          margin="normal"
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.checked3}
                              onChange={this.handleCheckedChange3('checked3')}
                              value={checked3}
                            />
                          }
                          label="広告情報を無効にする"
                        />
                      </div>
                    </div>
                  </TabContainer>
                  <TabContainer dir={theme.direction}>
                    <div>
                      <Typography variant="headline" align="left">
                        広告４
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
                            onChange={e => {
                              this.onFileChange4(e)
                            }}
                          />
                        </Button>
                      </div>
                      <div className={classes.imagePre}>{preview4}</div>
                      <div className={classes.massage}>
                        <TextField
                          value={this.state.massage4}
                          id="massage4"
                          label="広告メッセージ(500文字)"
                          placeholder="内容"
                          rows="10"
                          multiline
                          fullWidth
                          className={classes.textField}
                          margin="normal"
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.checked4}
                              onChange={this.handleCheckedChange4('checked4')}
                              value={checked4}
                            />
                          }
                          label="広告情報を無効にする"
                        />
                      </div>
                    </div>
                  </TabContainer>
                  <TabContainer dir={theme.direction}>
                    <div>
                      <Typography variant="headline" align="left">
                        広告５
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
                            onChange={e => {
                              this.onFileChange5(e)
                            }}
                          />
                        </Button>
                      </div>
                      <div className={classes.imagePre}>{preview5}</div>
                      <div className={classes.massage}>
                        <TextField
                          value={this.state.massage5}
                          id="massage5"
                          label="広告メッセージ(1000文字)"
                          placeholder="内容"
                          rows="10"
                          multiline
                          fullWidth
                          className={classes.textField}
                          margin="normal"
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.checked5}
                              onChange={this.handleCheckedChange5('checked5')}
                              value={checked5}
                            />
                          }
                          label="広告情報を無効にする"
                        />
                      </div>
                    </div>
                  </TabContainer>
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
                      {'広告とメッセージを登録します'}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        現在各広告に設定されている画像とメッセージを登録します。
                        よろしいですか？
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleClose} color="primary">
                        いいえ
                      </Button>
                      <Button
                        onClick={this.handleSubmit}
                        onClick={this.handleClose}
                        color="primary"
                        autoFocus
                      >
                        はい
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
    )
  }
}

ComKokokuMenteForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
}

export default withStyles(styles, { withTheme: true })(ComKokokuMenteForm)
