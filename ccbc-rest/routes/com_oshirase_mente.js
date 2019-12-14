const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')

const query = (sql, params, res) => {
    db.query(sql, params, (err, datas) => {
        if (err) {
            console.log(`failed...${err}`)
            res.status(400).send(`エラーが発生しました<br />${err}`)
            return
        }
        console.log('success!!')
        console.log(datas)
        res.json({ status: true, data: datas })
    })
}

/**
 * 
 * 検索結果表示
 * 
 */
router.get('/find', (req, res) => {
    console.log('OK')
    console.log(req.params)
    const params = []
    const sql =
        "select title,comment,notice_dt from t_oshirase where delete_flg = '0' order by notice_dt"
    query(sql, params, res)
})

// /**
//  * 
//  * 年度リスト生成
//  * 
//  */
// router.get('/findall', (req, res) => {
//     console.log('OK')
//     console.log(req.params)
//     const params = []
//     const sql =
//         "select t_senkyo_pk, senkyo_nm, tohyo_kaishi_dt, tohyo_shuryo_dt from t_senkyo where delete_flg = '0' order by tohyo_kaishi_dt desc,senkyo_nm"
//     query(sql, params, res)
// })

/**
 * 
 * 検索結果表示
 * 
 */
router.post('/findall', (req, res) => {
    console.log('OK')
    console.log(req.params)
    const params = []
    const sql =
        "select title,comment,notice_dt from t_oshirase where delete_flg = '0' and notice_dt between '" +
        req.body.targetYear +
        "0401' and '" +
        (req.body.targetYear + 1) +
        "0331'" +
        ' order by notice_dt desc'
    query(sql, params, res)
})



// /**
//  * API : find
//  * ○○○を取得
//  */
// router.post('/find', (req, res) => {
//     console.log('API : find - start')
//     find(req, res)
//     console.log('API : find - end')
// })

// /**
//  * API : edit
//  * ○○○を登録および更新
//  */
// router.post('/edit', (req, res) => {
//     console.log('API : edit - start')
//     edit(req, res)
//     console.log('API : edit - end')
// })








// /**
//  * 初期表示データ取得用関数
//  * @param req リクエスト
//  * @param res レスポンス
//  */
// async function find(req, res) {
//     db = db2.sequelizeDB(db, req)
//     var resdatas = await getOshiraseList(req)
//     res.json({
//         status: true,
//         data: resdatas
//     })
// }

// /**
//  * ○○○を登録（新規登録も更新も）
//  * @param req リクエスト
//  * @param res レスポンス
//  */
// async function edit(req, res) {
//     db = db2.sequelizeDB(req)

//     // トークンチェック
//     var sql =
//         'select token' +
//         ' from t_shain tsha' +
//         " where tsha.delete_flg = '0' and tsha.token = :mytoken"
//     db.query(sql, {
//         replacements: { mytoken: req.body.tokenId },
//         type: db.QueryTypes.RAW
//     })
//         .spread(async (datas, metadata) => {
//             console.log(datas)
//             if (datas.length == 0) {
//                 console.log('トークンチェックエラー')
//                 res.json({ status: false, tokencheck: false })
//                 return
//             }
//         })

//     db.transaction(async function (tx) {
//         await insertOrUpdateXxx(db, tx, req)
//     })
//         .then(result => {
//             // コミットしたらこっち
//             console.log('正常')
//             res.json({ status: true })
//         })
//         .catch(e => {
//             // ロールバックしたらこっち
//             console.log('異常')
//             console.log(e)
//             res.json({ status: false })
//         })
// }

// /**
//  * お知らせテーブルよりselect（DBアクセス）
//  * @param db SequelizeされたDBインスタンス
//  * @param req リクエスト
//  */
// function getOshiraseList(db, req) {
//     return new Promise((resolve, reject) => {
//         // SQLとパラメータを指定
//         var sql =
//             "SELECT * FROM t_oshirase WHERE delete_flg = '0' AND notice_dt BETWEEN '20190101' and '20191231'"
//         db.query(sql, {
//             replacements: { oshirasebi: req.body.notice_dt },
//             type: db.QueryTypes.RAW
//         })
//             .spread((datas, metadata) => {
//                 console.log('DBAccess : getXxxList result...')
//                 console.log(datas)
//                 return resolve(datas)
//             })
//     })
// }

// /**
//  * ○○○テーブルのinsert or update（DBアクセス）
//  * @param db SequelizeされたDBインスタンス
//  * @param tx トランザクション
//  * @param req リクエスト
//  */
// function insertOrUpdateXxx(db, tx, req) {
//     return new Promise((resolve, reject) => {
//         // SQLとパラメータを指定
//         var sql = ""
//         if (req.body.t_kiji_pk != null && req.body.t_kiji_pk != "") {
//             sql =
//                 "INSERT INTO t_oshirase VALUES(:renban, :title, :comment, :notice_dt, '0', :insert_user_id, :insert_tm, :update_user_id, :update_tm)"
//         } else {
//             sql =
//                 "UPDATE t_oshirase SET title = ?, comment = ?, notice_dt = ?, update_user_id = ?, update_tm = ? WHERE renban = ''"
//         }
//         db.query(sql, {
//             transaction: tx,
//             replacements: {
//                 t_kiji_pk: req.body.t_kiji_pk,
//                 t_kiji_category_pk: req.body.t_kiji_category_pk,
//                 t_shain_pk: req.body.login_shain_pk,
//                 delete_flg: 0
//             }
//         })
//             .spread((datas, metadata) => {
//                 console.log('DBAccess : insertOrUpdateXxx result...')
//                 console.log(datas)
//                 return resolve(datas)
//             })
//     })
// }

module.exports = router