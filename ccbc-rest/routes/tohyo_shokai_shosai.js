const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;
var mainte = require("./common/maintenance_helper.js");

/**
 * 投票照会（個別詳細）_DB読み込み（初期表示時）
 */
router.post("/find", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  finddata(req, res);
});

/**
 * 初期表示データ取得用関数
 * @req {*} req
 * @res {*} res
 */
async function finddata(req, res) {
  var resdatas = [];
  var bccoin = [];
  resdatas = await tTohyoGet(req);
  var trans = [];
  for (var x in resdatas) {
    trans.push(resdatas[x].transaction_id);
  }
  var param = {
    transaction: trans,
    bc_addr: req.body.bc_addr,
  };
  var result = await bccoinget(param);
  for (var i in result.body.trans) {
    bccoin[i] = result.body.trans[i].coin;
  }
  res.json({ status: true, data: resdatas, tohyo_coin: bccoin });
}

/**
 * 投票情報取得用関数
 * @req {*} req
 */
function tTohyoGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select b.senkyo_nm,c.shimei as presen_shimei,c.image_file_nm as presen_image,a.title as presen_title,f.shimei as tohyo_shimei," +
      "f.image_file_nm as tohyo_image,d.hyoka1 as document_pt,d.hyoka2 as presentation_pt,d.hyoka3 as expression_pt,d.hyoka4 as influence_pt," +
      "d.hyoka5 as breakthrough_pt,d.hyoka_comment as tohyo_comment,d.transaction_id " +
      "from t_presenter a inner join t_senkyo b on a.t_senkyo_pk = b.t_senkyo_pk " +
      "inner join t_shain c on a.t_shain_pk = c.t_shain_pk " +
      "inner join t_tohyo d on a.t_presenter_pk = d.t_presenter_pk " +
      "inner join t_shussekisha e on d.t_shussekisha_pk = e.t_shussekisha_pk " +
      "inner join t_shain f on e.t_shain_pk = f.t_shain_pk " +
      "where a.t_presenter_pk = :mypk1 and a.t_senkyo_pk = :mypk2 and " +
      "a.delete_flg = '0' and b.delete_flg = '0' and c.delete_flg = '0' and " +
      "d.delete_flg = '0' and e.delete_flg = '0' and f.delete_flg = '0'" +
      " order by convert_to(f.shimei_kana,'UTF8')";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        mypk1: req.body.tPresenterPk,
        mypk2: req.body.tSenkyoPk,
      },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * BCコイン取得用関数（投票者毎の投票コイン数）
 * @param {*} param
 */
function bccoinget(param) {
  return new Promise((resolve, reject) => {
    request
      .post(bcdomain + "/bc-api/get_transactions")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("★" + err);
          return;
        }
        return resolve(res);
      });
  });
}

module.exports = router;
