const db = require("./sequelize_helper.js").sequelize2;
const async = require("async");

/**
 * poatgreSQLに接続してSQLを実行する
 * @param sql 実行したいSQL
 * @param values SQLに指定するパラメータ
 * @param callback SQL実行後、処理するイベント
 * @returns "0"：正常、"1"：メンテナンス中、"2"：バージョンアップが必要
 */
exports.checkAppStatus = async function (req) {
  // Webからのアクセスの場合（group_idが設定されていない）、正常ステータスを返す
  if (!("group_id" in req.body)) {
    return null;
  }

  // バージョンアップ対応前の場合、正常ステータスを返す
  if (req.body.app_type == undefined) {
    return null;
  }

  // console.log("req.body", req.body);

  // グループテーブルよりメンテナンスフラグおよび各種バージョン情報を取得
  var datas = await selectGroup(req)

  // バージョン情報のチェック
  var chkVer;
  if (req.body.app_type == "ccc") {
    if (req.body.os_type == "ios") {
      chkVer = datas[0].ver_ccc_apple;
    } else {
      chkVer = datas[0].ver_ccc_google;
    }
  } else {
    if (req.body.os_type == "ios") {
      chkVer = datas[0].ver_hvt_apple;
    } else {
      chkVer = datas[0].ver_hvt_google;
    }
  }
  if (req.body.app_ver != chkVer) {
    console.log("バージョン情報相違", req.body.app_type, req.body.os_type, req.body.app_ver, chkVer);
    return { status: true, status_cd: "2" };
  }

  // メンテナンス中のチェック
  if (datas[0].mainte_flg == "1") {
    console.log("メンテナンス中");
    return { status: true, status_cd: "1" };
  }

  return null;
};

/**
  * メンテナンスフラグおよび各種バージョン情報を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
async function selectGroup(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select mainte_flg, ver_ccc_google, ver_ccc_apple, ver_hvt_google, ver_hvt_apple from t_group where delete_flg = '0' and group_id = :myid";

    db.query(sql, {
      replacements: {
        myid: req.body.group_id,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas)
    });
  });
}