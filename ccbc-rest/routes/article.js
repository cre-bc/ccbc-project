const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;
const jimuAccount = require("./common/constans.js").jimuAccount;
const jimuPassword = require("./common/constans.js").jimuPassword;
const jimuShainPk = require("./common/constans.js").jimuShainPk;
var mainte = require("./common/maintenance_helper.js");

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // forever起動時にuploadが正常に動作しないため、暫定対応
    cb(null, "/home/BLOCKCHAIN/ccbc-rest/public/uploads/article");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

const READ_COUNT = 10;
// const GET_COIN = 10

/**
 * API : findCategory
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得
 */
router.post("/findCategory", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  findCategoryList(req, res);
});

/**
 * API : findCategoryApp
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得（アプリ用）
 */
router.post("/findCategoryApp", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  findCategoryListApp(req, res);
});

/**
 * API : findArticle
 * 記事リスト（条件により絞り込み可能）を取得
 */
router.post("/findArticle", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  findArticleList(req, res);
});

/**
 * API : findResponse
 * 記事リスト（条件により絞り込み可能）を取得
 */
router.post("/findResponse", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  findResponseList(req, res);
});

/**
 * API : edit
 * 記事情報を登録（新規登録も編集も）
 */
router.post("/edit", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  edit(req, res);
});

/**
 * API : sendReply
 * 記事情報を登録（新規登録も編集も）
 */
router.post("/sendReply", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  sendReply(req, res);
});

/**
 * API : upload
 * 記事情報のファイルをアップロード
 */
router.post("/upload", upload.fields([{ name: "image" }]), (req, res) => {
  res.json({
    status: true,
  });
});

/**
 * API : good
 * 記事情報をいいね登録（登録も解除も）
 */
router.post("/good", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  good(req, res);
});

/**
 * API : favorite
 * 記事情報をお気に入り登録（登録も解除も）
 */
router.post("/favorite", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  favorite(req, res);
});

// ----------------------------------------------------------------------
/**
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findCategoryList(req, res) {
  db = db2.sequelizeDB(req);

  // 記事カテゴリの取得
  const resdatas = await selectKijiCategory(db, req);
  res.json({
    status: true,
    data: resdatas,
  });
}

// ----------------------------------------------------------------------
/**
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得（アプリ用）
 * @param req リクエスト
 * @param res レスポンス
 */
async function findCategoryListApp(req, res) {
  db = db2.sequelizeDB(req);

  // 記事カテゴリの取得
  const resdatas = await selectKijiCategoryApp(db, req);
  res.json({
    status: true,
    data: resdatas,
  });
}

