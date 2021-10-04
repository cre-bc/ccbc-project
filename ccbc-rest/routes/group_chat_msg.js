const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

/**
 * チャット_初期表示
 */
router.post("/find", (req, res) => {
  findData(req, res);
});

/**
 * チャット_既読更新
 */
router.post("/kidoku_update", (req, res) => {
  updateKidoku(req, res);
});

/**
 * チャット_DB登録
 */
router.post("/create", (req, res) => {
  var userid = req.body.userid;
  var chatGroupPk = req.body.chatGroupPk;
  var myPk = req.body.loginShainPk;

  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    // チャットテーブルinsert
    var t_chat_pk = await insertChat(tx, req);
    // チャット既読テーブル更新
    await updateChatKidoku(req, t_chat_pk, myPk, chatGroupPk, myPk, userid);
    res.json({ status: true });
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
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  console.log("★findData★");
  console.log(req.body.chatGroupPk);
  var resultData = [];
  var resultMemberData = [];
  var chatPk = [];
  var fromShainPkResult = [];
  var resultKidokuData = [];
  var resultKidokuData2 = [];
  var userid = req.body.userid;
  var fromShainPk = 0;
  var chatGroupPk = req.body.chatGroupPk;
  var myPk = req.body.loginShainPk;

  // チャットを取得
  resultData = await chatMsgGet(req, chatGroupPk);
  //グループ所属メンバー情報を取得
  resultMemberData = await groupMemberGet(req, chatGroupPk, myPk);
  // 最大チャットPKを取得
  chatPk = await chatPkGet(req, chatGroupPk);
  var maxChatPk = chatPk[0].max;

  //チャットが存在する場合
  if (maxChatPk != null) {
    fromShainPkResult = await fromShainPkGet(req, maxChatPk);
    fromShainPk = fromShainPkResult[0].from_shain_pk;
    // チャット既読テーブル更新
    await updateChatKidoku(
      req,
      maxChatPk,
      fromShainPk,
      chatGroupPk,
      myPk,
      userid
    );
  } else {
    // 既読チャットPKを取得(本人)
    resultKidokuData = await chatKidokuGet(req, myPk, chatGroupPk);
    // 既読チャットPKを取得(本人以外)
    resultKidokuData2 = await chatKidokuMemberGet(req, myPk, chatGroupPk);

    if (resultKidokuData.length === 0) {
      console.log("チャット既読insert（本人）");
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, myPk, chatGroupPk);
    }
    if (resultKidokuData2.length === 0) {
      console.log("チャット既読insert（本人以外）");
      // チャット既読テーブルinsert（本人）
      await insertChatKidokuMember(req, userid, myPk, chatGroupPk);
    }
  }

  // console.log(resultData);

  res.json({
    status: true,
    data: resultData,
    kidokuData: resultKidokuData,
    memberData: resultMemberData,
  });
}

/**
 * 既読更新用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function updateKidoku(req, res) {
  console.log("★updateKidoku★");

  var chatPk = [];
  var resultKidokuData = [];
  var resultKidokuData2 = [];
  var fromShainPkResult = [];
  var userid = req.body.userid;
  var fromShainPk = 0;
  var chatGroupPk = req.body.chatGroupPk;
  var myPk = req.body.loginShainPk;

  // 最大チャットPKを取得
  chatPk = await chatPkGet(req, chatGroupPk);

  var maxChatPk = chatPk[0].max;

  //チャットが存在する場合
  if (maxChatPk != null) {
    fromShainPkResult = await fromShainPkGet(req, maxChatPk);
    fromShainPk = fromShainPkResult[0].from_shain_pk;
    // チャット既読テーブル更新
    await updateChatKidoku(
      req,
      maxChatPk,
      fromShainPk,
      chatGroupPk,
      myPk,
      userid
    );
  } else {
    // 既読チャットPKを取得(本人)
    resultKidokuData = await chatKidokuGet(req, myPk, chatGroupPk);
    // 既読チャットPKを取得(本人以外)
    resultKidokuData2 = await chatKidokuMemberGet(req, myPk, chatGroupPk);

    if (resultKidokuData.length === 0) {
      console.log("チャット既読insert（本人）");
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, myPk, chatGroupPk);
    }
    if (resultKidokuData2.length === 0) {
      console.log("チャット既読insert（本人以外）");
      // チャット既読テーブルinsert（本人以外）
      await insertChatKidokuMember(req, userid, myPk, chatGroupPk);
    }
  }

  res.json({ status: true });
}

/**
 * チャット取得用関数
 *
 * @param {*} req
 * @param {*} chatGroupPk
 */
async function chatMsgGet(req, chatGroupPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatMsgGet★");
    var sql =
      "select c.t_chat_pk, c.from_shain_pk, c.to_shain_pk, pgp_sym_decrypt(c.comment, 'comcomcoin_chat') as comment, c.post_dt, c.post_tm, c.post_dt + c.post_tm as post_dttm, s.image_file_nm, s.user_id, s.shimei" +
      " from t_chat c" +
      " inner join t_shain s on c.from_shain_pk = s.t_shain_pk" +
      " where t_chat_group_pk = :groupPk" +
      " order by post_dt + post_tm desc";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        groupPk: chatGroupPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatMsgGet");
      return resolve(datas);
    });
  });
}

