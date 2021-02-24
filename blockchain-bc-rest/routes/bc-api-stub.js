/**
 * ブロックチェーンAPIスタブ
 */
var request = require("superagent");
var express = require("express");
var router = express.Router();

/**
 * ------------------------------------------------------------
 * ユーザ登録（BCへのアカウント登録）
 * ------------------------------------------------------------
 * Param  : [ password ]   - パスワード
 * Return : [ bc_account ] - アカウント
 *          [ result ]     - 結果(true/false)
 *          [ message ]    - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/add_account", function (req, res, err) {
  console.log("★add_account:param:" + JSON.stringify(req.body));

  // 正常時
  res.json({
    bc_account: "0xtest000000000000000000000000000000000000",
    result: true,
  });
  // エラー時
  //res.json({ result: false, message: "エラーです。" })
});

/**
 * ------------------------------------------------------------
 * ログイン（BCへの認証）
 * ------------------------------------------------------------
 * Param  : [ account ]  - アカウント
 *          [ password ] - パスワード
 * Return : [ result ]   - 結果(true/false)
 *          [ message ]  - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/login", function (req, res, err) {
  console.log("★login:param:" + JSON.stringify(req.body));

  // 正常時(ログイン成功)
  res.json({ result: true });
  // 正常時(通常のログイン失敗)
  //res.json({ result: false })
  // エラー時
  //res.json({ result: false, message: "エラーです。" })
});

/**
 * ------------------------------------------------------------
 * コイン送金
 * ------------------------------------------------------------
 * Param  : [ from_account[] ] - 送金元アカウント(配列)
 *          [ password[] ]     - 送金元パスワード(配列)
 *          [ to_account[] ]   - 送金先アカウント(配列)
 *          [ coin[] ]         - 送金コイン数(配列)
 * Return : [ transaction[] ]  - トランザクションID(配列)
 *          [ result ]         - 結果(true/false)
 *          [ message ]        - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/send_coin", function (req, res, err) {
  console.log("send_coin:param:" + JSON.stringify(req.body));
  var toAccounts = req.body.to_account;
  var resTransactions = new Array(toAccounts.length);
  var i = 0;
  while (i < toAccounts.length) {
    resTransactions[i] =
      "0xtest000000000000000000000000000000000000000000000000000000000000";
    i++;
  }
  // 正常時
  res.json({ transaction: resTransactions, result: true });
  // エラー時
  //res.json({ transaction: new Array(toAccounts.length), result: false, message: "エラーです。" })
});

/**
 * ------------------------------------------------------------
 * コイン照会（現在のコイン）
 * ------------------------------------------------------------
 * Param  : [ account ] - アカウント
 * Return : [ coin ]    - コイン数
 *          [ result ]  - 結果(true/false)
 *          [ message ] - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/get_coin", function (req, res, err) {
  console.log("get_coin:param:" + JSON.stringify(req.body));

  // 正常時
  res.json({ coin: 100, result: true });
  // エラー時
  //res.json({ coin: 0, result: false, message: "エラーです。" })
});

/**
 * ------------------------------------------------------------
 * コイン照会（年度単位のコイン）
 * ------------------------------------------------------------
 * Param  : [ account ] - アカウント
 *          [ year ]    - 年度
 * Return : [ coin ]    - コイン数
 *          [ result ]  - 結果(true/false)
 *          [ message ] - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/get_coin_year", function (req, res, err) {
  console.log("get_coin:param:" + JSON.stringify(req.body));

  // 正常時
  res.json({ coin: 2000, result: true });
  // エラー時
  //res.json({ coin: 0, result: false, message: "エラーです。" })
});

/**
 * ------------------------------------------------------------
 * 取引照会
 * ------------------------------------------------------------
 * Param  : [ transaction ] - トランザクションID
 * Return : [ sender ]      - 送金元アカウント
 *          [ receiver ]    - 送金先アカウント
 *          [ coin ]        - 送金コイン数
 *          [ result ]      - 結果(true/false)
 *          [ message ]     - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/get_transaction", function (req, res, err) {
  console.log("get_transaction:param:" + JSON.stringify(req.body));

  // 正常時
  res.json({
    sender: "0xtest000000000000000000000000000000000000",
    receiver: "0xtest000000000000000000000000000000000001",
    coin: 2000,
    result: true,
  });
  // エラー時
  /*
  res.json({
    sender: "",
    receiver: "",
    coin: 0,
    result: false,
    message: "エラーです。"
  });
  */
});

/**
 * ------------------------------------------------------------
 * 取引照会（複数）
 * ------------------------------------------------------------
 * Param  : [ transaction[] ] - トランザクションID(配列)
 * Return : [ trans[] ]       - トランザクション(配列)
 *            -> [ sender ]      -> 送金元アカウント
 *            -> [ receiver ]    -> 送金先アカウント
 *            -> [ coin ]        -> 送金コイン数
 *          [ result ]      - 結果(true/false)
 *          [ message ]     - エラーメッセージ(エラー時のみ)
 * ------------------------------------------------------------
 */
router.post("/get_transactions", function (req, res, err) {
  console.log("get_transactions:param:" + JSON.stringify(req.body));

  var prmTransaction = req.body.transaction;
  var resTrans = new Array(prmTransaction.length);
  var i = 0;
  while (i < prmTransaction.length) {
    resTrans[i] = {
      sender: "0xtest000000000000000000000000000000000000",
      receiver: "0xtest000000000000000000000000000000000001",
      coin: 1000,
    };
    i++;
  }
  // 正常時
  res.json({ trans: resTrans, result: true });
  // エラー時
  //res.json({ trans: null, result: false, message: "エラーです。" })
});

module.exports = router;