/**
 * 記事リスト（条件により絞り込み可能）を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findArticleList(req, res) {
  db = db2.sequelizeDB(req);

  // 記事リストの取得
  const resdatas = await selectKijiWithCond(db, req);
  res.json({
    status: true,
    data: resdatas,
  });

  // 記事既読の更新
  if (resdatas.length > 0) {
    const kijiPk = resdatas[0].t_kiji_pk;
    const kijiCategoryPk = resdatas[0].t_kiji_category_pk;
    db.transaction(async function (tx) {
      // DB更新
      await insertOrUpdateKijiKidoku(db, tx, req, kijiPk, kijiCategoryPk);
    })
      .then((result) => {
      })
      .catch((e) => {
        // ロールバックしたらこっち
        console.log("findArticleList : 異常", e);
        res.json({ status: false });
      });
  }
}

/**
 * 返信リストを取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findResponseList(req, res) {
  db = db2.sequelizeDB(req);

  // 返信リストの取得
  const resdatas = await selectResponse(db, req);
  res.json({
    status: true,
    data: resdatas,
  });
  // レスポンスが1件以上存在する場合
  if (resdatas.length > 0) {
    // 自身のレスポンス既読を取得
    const responseKidoku = await selectResponseKidoku(db, req);
    var countResponseKidoku = responseKidoku[0].count;
    // 最大レスポンスPKを取得
    const responsePk = await selectMaxResponsePk(db, req);
    var maxResponsePk = responsePk[0].max;
    // レスポンス既読が存在する場合
    if (countResponseKidoku != 0) {
      db.transaction(async function (tx) {
        // DB更新
        await insertOrUpdateResponseKidoku(db, tx, req, false, maxResponsePk);
      })
        .then((result) => {
        })
        .catch((e) => {
          // ロールバックしたらこっち
          console.log("insertOrUpdateResponseKidoku : 異常", e);
          res.json({ status: false });
        });
    } else {
      // 自身が投稿した記事かどうか、件数を取得（1件であれば自身が投稿した記事と判定）
      const countKijiResult = await selectCountKiji(db, req);
      var countKiji = countKijiResult[0].count;
      // 自身が投稿した記事の場合
      if (countKiji != 0) {
        db.transaction(async function (tx) {
          // DB更新
          await insertOrUpdateResponseKidoku(db, tx, req, true, maxResponsePk);
        })
          .then((result) => {
          })
          .catch((e) => {
            // ロールバックしたらこっち
            console.log("findArticleList : 異常", e);
            res.json({ status: false });
          });
      }
    }
  }
}

/**
 * レスポンス情報を登録
 * @param req リクエスト
 * @param res レスポンス
 */
async function sendReply(req, res) {
  db = db2.sequelizeDB(req);

  db.transaction(async function (tx) {
    var ret = await insertOrUpdateResponse(db, tx, req);
    var resMode = req.body.resMode;
    if (resMode === "insert") {
      t_response_pk = ret[0].t_response_pk;
      // 自身のレスポンス既読を取得
      const responseKidoku = await selectResponseKidoku(db, req);
      var countResponseKidoku = responseKidoku[0].count;
      // レスポンス既読が存在する場合
      if (countResponseKidoku != 0) {
        db.transaction(async function (tx) {
          // DB更新
          await insertOrUpdateResponseKidoku(db, tx, req, false, t_response_pk);
        })
          .then((result) => {
          })
          .catch((e) => {
            // ロールバックしたらこっち
            console.log("insertOrUpdateResponseKidoku : 異常", e);
            res.json({ status: false });
          });
      } else {
        db.transaction(async function (tx) {
          // DB更新
          await insertOrUpdateResponseKidoku(db, tx, req, true, t_response_pk);
        })
          .then((result) => {
          })
          .catch((e) => {
            // ロールバックしたらこっち
            console.log("insertOrUpdateResponseKidoku : 異常", e);
            res.json({ status: false });
          });
      }
    }
  })
    .then((result) => {
      res.json({ status: true });
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("edit : 異常", e);
      res.json({ status: false });
    });
}