/**
 * チャットグループ所属メンバー取得用関数
 *
 * @param {*} req
 * @param {*} chatGroupPk
 * @param {*} myPk
 */
async function groupMemberGet(req, chatGroupPk, myPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start groupMemberGet");
    var sql =
      "select s.t_shain_pk,s.shimei, s.image_file_nm, s.expo_push_token from t_chat_group g " +
      "inner join t_chat_group_member cg on g.t_chat_group_pk = cg.t_chat_group_pk " +
      "inner join t_shain s on cg.t_shain_pk = s.t_shain_pk " +
      "where g.t_chat_group_pk = :groupPk " +
      "and cg.t_shain_pk <> :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        groupPk: chatGroupPk,
        myPk: myPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatMsgGet");
      return resolve(datas);
    });
  });
}

/**
 * チャット既読取得用関数
 *
 * @param {*} req
 */
async function chatKidokuGet(req, myPk, chatGroupPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatKidokuGet");
    var sql =
      "select k.t_chat_pk as kidoku_pk from t_chat_kidoku k" +
      " where k.t_shain_pk = :myPk" +
      " and k.from_chat_group_pk = :groupPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: myPk,
        groupPk: chatGroupPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatKidokuGet");
      return resolve(datas);
    });
  });
}

/**
 * チャット既読（所属メンバー分）取得用関数
 *
 * @param {*} req
 */
async function chatKidokuMemberGet(req, myPk, chatGroupPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatKidokuMemberGet");
    var sql =
      "select k.t_chat_pk as kidoku_pk from t_chat_kidoku k" +
      " where k.t_shain_pk <> :myPk" +
      " and k.from_chat_group_pk = :groupPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: myPk,
        groupPk: chatGroupPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatKidokuMemberGet");
      return resolve(datas);
    });
  });
}

/**
 * チャットPK取得用関数
 *
 * @param {*} req
 */
async function chatPkGet(req, chatGroupPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatPkGet");
    var sql =
      "select max(c.t_chat_pk)" +
      " from t_chat c " +
      " where t_chat_group_pk = :groupPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        groupPk: chatGroupPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatPkGet");
      return resolve(datas);
    });
  });
}

/**
 * FROM社員PK取得用関数
 *
 * @param {*} req
 */
async function fromShainPkGet(req, maxChatPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start fromShainPkGet");
    var sql = "select from_shain_pk from t_chat c where t_chat_pk = :chatPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        chatPk: maxChatPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End chatPkGet");
      return resolve(datas);
    });
  });
}

/**
 * チャット既読テーブル更新用関数
 *
 * @param {*} req
 */
async function updateChatKidoku(
  req,
  maxChatPk,
  fromShainPk,
  chatGroupPk,
  myPk,
  userid
) {
  return new Promise((resolve, reject) => {
    console.log("★ start updateChatKidoku★");
    console.log(myPk);
    var sql =
      "update t_chat_kidoku set t_chat_pk = :chatPk, from_shain_pk = :fromPk, update_user_id = :userId, update_tm = current_timestamp" +
      " where t_shain_pk = :myShainPK" +
      " and from_chat_group_pk = :groupPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        chatPk: maxChatPk,
        fromPk: fromShainPk,
        myShainPK: myPk,
        userId: userid,
        groupPk: chatGroupPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      console.log("★End updateChatKidoku★");
      return resolve(datas);
    });
  });
}

/**
 * チャット既読テーブルinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChatKidoku(req, userid, myPk, chatGroupPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_chat_kidoku (t_shain_pk, from_shain_pk, t_chat_pk, insert_user_id, insert_tm, update_user_id, update_tm, from_chat_group_pk) " +
      "VALUES (?, ?, ?, ?, current_timestamp, ?, ?, ?) ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      replacements: [myPk, 0, 0, userid, null, null, chatGroupPk],
    }).spread((datas, metadata) => {
      // console.log(datas);
      return resolve(datas);
    });
  });
}

/**
 * チャット既読テーブル（所属メンバー分）insert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChatKidokuMember(req, userid, myPk, chatGroupPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_chat_kidoku (t_shain_pk, from_shain_pk, t_chat_pk, insert_user_id, insert_tm, update_user_id, update_tm, from_chat_group_pk) " +
      "select gm.t_shain_pk ,? ,? ,? ,current_timestamp,? ,? ,g.t_chat_group_pk from t_chat_group g " +
      "inner join t_chat_group_member gm on g.t_chat_group_pk = gm.t_chat_group_pk " +
      "where  g.t_chat_group_pk = ? " +
      "and gm.t_shain_pk <> ?";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      replacements: [0, 0, userid, null, null, chatGroupPk, myPk],
    }).spread((datas, metadata) => {
      // console.log(datas);
      return resolve(datas);
    });
  });
}

/**
 * t_chatテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChat(tx, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, shonin_cd, t_chat_group_pk) " +
      "VALUES (?, ?, pgp_sym_encrypt(?, 'comcomcoin_chat'), current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?, ?, ?) RETURNING t_chat_pk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.loginShainPk,
        0,
        req.body.message,
        0,
        0,
        req.body.userid,
        null,
        null,
        null,
        req.body.chatGroupPk,
      ],
    }).spread((datas, metadata) => {
      // console.log(datas);
      return resolve(datas[0].t_chat_pk);
    });
  });
}
module.exports = router;
