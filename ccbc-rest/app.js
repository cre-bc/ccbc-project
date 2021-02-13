const fallback = require('express-history-api-fallback')
const createError = require('http-errors')
const express = require('express')
const resource = require('express-resource')
const root = __dirname + '/static'
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const serverRouter = require('./routes/server')
const imageRouter = require('./routes/image')
const tohyoTorokuRouter = require('./routes/tohyo_toroku')
const senkyoKanriRouter = require('./routes/senkyo_kanri')
const senkyoTorokuRouter = require('./routes/senkyo_toroku')
const commentShokaiRouter = require('./routes/comment_shokai')
const coinShokaiRouter = require('./routes/coin_shokai')
const coinZoyoRouter = require('./routes/coin_zoyo')
const loginRouter = require('./routes/login')
const tohyoShokaiKobetsuRouter = require('./routes/tohyo_shokai_kobetsu')
const tohyoIchiranRouter = require('./routes/tohyo_ichiran')
const tohyo_shokai_shosaiRouter = require('./routes/tohyo_shokai_shosai')
const shainTorokuRouter = require('./routes/shain_toroku')
const tohyo_shokai_nendoRouter = require('./routes/tohyo_shokai_nendo')
const shain_kensakuRouter = require('./routes/shain_kensaku')
const loginGroupRouter = require('./routes/login_group')
//const com_coin_shokai_graphRouter = require('./routes/com_coin_shokai_graph')

// TODO : ここにComComCoin用のAPIを追加していく
const com_shohin_menteRouter = require('./routes/com_shohin_mente')
const com_kokoku_menteRouter = require('./routes/com_kokoku_mente')
const com_oshirase_menteRouter = require('./routes/com_oshirase_mente')
const com_coin_shojicoinRouter = require('./routes/com_coin_shojicoin')
const com_coin_shokaiRouter = require('./routes/com_coin_shokai')
const comcomcoinHomeRouter = require('./routes/comcomcoin_home')
const shoppingRouter = require('./routes/shopping')
const articleRouter = require('./routes/article')
const chatSelectRouter = require('./routes/chat_select')
const chatMsgRouter = require('./routes/chat_msg')
const chatCoinRouter = require('./routes/chat_coin')
const groupChatMsgRouter = require("./routes/group_chat_msg");
const groupChatPushRouter = require("./routes/group_chat_push");
const accessLogRouter = require('./routes/access_log')

const sampleRouter = require('./routes/sample')
const comcomcoinMainteRouter = require('./routes/comcomcoin_mainte')
const comcomcoinToolsRouter = require('./routes/comcomcoin_tools')

const helmet = require('helmet')

const app = express()

// http 413エラー対応
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// httpヘッダ対応
app.use(helmet())

/**
 \* Cross-Origin Resource Sharingを有効にする記述（HTTPレスポンスヘッダの追加）
 \*/
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  )
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Max-Age', '86400')
  next()
})

/**
 \* OPTIONSメソッドの実装
 \*/
app.options('*', function (req, res) {
  res.sendStatus(200)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/server', serverRouter)
app.use('/image', imageRouter)
app.use('/tohyo_toroku', tohyoTorokuRouter)
app.use('/senkyo_kanri', senkyoKanriRouter)
app.use('/senkyo_toroku', senkyoTorokuRouter)
app.use('/comment_shokai', commentShokaiRouter)
app.use('/coin_shokai', coinShokaiRouter)
app.use('/coin_zoyo', coinZoyoRouter)
app.use('/login', loginRouter)
app.use('/tohyo_shokai_kobetsu', tohyoShokaiKobetsuRouter)
app.use('/tohyo_ichiran', tohyoIchiranRouter)
app.use('/tohyo_shokai_shosai', tohyo_shokai_shosaiRouter)
app.use('/shain_toroku', shainTorokuRouter)
app.use('/tohyo_shokai_nendo', tohyo_shokai_nendoRouter)
app.use('/shain_kensaku', shain_kensakuRouter)

app.use('/login_group', loginGroupRouter)
//app.use('/com_coin_shokai_graph', com_coin_shokai_graphRouter)

// ComComCoin
// TODO : ここにComComCoin用のAPIを追加していく
app.use('/com_shohin_mente', com_shohin_menteRouter)
app.use('/com_kokoku_mente', com_kokoku_menteRouter)
app.use('/com_oshirase_mente', com_oshirase_menteRouter)
app.use('/com_coin_shojicoin', com_coin_shojicoinRouter)
app.use('/com_coin_shokai', com_coin_shokaiRouter)
app.use('/comcomcoin_home', comcomcoinHomeRouter)
app.use('/shopping', shoppingRouter)
app.use('/article', articleRouter)
app.use('/chat_select', chatSelectRouter)
app.use('/chat_msg', chatMsgRouter)
app.use('/chat_coin', chatCoinRouter)
app.use("/group_chat_msg", groupChatMsgRouter);
app.use("/group_chat_push", groupChatPushRouter);
app.use('/access_log' , accessLogRouter)

// sample
app.use('/sample', sampleRouter)
app.use('/comcomcoinMainte', comcomcoinMainteRouter)
app.use('/comcomcoinTools', comcomcoinToolsRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
