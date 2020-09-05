const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

const query = (sql, params, res, req) => {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  db.query(sql, {
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    res.json({ status: true, data: datas });
  });
};

// /**
//  *
//  * 年度リスト取得
//  *
//  */
// router.get('/find', async (req, res) => {
//   console.log('OK!')
//   console.log('req.params:' + req.params)
//   console.log('req.body.Target_year:' + req.body.Target_year)
//   const params = []
//   const sql =
//     "select m_shohin_pk, shohin_code, shohin_nm1, shohin_nm2, coin, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm from m_shohin where delete_flg = '0' order by insert_tm desc"
//   query(sql, params, res, req)
// })

/**
 *
 * 検索結果表示（検索条件反映要）
 *
 */
router.post("/find", (req, res) => {
  console.log("OK!!");
  console.log("req.params:" + req.params);
  console.log("req.body.targetCode:" + req.body.targetCode);
  const params = [];
  var sql =
    "select msho.m_shohin_pk, msho.shohin_code, msho.shohin_nm1, msho.shohin_nm2, msho.coin, msho.shohin_bunrui, msho.seller_shain_pk, tsha.shimei, " +
    "case when msho.shohin_bunrui=1 THEN '菓子' when msho.shohin_bunrui=2 THEN '飲料' when msho.shohin_bunrui=3 THEN '食品' when msho.shohin_bunrui=9 THEN 'その他' end as shohin_bunrui_mei " +
    "from m_shohin msho" +
    " left join t_shain tsha on msho.seller_shain_pk = tsha.t_shain_pk " +
    " where msho.delete_flg = '0'";
  if (req.body.targetCode !== 0) {
    sql += " and msho.shohin_bunrui = '" + req.body.targetCode + "'";
  }
  sql += " order by msho.shohin_code asc";
  query(sql, params, res, req);
});

/**
 *
 * 新規登録
 *
 */
router.post("/create", (req, res) => {
  console.log("◆create◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    await mshohinInsert(tx, resdatas, req);
    res.json({ status: true, data: resdatas });
  })
    .then((result) => {
      // コミットしたらこっち
      console.log("正常");
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 *
 * 更新登録
 *
 */
router.post("/edit", (req, res) => {
  console.log("◆edit◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    await mshohinUpdate(tx, resdatas, req);
    res.json({ status: true, data: resdatas });
  })
    .then((result) => {
      // コミットしたらこっち
      console.log("正常");
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 *
 * 更新登録（削除フラグ = 1）
 *
 */
router.post("/delete", (req, res) => {
  console.log("◆delete◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    await mshohinDelete(tx, resdatas, req);
    res.json({ status: true, data: resdatas });
  })
    .then((result) => {
      // コミットしたらこっち
      console.log("正常");
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 * m_shohinテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function mshohinInsert(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into m_shohin (shohin_code, shohin_nm1, shohin_nm2, coin, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm,seller_shain_pk,shohin_bunrui) " +
      "VALUES (?, ?, ?, ?, ?, ?, current_timestamp, ?, ?, ?, ?) ";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.shohin_code,
        req.body.shohin_nm1,
        req.body.shohin_nm2,
        req.body.coin,
        "0",
        req.body.userid,
        null,
        null,
        req.body.seller_shain_pk,
        req.body.shohin_bunrui,
      ],
    }).spread((datas, metadata) => {
      console.log("◆◆◆");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

/**
 * m_shohinテーブルのupdate用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function mshohinUpdate(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "update m_shohin set shohin_code = ?, shohin_nm1 = ?, shohin_nm2 = ?, coin = ?, shohin_bunrui = ?, seller_shain_pk = ?, " +
      "update_user_id = ?, update_tm = current_timestamp WHERE m_shohin_pk = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.shohin_code,
        req.body.shohin_nm1,
        req.body.shohin_nm2,
        req.body.coin,
        req.body.shohin_bunrui,
        req.body.seller_shain_pk,
        req.body.userid,
        req.body.m_shohin_pk,
      ],
    }).spread((datas, metadata) => {
      console.log("◆◆◆◆");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

/**
 * m_shohinテーブルのdelete用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function mshohinDelete(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql = "update m_shohin set delete_flg = '1' WHERE m_shohin_pk = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [req.body.m_shohin_pk],
    }).spread((datas, metadata) => {
      console.log("◆◆◆◆◆");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

module.exports = router;
