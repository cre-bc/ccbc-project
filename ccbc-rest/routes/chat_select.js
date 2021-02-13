const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

router.post("/find", (req, res) => {
  console.log(req.params);
  findData(req, res);
});

/**
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  console.log("★findData★");

  var resultData = [];

  // チャットユーザーを取得
  resultData = await chatUserGet(req);
  // console.log(resultData);
  res.json({ status: true, data: resultData });
}

/**
 * チャットユーザー取得用関数
 *
 * @param {*} req
 */
async function chatUserGet(req) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatUserGet★");
    var sql =
      //   "select s.t_shain_pk, s.shimei, s.image_file_nm, s.expo_push_token, COALESCE(c.new_info_cnt, 0) new_info_cnt,c2.from_shain_pk, c2.max_post_dttm, c3.to_shain_pk, c3.max_post_dttm from t_shain s left join (select from_shain_pk, count(from_shain_pk) new_info_cnt from t_chat tc where delete_flg = '0' and to_shain_pk = :myPk and t_chat_pk > (select t_chat_pk from t_chat_kidoku k where k.from_shain_pk = tc.from_shain_pk and k.t_shain_pk = :myPk) group by from_shain_pk ) c on s.t_shain_pk = c.from_shain_pk left join (select max(post_dt + post_tm) max_post_dttm, from_shain_pk from t_chat where delete_flg = '0' and to_shain_pk = :myPk group by from_shain_pk ) c2 on s.t_shain_pk = c2.from_shain_pk left join (select max(post_dt + post_tm) max_post_dttm, to_shain_pk from t_chat where delete_flg = '0' and from_shain_pk = :myPk group by to_shain_pk) c3 on s.t_shain_pk = c3.to_shain_pk where s.t_shain_pk <> :myPk and s.delete_flg = '0' order by case when c2.max_post_dttm is null then c3.max_post_dttm when c3.max_post_dttm is null then c2.max_post_dttm when c2.max_post_dttm > c3.max_post_dttm then c2.max_post_dttm else c3.max_post_dttm end desc nulls last, convert_to(s.shimei_kana,'UTF8')";
      "select s.t_shain_pk ,s.shimei ,s.image_file_nm ,s.expo_push_token ,COALESCE(c.new_info_cnt, 0) new_info_cnt ,c2.from_shain_pk ,c3.to_shain_pk ,case when c2.max_post_dttm is null then c3.max_post_dttm when c3.max_post_dttm is null then c2.max_post_dttm when c2.max_post_dttm > c3.max_post_dttm then c2.max_post_dttm else c3.max_post_dttm end As max_post_dttm   ,null as t_chat_group_pk ,null as chat_group_nm ,null as group_image_file_nm" +
      " from t_shain s" +
      " left join (select from_shain_pk ,count(from_shain_pk) new_info_cnt from t_chat tc where delete_flg = '0' and t_chat_group_pk = 0 and to_shain_pk = :myPk and t_chat_pk > (select t_chat_pk from t_chat_kidoku k where k.from_shain_pk = tc.from_shain_pk and k.t_shain_pk = :myPk and k.from_chat_group_pk = 0) group by from_shain_pk) c on s.t_shain_pk = c.from_shain_pk" +
      " left join (select max(post_dt + post_tm) max_post_dttm ,from_shain_pk from t_chat where delete_flg = '0' and t_chat_group_pk = 0 and to_shain_pk = :myPk group by from_shain_pk) c2 on s.t_shain_pk = c2.from_shain_pk" +
      " left join (select max(post_dt + post_tm) max_post_dttm ,to_shain_pk from t_chat where delete_flg = '0' and t_chat_group_pk = 0 and from_shain_pk = :myPk group by to_shain_pk) c3 on s.t_shain_pk = c3.to_shain_pk" +
      " where s.t_shain_pk <> :myPk and s.delete_flg = '0'" +
      " UNION ALL" +
      " select 0 as t_shian_pk ,null ,null ,null ,COALESCE(c.new_info_cnt, 0) new_info_cnt ,0 ,0 ,max_post_dttm ,cg.t_chat_group_pk ,cg.chat_group_nm ,cg.group_image_file_nm" +
      " from t_chat_group cg" +
      " inner join t_chat_group_member cgm on cg.t_chat_group_pk = cgm.t_chat_group_pk and cgm.t_shain_pk = :myPk" +
      " left join (select t_chat_group_pk ,count(t_chat_pk) new_info_cnt from t_chat tc where delete_flg = '0' and to_shain_pk = 0 and t_chat_pk > (select t_chat_pk from t_chat_kidoku k where k.from_chat_group_pk = tc.t_chat_group_pk and k.t_shain_pk = :myPk) group by t_chat_group_pk) c on cg.t_chat_group_pk = c.t_chat_group_pk" +
      " left join (select max(post_dt + post_tm) max_post_dttm ,t_chat_group_pk from t_chat where delete_flg = '0' and t_chat_group_pk is not null group by t_chat_group_pk) c2 on cg.t_chat_group_pk = c2.t_chat_group_pk" +
      " where cg.delete_flg = '0'" +
      " order by max_post_dttm desc nulls last, shimei nulls last, chat_group_nm";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: { myPk: req.body.loginShainPk },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatUserGet★");
      return resolve(datas);
    });
  });
}

module.exports = router;
