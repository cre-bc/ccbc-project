const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')

// const query = (sql, params, res) => {
//     db.query(sql, params, (err, datas) => {
//         if (err) {
//             console.log(`failed...${err}`)
//             res.status(400).send(`エラーが発生しました<br />${err}`)
//             return
//         }
//         console.log('success!!')
//         console.log(datas)
//         res.json({ status: true, data: datas })
//     })
// }

const query = (sql, params, res, req) => {
    if (req.body.db_name != null && req.body.db_name != '') {
        db = db2.sequelize3(req.body.db_name)
    } else {
        db = require('./common/sequelize_helper.js').sequelize
    }

    db
        .query(sql, {
            type: db.QueryTypes.RAW
        })
        .spread(async (datas, metadata) => {
            res.json({ status: true, data: datas })
        })
}

/**
 * 
 * 年度リスト取得
 * 
 */
router.get('/find', async (req, res) => {
    console.log('OK!')
    console.log('req.params:' + req.params)
    console.log('req.body.Target_year:' + req.body.Target_year)
    const params = []
    const sql =
        "select renban, title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm from t_oshirase where delete_flg = '0' order by notice_dt desc"
    query(sql, params, res, req)
})

/**
 * 
 * 検索結果表示
 * 
 */
router.post('/find', (req, res) => {
    console.log('OK!!')
    console.log(req.params)
    console.log('req.body.targetYear:' + req.body.targetYear)
    const params = []
    const sql =
        "select title, comment, notice_dt from t_oshirase where delete_flg = '0' and notice_dt between '" +
        req.body.targetYear +
        "0401' and '" +
        (req.body.targetYear + 1) +
        "0331'" +
        ' order by notice_dt desc'
    query(sql, params, res, req)
})

/**
 * 
 * 新規登録
 * 
 */
router.post('/create', (req, res) => {

    // console.log('req.params:' + req.params)
    // const sql =
    //     // "insert into t_oshirase (title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) VALUES ('タイトル', 'こめんと', '2020/02/21', '0', 'asdfgh', current_timestamp, null, null) "
    //     "insert into t_oshirase (title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) VALUES (?, ?, ?, ?, ?, current_timestamp, ?, ?) "
    // // query(sql, params, res, req)
    // if (req.body.db_name != null && req.body.db_name != '') {
    //     db = db2.sequelize3(req.body.db_name)
    // } else {
    //     db = require('./common/sequelize_helper.js').sequelize
    // }
    // db
    //     .query(sql, {
    //         // type: db.QueryTypes.RAW
    //         // transaction: tx,
    //         replacements: [
    //             req.body.title,
    //             req.body.comment,
    //             req.body.notice_dt,
    //             '0',
    //             // req.body.userid,
    //             null,
    //             null,
    //             null
    //         ]
    //     })
    //     .spread(async (datas, metadata) => {
    //         res.json({ status: true, data: datas })
    //     })

    console.log('◆◆◆')
    var resultList = req.body.resultList
    // var selected = req.body.selected
    if (req.body.db_name != null && req.body.db_name != '') {
        db = db2.sequelize3(req.body.db_name)
    } else {
        db = require('./common/sequelize_helper.js').sequelize
    }

    // // トークンチェック
    // var sql =
    //     'select token' +
    //     ' from t_shain tsha' +
    //     " where tsha.delete_flg = '0' and tsha.token = :mytoken"
    // db
    //     .query(sql, {
    //         replacements: { mytoken: req.body.tokenId },
    //         type: db.QueryTypes.RAW
    //     })
    //     .spread(async (datas, metadata) => {
    //         console.log(datas)
    //         if (datas.length == 0) {
    //             console.log('★★★★★トークンチェックエラー')
    //             res.json({ status: false })
    //             return
    //         }
    //     })

    db
        .transaction(async function (tx) {
            var resdatas = []
            console.log(req)
            await tOshiraseInsert(tx, req)
            res.json({ status: true, data: resdatas })
        })
        .then(result => {
            // コミットしたらこっち
            console.log('正常')
        })
        .catch(e => {
            // ロールバックしたらこっち
            console.log('異常')
            console.log(e)
        })
})

/**
 * 
 * 更新登録
 * 
 */
router.post('/edit', (req, res) => {

    console.log('OK!')
    console.log('req.params:' + req.params)
    const params = []
    const sql =
        "UPDATE t_oshirase SET title = 'タイトル修正2', comment = 'コメント修正3', notice_dt = '2020/06/30', update_user_id = 'qwert', update_tm = current_timestamp WHERE renban = '3'"
    query(sql, params, res, req)
})

/**
 * 
 * 更新登録（削除フラグ = 1）
 * 
 */
router.post('/delete', (req, res) => {

    console.log('OK!')
    console.log('req.params:' + req.params)
    const params = []
    const sql =
        "UPDATE t_oshirase SET delete_flg = '1' WHERE renban = '4'"
    query(sql, params, res, req)
})

/**
 * t_oshiraseテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function tOshiraseInsert(tx, req) {
    return new Promise((resolve, reject) => {
        var sql =
            'insert into t_oshirase (title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) ' +
            'VALUES (?, ?, ?, ?, ?, current_timestamp, ?, ?) '

        db
            .query(sql, {
                transaction: tx,
                replacements: [
                    req.body.title,
                    req.body.comment,
                    req.body.notice_dt,
                    '0',
                    // req.body.userid,
                    null,
                    null,
                    null
                ]
            })
            .spread((datas, metadata) => {
                console.log('◆6')
                console.log(datas)
                // resdatas.push(datas)
                return resolve(datas)
                // return
            })
    })
}

module.exports = router