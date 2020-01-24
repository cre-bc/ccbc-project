import React from 'react'
import request from 'superagent'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Button from '@material-ui/core/Button'
import Send from '@material-ui/icons/Send'
import { Link } from 'react-router-dom'
import { kanriListItems, systemName, restUrl, titleItems2 } from './tileData'
import Avatar from '@material-ui/core/Avatar'

import Chip from '@material-ui/core/Chip'
import { Manager, Target, Popper } from 'react-popper'
import Grow from '@material-ui/core/Grow'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const restdomain = require('../common/constans.js').restdomain

const drawerWidth = 240

const styles = theme => ({
    root: {
        flexGrow: 1,
        overflowY: "hidden"
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
        height: 200,
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.15
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
            .spacing.unit + 6}px`
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
    card2: {
        display: 'flex'
    },
    details2: {
        display: 'flex',
        flexDirection: 'column'
    },
    details3: {
        display: 'table-cell',
        verticalAlign: 'middle'
    },
    content2: {
        flex: '1 0 auto'
    },
    cover2: {
        width: 151,
        height: 151
    },
    controls2: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing.unit,
        paddingBottom: theme.spacing.unit
    },
    completed: {
        display: 'inline-block'
    },
    instructions: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit
    },
    stepSize: {
        width: 20,
        height: 10,
        textAlign: 'left',
        verticalAlign: 'top'
    },
    stepSize2: {
        width: 15,
        height: 5,
        textAlign: 'left',
        verticalAlign: 'top'
    },
    tdSize: {
        textAlign: 'left',
        verticalAlign: 'bottom',
        paddingBottom: '7px'
    },
    input: {
        margin: theme.spacing.unit
    },
    avatarRow: {
        display: 'flex',
        justifyContent: 'center'
    },
    avatar: {
        margin: 10
    },
    bigAvatar: {
        width: 150,
        height: 150
    },
    headLine: {
        width: 350
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 900
    },
    paper: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto'
    },
    table: {
        minWidth: 700
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default
        }
    },
    addToPaper: {
        marginTop: 10,
        marginLeft: 650,
        fontSize: 18
    },
    InputLabel: {
        whiteSpace: 'nowrap'
    },
    select: {
        width: 140
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120
    },
    coinInfoTable: {
        width: 500
    },
    appBarColorDefault: {
        backgroundColor: 'rgba(255, 136, 0, 0.92)'
    },
    categoryTable: {
        width: "20%",
        float: "left"
    },
    articleTable: {
        width: "80%",
        height: "95%",
        float: "left",
    },
    articleHeaderTable: {
        textAlign: "center",
        marginBottom: 20
    },
    articleCardTable: {
        width: "98%",
        height: "90%",
        marginLeft: 50,
        overflowY: "scroll",
        overflowX: "hidden"
    },
    articleCard: {
        padding: 50,
        marginBottom: 20,
        marginRight: 10
    },
})

class ArticleForm extends React.Component {
    state = {
        open: false,
        open2: false,
        anchor: 'left',
        completed: {},
        resultList: [],
        userid: null,
        password: null,
        tShainPk: 0,
        imageFileName: null,
        shimei: null,
        kengenCd: null,
        target_manager: 0,
        comment: '',
        checked: false,
        zoyoCoin: 0,
        from_bcaccount: '',
        to_bcaccount: '',
        to_tShainPk: '',
        nenjiFlg: '0',
        jimuId: 0,
        jimuFlg: false,
        alertOpen: false,
        dialogOpen: false,
        alertMsg: '',
        tokenId: null,
        msg: null,
        loadFlg: false,


        categoryList: [],
        current_kiji_category_pk: "",

    }

    constructor(props) {
        super(props)
    }

    /** コンポーネントのマウント時処理 */
    componentWillMount() {
        var loginInfos = JSON.parse(sessionStorage.getItem('loginInfo'))
        for (var i in loginInfos) {
            var loginInfo = loginInfos[i]
            this.setState({ userid: loginInfo['userid'] })
            this.setState({ password: loginInfo['password'] })
            this.setState({ tShainPk: loginInfo['tShainPk'] })
            this.state.tShainPk = Number(loginInfo['tShainPk'])
            this.setState({ imageFileName: loginInfo['imageFileName'] })
            this.setState({ shimei: loginInfo['shimei'] })
            this.setState({ kengenCd: loginInfo['kengenCd'] })
            this.setState({ tokenId: loginInfo['tokenId'] })
            if (loginInfo['kengenCd'] === '0') {
                this.setState({ jimuFlg: true })
            }
        }

        // request
        //     .post(restdomain + '/coin_zoyo/find')
        //     .send(this.state)
        //     .end((err, res) => {
        //         if (err) {
        //             return
        //         }
        //         var resList = res.body.data
        //         var bccoin = String(res.body.bccoin)
        //         // 検索結果表示
        //         this.setState({ resultList: resList })
        //         this.state.bccoin = bccoin
        //         this.setState({ bccoin: bccoin })
        //         this.setState({ shimei: res.body.shimei })
        //         this.setState({ from_bcaccount: res.body.from_bcaccount })

        //         for (var i in resList) {
        //             var data = resList[i]
        //             if (data.kengen_cd === '0') {
        //                 this.setState({ jimuId: data.id })
        //             }
        //         }
        //     })
    }

    /** 入力コントロール */
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        })
    }

    /** -- ↓ 共通 ↓　-- */
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
    /** -- ↑ 共通 ↑　-- */

    /** ダイアログ終了 */
    handleClose = () => {
        this.setState({ alertOpen: false })
        this.setState({ dialogOpen: false })
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
                <List>{kanriListItems()}</List>
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
                    {/* --- ヘッダ共通 --- */}
                    <AppBar
                        className={classNames(classes.appBar, {
                            [classes.appBarShift]: open,
                            [classes[`appBarShift-${anchor}`]]: open
                        })}
                        classes={{ colorPrimary: this.props.classes.appBarColorDefault }}>
                        <Toolbar disableGutters={!open}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={this.handleDrawerOpen}
                                className={classNames(classes.menuButton, open && classes.hide)}>
                                <MenuIcon />
                            </IconButton>
                            {titleItems2}
                            <Manager>
                                <Target>
                                    <div ref={node => { this.target1 = node }} >
                                        <Chip
                                            avatar={<Avatar src={restUrl + `uploads/${this.state.imageFileName}`} />}
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
                                    className={classNames({ [classes.popperClose]: !open2 })} >
                                    <Grow
                                        in={open2}
                                        id="menu-list-grow"
                                        style={{ transformOrigin: '0 0 0' }} >
                                        <Paper>
                                            <MenuList role="menu">
                                                <MenuItem
                                                    onClick={this.handleLogoutClick}
                                                    component={loginLink} >
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
                            classes[`content-${anchor}`], {
                            [classes.contentShift]: open,
                            [classes[`contentShift-${anchor}`]]: open
                        })}>
                        <div className={classes.drawerHeader} />

                        <div className={classes.categoryTable}>
                            <List component="nav" aria-label="mailbox folders">
                                <ListItem button>
                                    <ListItemText primary="ライフハック" />
                                </ListItem>
                                <Divider />
                                <ListItem button divider>
                                    <ListItemText primary="おすすめの本" />
                                </ListItem>
                                <ListItem button>
                                    <ListItemText primary="イベント情報" />
                                </ListItem>
                                <Divider />
                                <ListItem button>
                                    <ListItemText primary="美味しいお店" />
                                </ListItem>
                                <Divider />
                                <ListItem button>
                                    <ListItemText primary="その他" />
                                </ListItem>
                                <Divider />
                            </List>
                        </div>

                        <div className={classes.articleTable}>
                            <div className={classes.articleHeaderTable}>
                                <span>記事のカテゴリ</span>
                            </div>
                            <div className={classes.articleCardTable}>
                                <Card className={classes.articleCard}>
                                    <div>記事のタイトル</div>
                                    <div>
                                        a
                                        <br /><br /><br />
                                        b
                                    </div>
                                </Card>
                                <Card className={classes.articleCard}>
                                    <div>記事のタイトル</div>
                                    <div>
                                        a
                                        <br /><br /><br />
                                        b
                                    </div>
                                </Card>
                                <Card className={classes.articleCard}>
                                    <div>記事のタイトル</div>
                                    <div>
                                        a
                                        <br /><br /><br />
                                        b
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </main>
                    {after}
                </div>
            </div>
        )
    }
}

ArticleForm.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
}

export default withStyles(styles, { withTheme: true })(ArticleForm)