/**
 * 記事情報を登録（新規登録も編集も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function edit(req, res) {
  db = db2.sequelizeDB(req);

  db.transaction(async function (tx) {
    // 記事テーブルの更新
    let isInsert = true;
    if (req.body.t_kiji_pk !== null && req.body.t_kiji_pk !== "") {
      isInsert = false;
    }
    var ret = await insertOrUpdateKiji(db, tx, req, isInsert);
    var kijiPk = req.body.t_kiji_pk;
    if (isInsert) {
      kijiPk = ret[0].t_kiji_pk;
    }

    // 記事ハッシュタグテーブルの更新（delete and insert）
    if (!isInsert) {
      await deleteKijiHashtag(db, tx, req);
    }
    if (req.body.hashtag_str !== "") {
      var hashtag = req.body.hashtag_str
        .replace("　", " ")
        .replace("　", " ")
        .split(" ");
      var seq = 0;
      for (var i in hashtag) {
        if (hashtag[i] !== "") {
          var kijiHashtag = {
            t_kiji_pk: req.body.t_kiji_pk,
            seq_no: seq++,
            t_kiji_category_pk: req.body.t_kiji_category_pk,
            hashtag: hashtag[i],
          };
          await insertKijiHashtag(db, tx, req, kijiPk, kijiHashtag);
        }
      }
    }

    // 贈与テーブルの追加と、記事テーブルに贈与PKを更新
    if (isInsert) {
      // BCへの書き込み
      const transactionId = await bcrequest(req);

      // 贈与テーブルの追加
      var ret = await insertZoyo(db, tx, req, transactionId);
      const zoyoPk = ret[0].t_zoyo_pk;

      // 記事テーブルの更新
      await updateKijiAfterZoyo(db, tx, req, kijiPk, zoyoPk);
      // つぶやき記事のPush送信
      if (req.body.t_kiji_category_pk == '9') {
          await pushSend(req, res, kijiPk)
      }
    }
  })
    .then((result) => {
      res.json({ status: true });
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("edit : 異常", e);
      res.json({ status: false });
    });
}

/**
 * 投稿されたつぶやき記事を検索し、Push通知を行う
 * @param req リクエスト
 * @param res レスポンス
 * @param kijiPk 記事PK（投稿した記事）
 */
async function pushSend(req, res, kijiPk) {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  // プッシュ通知先（未読記事あり）の取得
  const sql =
    "select sha.expo_push_token from t_shain sha where sha.expo_push_token is not null and sha.delete_flg = '0' and sha.t_shain_pk <> :shain_pk" +
    " and exists (select * from t_kiji kij" +
    " left join t_kiji_kidoku kid on kij.t_kiji_category_pk = kid.t_kiji_category_pk and kid.t_shain_pk = sha.t_shain_pk" +
    " where kij.delete_flg = '0' and kij.t_kiji_pk = :kiji_pk" +
    " and kij.t_kiji_pk > coalesce(kid.t_kiji_pk, 0))";

  db.query(sql, {
    replacements: { 
      shain_pk: req.body.loginShainPk,
      kiji_pk: kijiPk
    },
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    for (var i in datas) {
      const pushData = {
        to: datas[i].expo_push_token,
        title: "ComComCoinからのお知らせです",
        body: "新しいつぶやきが投稿されましたよ！",
        sound: "default",
        badge: 1,
      };
      request
        .post("https://exp.host/--/api/v2/push/send")
        .send(pushData)
        .end((err, res) => {
          if (err) {
            console.log("article_push:", "Push send error:", err);
          } else {
            console.log("article_push:", "Push send data:", pushData);
          }
        });
    }
  });
}

/**
 * 記事情報をいいね登録（登録も解除も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function good(req, res) {
  db = db2.sequelizeDB(req);

  db.transaction(async function (tx) {
    await insertOrUpdateGood(db, tx, req);
  })
    .then((result) => {
      res.json({ status: true });
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("good : 異常", e);
      res.json({ status: false });
    });
}

/**
 * 記事情報をお気に入り登録（登録も解除も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function favorite(req, res) {
  db = db2.sequelizeDB(req);

  db.transaction(async function (tx) {
    await insertOrUpdateFavorite(db, tx, req);
  })
    .then((result) => {
      res.json({ status: true });
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("favorite : 異常", e);
      res.json({ status: false });
    });
}

// ----------------------------------------------------------------------
/**
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectKijiCategory(db, req) {
  return new Promise((resolve, reject) => {
    // 記事カテゴリテーブルの情報と、記事の未読件数（記事既読テーブルに登録されているIDより新しいIDの件数）を一緒に取得
    var sql =
      "select cat.t_kiji_category_pk, cat.category_nm, cat.get_coin, cat.sort_num, cat.spe_category_flg, cat.category_file_path, count(kij.t_kiji_pk) AS midoku_cnt" +
      " from t_kiji_category cat" +
      " left join t_kiji_kidoku kid" +
      " on cat.t_kiji_category_pk = kid.t_kiji_category_pk" +
      " and kid.t_shain_pk = :shain_pk" +
      " left join t_kiji kij " +
      " on cat.t_kiji_category_pk = kij.t_kiji_category_pk" +
      " and kij.delete_flg = '0'" +
      " and kij.t_kiji_pk > coalesce(kid.t_kiji_pk, -1)" +
      " where cat.delete_flg = '0'" +
      " group by cat.t_kiji_category_pk, cat.category_nm, cat.get_coin, cat.sort_num, cat.spe_category_flg" +
      " order by cat.sort_num, cat.t_kiji_category_pk";
    db.query(sql, {
      replacements: { shain_pk: req.body.loginShainPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

// ----------------------------------------------------------------------
/**
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得（DBアクセス）（アプリ用）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectKijiCategoryApp(db, req) {
  return new Promise((resolve, reject) => {
    // 記事カテゴリテーブルの情報と、記事の未読件数（記事既読テーブルに登録されているIDより新しいIDの件数）を一緒に取得
    var sql =
      "select cat.t_kiji_category_pk, cat.category_nm, cat.get_coin, cat.sort_num, cat.spe_category_flg, cat.category_file_path, count(kij.t_kiji_pk) AS midoku_cnt" +
      " from t_kiji_category cat" +
      " left join t_kiji_kidoku kid" +
      " on cat.t_kiji_category_pk = kid.t_kiji_category_pk" +
      " and kid.t_shain_pk = :shain_pk" +
      " left join t_kiji kij " +
      " on cat.t_kiji_category_pk = kij.t_kiji_category_pk" +
      " and kij.delete_flg = '0'" +
      " and kij.t_kiji_pk > coalesce(kid.t_kiji_pk, -1)" +
      " where cat.delete_flg = '0'" +
      " and cat.t_kiji_category_pk <> 9" +
      " group by cat.t_kiji_category_pk, cat.category_nm, cat.get_coin, cat.sort_num, cat.spe_category_flg" +
      " order by cat.sort_num, cat.t_kiji_category_pk";
    db.query(sql, {
      replacements: { shain_pk: req.body.loginShainPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事リスト（条件により絞り込み可能）を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectKijiWithCond(db, req) {
  return new Promise((resolve, reject) => {
    // 条件
    var sqlcond_kiji_category_pk = "";
    var sqlcond_kiji_pk = "";
    var sqlcond_dt_from = "";
    var sqlcond_dt_to = "";
    var sqlcond_hashtag = "";
    var sqlcond_keyword = "";
    var param_hashtag = {};
    var param_keyword = {};
    if (
      req.body.current_kiji_category_pk !== null &&
      req.body.current_kiji_category_pk !== ""
    ) {
      // 記事カテゴリ選択時
      sqlcond_kiji_category_pk =
        " and kij.t_kiji_category_pk = :t_kiji_category_pk";
    }
    if (
      req.body.searchCondKijiPk !== null &&
      req.body.searchCondKijiPk !== ""
    ) {
      // ホーム画面から遷移時の記事直接指定
      sqlcond_kiji_pk = " and kij.t_kiji_pk = :t_kiji_pk";
    } else if (
      req.body.readLastKijiPk !== null &&
      req.body.readLastKijiPk !== ""
    ) {
      // 最下部へスクロールした際の過去分読み込み
      sqlcond_kiji_pk = " and kij.t_kiji_pk < :t_kiji_pk_read_last";
    }
    if (req.body.searchCondYear !== null && req.body.searchCondYear !== "") {
      // 検索機能：投稿年指定
      sqlcond_dt_from = " and kij.post_dt >= :dt_from";
      sqlcond_dt_to = " and kij.post_dt <= :dt_to";
    }
    if (
      req.body.searchCondHashtag !== null &&
      req.body.searchCondHashtag !== ""
    ) {
      // 検索機能：タグ
      // スペース区切りでの複数キーワードをAND条件で指定
      var params = req.body.searchCondHashtag.replace("　", " ").split(" ");
      for (var i = 0; i < params.length; i++) {
        sqlcond_hashtag =
          " and exists (select * from t_kiji_hashtag has where kij.t_kiji_pk = has.t_kiji_pk and lower(has.hashtag) like :hashtag" +
          i +
          ")";
        param_hashtag["hashtag" + i] = "%" + params[i].toLowerCase() + "%";
      }
    }
    if (
      req.body.searchCondKeyword !== null &&
      req.body.searchCondKeyword !== ""
    ) {
      // 検索機能：キーワード
      // スペース区切りでの複数キーワードをAND条件で指定
      var params = req.body.searchCondKeyword.replace("　", " ").split(" ");
      for (var i = 0; i < params.length; i++) {
        sqlcond_keyword +=
          " and (lower(kij.title) like :keyword" +
          i +
          " or lower(kij.contents) like :keyword" +
          i +
          ")";
        param_keyword["keyword" + i] = "%" + params[i].toLowerCase() + "%";
      }
    }

    // 記事情報テーブルより条件を絞り込んで取得
    var sql =
      "select kij.t_kiji_pk, kij.t_kiji_category_pk, kij.t_shain_pk, kij.title, kij.contents, kij.post_dt, kij.post_tm, kij.file_path, kij.file_path2, kij.file_path3," +
      " sha.shimei as shain_nm, sha.image_file_nm as shain_image_path," +
      " case when goo.t_kiji_pk is null then '0' else '1' end as good_flg," +
      " case when fav.t_kiji_pk is null then '0' else '1' end as favorite_flg," +
      " array_to_string(array(select '#' || hashtag from t_kiji_hashtag has where kij.t_kiji_pk = has.t_kiji_pk order by has.seq_no), '　') as hashtag_str," +
      " cat.category_nm," +
      " coalesce(res.cnt, 0) as res_cnt" +
      " from t_kiji kij" +
      " inner join t_kiji_category cat on kij.t_kiji_category_pk = cat.t_kiji_category_pk" +
      " left join t_shain sha on kij.t_shain_pk = sha.t_shain_pk" +
      " left join t_good goo on kij.t_kiji_pk = goo.t_kiji_pk and goo.t_shain_pk = :t_shain_pk" +
      " left join t_favorite fav on kij.t_kiji_pk = fav.t_kiji_pk and fav.t_shain_pk = :t_shain_pk" +
      " left join (select t_kiji_pk, count(*) as cnt from t_response group by t_kiji_pk) res on kij.t_kiji_pk = res.t_kiji_pk" +
      " where kij.delete_flg = '0'" +
      sqlcond_kiji_category_pk +
      sqlcond_kiji_pk +
      sqlcond_dt_from +
      sqlcond_dt_to +
      sqlcond_hashtag +
      sqlcond_keyword +
      " order by kij.t_kiji_pk desc";
    if (req.body.expo_push_token != null && req.body.expo_push_token != "") {
      sql += " limit " + READ_COUNT;
    }

    db.query(sql, {
      replacements: Object.assign(
        {
          t_kiji_category_pk: req.body.current_kiji_category_pk,
          t_shain_pk: req.body.loginShainPk,
          t_kiji_pk: req.body.searchCondKijiPk,
          t_kiji_pk_read_last: req.body.readLastKijiPk,
          dt_from: req.body.searchCondYear + "/01/01",
          dt_to: req.body.searchCondYear + "/12/31",
        },
        param_hashtag,
        param_keyword
      ),
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事情報（t_kiji）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param isInsert 追加の場合はtrue
 */
function insertOrUpdateKiji(db, tx, req, isInsert) {
  return new Promise((resolve, reject) => {
    var sql = "";
    if (isInsert) {
      sql =
        "insert into t_kiji (t_kiji_category_pk, t_shain_pk, title, contents, post_dt, post_tm, file_path, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, file_path2, file_path3) " +
        " values (:t_kiji_category_pk, :t_shain_pk, :title, :contents, current_timestamp, current_timestamp, :file_path, '0', :user_id, current_timestamp, :user_id, current_timestamp, :file_path2, :file_path3) " +
        " returning t_kiji_pk";
    } else {
      sql =
        "update t_kiji set " +
        " title = :title, contents = :contents, file_path = :file_path," +
        " update_user_id = :user_id, update_tm = current_timestamp," +
        " file_path2 = :file_path2, file_path3 = :file_path3" +
        " where t_kiji_pk = :t_kiji_pk";
    }

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_kiji_category_pk: req.body.t_kiji_category_pk,
        t_shain_pk: req.body.loginShainPk,
        title: req.body.title,
        contents: req.body.contents,
        hashtag: req.body.hashtag,
        file_path: req.body.file_path,
        file_path2: req.body.file_path2,
        file_path3: req.body.file_path3,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * レスポンス情報（t_response）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateResponse(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql = "";
    if (req.body.resMode === "insert") {
      sql =
        "insert into t_response (t_kiji_pk, from_shain_pk, to_shain_pk, post_dt, post_tm, response, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_kiji_pk, :t_shain_pk, :to_shain_pk, current_timestamp, current_timestamp, :resComment, '0', :user_id, current_timestamp, :user_id, current_timestamp) " +
        " returning t_response_pk";
    } else if (req.body.resMode === "edit") {
      sql =
        "update t_response set " +
        " response = :resComment, update_user_id = :user_id, update_tm = current_timestamp" +
        " where t_response_pk = :t_response_pk" +
        " returning t_response_pk";
    } else if (req.body.resMode === "delete") {
      sql = "delete from t_response" + " where t_response_pk = :t_response_pk";
    }

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.searchCondKijiPk,
        t_shain_pk: req.body.loginShainPk,
        to_shain_pk: req.body.resTarget,
        resComment: req.body.resComment,
        user_id: req.body.userid,
        t_response_pk: req.body.resResponsPk,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * レスポンス既読情報（t_response_kidoku）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param isInsert 追加の場合はtrue
 * @param maxResponsePk 最大レスポンスPK
 */
function insertOrUpdateResponseKidoku(db, tx, req, isInsert, maxResponsePk) {
  return new Promise((resolve, reject) => {
    var sql = "";
    if (isInsert) {
      sql =
        "insert into t_response_kidoku (t_shain_pk, t_kiji_pk, t_response_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_shain_pk, :t_kiji_pk, :t_response_pk, :user_id, current_timestamp, :user_id, current_timestamp) ";
    } else {
      sql =
        "update t_response_kidoku set " +
        " t_response_pk = :t_response_pk, update_user_id = :user_id, update_tm = current_timestamp" +
        " where t_shain_pk = :t_shain_pk and t_kiji_pk = :t_kiji_pk";
    }

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_shain_pk: req.body.loginShainPk,
        t_kiji_pk: req.body.searchCondKijiPk,
        t_response_pk: maxResponsePk,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事情報（t_kiji）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param isInsert 追加の場合はtrue
 */
function insertOrUpdateKiji(db, tx, req, isInsert) {
  return new Promise((resolve, reject) => {
    var sql = "";
    if (isInsert) {
      sql =
        "insert into t_kiji (t_kiji_category_pk, t_shain_pk, title, contents, post_dt, post_tm, file_path, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, file_path2, file_path3) " +
        " values (:t_kiji_category_pk, :t_shain_pk, :title, :contents, current_timestamp, current_timestamp, :file_path, '0', :user_id, current_timestamp, :user_id, current_timestamp, :file_path2, :file_path3) " +
        " returning t_kiji_pk";
    } else {
      sql =
        "update t_kiji set " +
        " title = :title, contents = :contents, file_path = :file_path," +
        " update_user_id = :user_id, update_tm = current_timestamp," +
        " file_path2 = :file_path2, file_path3 = :file_path3" +
        " where t_kiji_pk = :t_kiji_pk";
    }

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_kiji_category_pk: req.body.t_kiji_category_pk,
        t_shain_pk: req.body.loginShainPk,
        title: req.body.title,
        contents: req.body.contents,
        hashtag: req.body.hashtag,
        file_path: req.body.file_path,
        file_path2: req.body.file_path2,
        file_path3: req.body.file_path3,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 返信リストを取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectResponse(db, req) {
  return new Promise((resolve, reject) => {
    // レスポンス情報テーブルより条件を絞り込んで取得
    var sql =
      "select r.t_response_pk, r.t_kiji_pk, r.from_shain_pk, r.post_dt, r.post_tm, r.response, s.shimei, s.image_file_nm from t_response r" +
      " inner join t_shain s on r.from_shain_pk = s.t_shain_pk" +
      " where r.t_kiji_pk = :t_kiji_pk and r.delete_flg = '0'" +
      " order by r.t_response_pk";

    db.query(sql, {
      replacements: { t_kiji_pk: req.body.searchCondKijiPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事カウント用関数（自身の投稿した記事かどうかを判定）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectCountKiji(db, req) {
  return new Promise((resolve, reject) => {
    console.log("★ start selectCountKiji");
    var sql =
      "select count(*) from t_kiji k" +
      " where k.t_kiji_pk = :t_kiji_pk" +
      " and k.t_shain_pk = :t_shain_pk";

    db.query(sql, {
      replacements: {
        t_kiji_pk: req.body.searchCondKijiPk,
        t_shain_pk: req.body.loginShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 最大レスポンスPK取得用関数
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectMaxResponsePk(db, req) {
  return new Promise((resolve, reject) => {
    console.log("★ start selectMaxResponsePk");
    var sql =
      "select max(r.t_response_pk) from t_response r" +
      " where r.t_kiji_pk = :t_kiji_pk" +
      " and r.delete_flg = '0'";

    db.query(sql, {
      replacements: { t_kiji_pk: req.body.searchCondKijiPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * レスポンス既読取得用関数
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectResponseKidoku(db, req) {
  return new Promise((resolve, reject) => {
    console.log("★ start selectResponseKidoku");
    var sql =
      "select count(*) from t_response_kidoku rk" +
      " where rk.t_kiji_pk = :t_kiji_pk" +
      " and rk.t_shain_pk = :t_shain_pk";

    db.query(sql, {
      replacements: {
        t_kiji_pk: req.body.searchCondKijiPk,
        t_shain_pk: req.body.loginShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事情報（t_kiji）テーブルへの贈与PK更新
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param t_kiji_pk 記事テーブルPK
 * @param t_zoyo_pk 贈与テーブルPK
 */
function updateKijiAfterZoyo(db, tx, req, t_kiji_pk, t_zoyo_pk) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_kiji set " +
      " t_coin_ido_pk = :t_zoyo_pk" +
      " where t_kiji_pk = :t_kiji_pk";

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: t_kiji_pk,
        t_zoyo_pk: t_zoyo_pk,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 贈与情報（t_zoyo）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param transactionId BC登録時のトランザクションID
 */
function insertZoyo(db, tx, req, transactionId) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, transaction_id, zoyo_comment, nenji_flg, delete_flg, insert_user_id, insert_tm) " +
      " values (:zoyo_moto_shain_pk, :zoyo_saki_shain_pk, :transaction_id, :zoyo_comment, :nenji_flg, '0', :insert_user_id, current_timestamp) " +
      " returning t_zoyo_pk";

    db.query(sql, {
      transaction: tx,
      replacements: {
        zoyo_moto_shain_pk: jimuShainPk,
        zoyo_saki_shain_pk: req.body.loginShainPk,
        transaction_id: transactionId,
        zoyo_comment: "記事投稿",
        nenji_flg: "2",
        insert_user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事ハッシュタグ（t_kiji_hashtag）テーブルのdelete
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function deleteKijiHashtag(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql = "delete from t_kiji_hashtag where t_kiji_pk = :t_kiji_pk";

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事ハッシュタグ（t_kiji_hashtag）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param kijiPk 記事テーブルPK
 * @param tKijiHashtag 記事ハッシュタグテーブル情報
 */
function insertKijiHashtag(db, tx, req, kijiPk, tKijiHashtag) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_kiji_hashtag (t_kiji_pk, seq_no, t_kiji_category_pk, hashtag, insert_user_id, insert_tm, update_user_id, update_tm) " +
      " values (:t_kiji_pk, :seq_no, :t_kiji_category_pk, :hashtag, :user_id, current_timestamp, :user_id, current_timestamp) ";

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: kijiPk,
        seq_no: tKijiHashtag.seq_no,
        t_kiji_category_pk: tKijiHashtag.t_kiji_category_pk,
        hashtag: tKijiHashtag.hashtag,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * いいね（t_good）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateGood(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql = "";
    if (req.body.good_flg === "1") {
      sql =
        "insert into t_good (t_kiji_pk, t_shain_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_kiji_pk, :t_shain_pk, :user_id, current_timestamp, :user_id, current_timestamp) " +
        " on conflict do nothing";
    } else {
      sql =
        "delete from t_good " +
        " where t_kiji_pk = :t_kiji_pk and t_shain_pk = :t_shain_pk";
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_shain_pk: req.body.loginShainPk,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * お気に入り（t_favorite）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateFavorite(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql = "";
    if (req.body.favorite_flg === "1") {
      sql =
        "insert into t_favorite (t_kiji_pk, t_shain_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_kiji_pk, :t_shain_pk, :user_id, current_timestamp, :user_id, current_timestamp) " +
        " on conflict do nothing";
    } else {
      sql =
        "delete from t_favorite " +
        " where t_kiji_pk = :t_kiji_pk and t_shain_pk = :t_shain_pk";
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_shain_pk: req.body.loginShainPk,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 記事既読（t_kiji_kidoku）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param kijiPk 記事テーブルPK
 * @param kijiCategoryPk 記事カテゴリーテーブルPK
 */
function insertOrUpdateKijiKidoku(db, tx, req, kijiPk, kijiCategoryPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_kiji_kidoku (t_shain_pk, t_kiji_category_pk, t_kiji_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
      " values (:t_shain_pk, :t_kiji_category_pk, :t_kiji_pk, :user_id, current_timestamp, :user_id, current_timestamp) " +
      " on conflict (t_shain_pk, t_kiji_category_pk) do " +
      "update set t_kiji_pk = :t_kiji_pk, update_user_id = :user_id, update_tm = current_timestamp" +
      " where t_kiji_kidoku.t_kiji_pk < :t_kiji_pk";

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_shain_pk: req.body.loginShainPk,
        t_kiji_category_pk: kijiCategoryPk,
        t_kiji_pk: kijiPk,
        user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * BCコイン送金用関数
 * @param req リクエスト
 */
function bcrequest(req) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [jimuAccount],
      to_account: [req.body.bcAccount],
      password: [jimuPassword],
      coin: [req.body.getCoin],
      bc_addr: req.body.bc_addr,
    };
    console.log("bcrequest.param:", param);
    request
      .post(bcdomain + "/bc-api/send_coin")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("bcrequest.err:", err);
          return;
        }
        // // 検索結果表示
        // console.log("bcrequest.result.transaction:", res.body.transaction);
        return resolve(res.body.transaction[0]);
      });
  });
}

module.exports = router;
