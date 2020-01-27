/**
 * ブロックチェーンAPI
 */
// 接続情報（環境変数に設定）
const bcUrl = process.env.CCBC_BC_URL;
// スマートコントラクトのアドレス（ベース）
const baseContractAddress = process.env.CCBC_BASE_CONTRACT_ADDRESS;
// スマートコントラクトのアドレス（パラメータにより書き換え可能）
let contractAddress = baseContractAddress;

var express = require("express");
var router = express.Router();
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider(bcUrl));
var request = require("superagent");

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
router.post("/add_account", async function (req, res, err) {
  var methodNm = "## add_account";
  // console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var password = req.body.password;

  try {
    // アカウント作成
    var result = await web3.eth.personal.newAccount(password);
    res.json({ bc_account: result, result: true });
    console.log(methodNm + ":success" + result);
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    err = e;
    res.json({ result: false, message: String(e) });
  }
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
router.post("/login", async function (req, res, err) {
  var methodNm = "## login";
  // console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var account = req.body.account;
  var password = req.body.password;

  try {
    // 認証
    var result = await web3.eth.personal.unlockAccount(account, password, 600);
    res.json({ result: result });
    console.log(methodNm + ":success:");
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    // アカウントなしとパスワード違いのエラーについては、業務エラーとして結果をfalseで返却
    var okEerrors = [
      "Error: invalid address",
      "Error: could not decrypt key with given passphrase"
    ];
    if (okEerrors.indexOf(String(e)) != -1) {
      res.json({ result: false });
    } else {
      err = e;
      res.json({ result: false, message: String(e) });
    }
  }
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
router.post("/send_coin", async function (req, res, err) {
  var methodNm = "## send_coin";
  // console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var fromAccount = req.body.from_account[0];
  var password = req.body.password[0];
  var toAccounts = req.body.to_account;
  var coins = req.body.coin;
  var resTransactions = new Array(toAccounts.length);

  if (req.body.bc_addr != null && req.body.bc_addr != "") {
    contractAddress = req.body.bc_addr;
  } else {
    contractAddress = baseContractAddress;
  }

  try {
    // 認証
    await web3.eth.personal.unlockAccount(fromAccount, password, 600);
    console.log(methodNm + ":success:unlockAccount");

    // // 同時実行時にコイン不足チェックに該当しないために、PendingTransactionをチェックし、
    // // 自分が発行したトランザクションがある場合は待機する
    // var isFindTrans = true;
    // while (isFindTrans) {
    //   isFindTrans = false;

    //   await web3.eth.subscribe('pendingTransactions', function (error, result) {
    //     if (!error) {
    //       console.log(methodNm + ":pendingTransactions:error", error);
    //     }
    //   })
    //     .on("data", async function (transaction) {
    //       console.log(methodNm + ":pendingTransactions:data", transaction);
    //       var trans = await web3.eth.getTransaction(transaction);
    //       if (trans.from === fromAccount) {
    //         isFindTrans = true;
    //       }
    //     })
    // }

    // 送金
    //web3.eth.defaultAccount = fromAccount;
    var contract = new web3.eth.Contract(getAbi(), contractAddress);
    var i = 0;
    while (i < toAccounts.length) {
      // 対象者分繰返し
      var resTransId = "";

      // await contract.methods.transfer(toAccounts[i], coins[i])
      //   .send({
      //     from: fromAccount,
      //     gasPrice: "200000000000",
      //     gas: 100000
      //   })
      //   .on('transactionHash', function (hash) {
      //     resTransId = hash;
      //     console.log(methodNm + ":transfer:transactionHash", hash)
      //   })
      // .on('receipt', function (receipt) {
      //   console.log(methodNm + ":transfer:receipt", receipt)
      // })
      // // .on('confirmation', function (confNumber, receipt) {
      // //   console.log(methodNm + ":transfer:confirmation", confNumber, receipt)
      // // })
      // .on('error', function (error, receipt) {
      //   console.log(methodNm + ":transfer:error", error, receipt)
      //   throw error
      // })
      // .then(async function (receipt) {
      //   console.log(methodNm + ":transfer:fin", receipt)
      //   var status = await web3.eth.getTransactionReceipt(receipt.transactionHash);
      //   console.log(methodNm + ":transfer:fin:getTransactionReceipt:status", status)
      //   if (status === 0) {
      //     throw "An error occurred when storing a transaction in a block."
      //   }
      // });

      if (toAccounts.length === 1) {
        // １件のコイン送金では、同時実行によりコイン不足になる場面があるため、トランザクションがブロックに取り込まれるまで処理を待機する
        await contract.methods.transfer(toAccounts[i], coins[i]).send({ from: fromAccount })
          .on('transactionHash', function (hash) {
            resTransId = hash;
            console.log(methodNm + ":transfer:transactionHash", hash)
          })
          .on('receipt', function (receipt) {
            console.log(methodNm + ":transfer:receipt", receipt)
          })
          .on('error', function (error, receipt) {
            console.log(methodNm + ":transfer:error", error, receipt)
            throw error
          })
          .then(async function (receipt) {
            console.log(methodNm + ":transfer:fin", receipt)
            var result = await web3.eth.getTransactionReceipt(receipt.transactionHash);
            console.log(methodNm + ":transfer:fin:getTransactionReceipt", result)
            if (result !== null) {
              if (result.status === false) {
                throw "An error occurred when storing a transaction in a block."
              }
            }
          });
      } else {
        // 複数件のコイン送金では、同時実行によりコイン不足になる場面がないため、トランザクションが生成された時点で処理を次に進める
        await contract.methods.transfer(toAccounts[i], coins[i]).send({ from: fromAccount })
          .on('transactionHash', function (hash) {
            resTransId = hash;
            console.log(methodNm + ":transfer:transactionHash", hash)
          })
          .on('error', function (error, receipt) {
            console.log(methodNm + ":transfer:error", error, receipt)
            throw error
          });
      }

      // resTransId = contract.methods.transfer(toAccounts[i], coins[i]).send({ from: fromAccount });

      ////etherの場合
      //var resTransId = web3.eth.sendTransaction({from: fromAccount, to: toAccounts[i], value: web3.toWei(coins[i], "ether")})
      resTransactions[i] = resTransId;
      i++;
    }
    res.json({ transaction: resTransactions, result: true });
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    err = e;
    res.json({
      transaction: resTransactions,
      result: false,
      message: String(e)
    });
  }
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
router.post("/get_coin", async function (req, res, err) {
  var methodNm = "## get_coin";
  console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var account = req.body.account;

  if (req.body.bc_addr != null && req.body.bc_addr != "") {
    contractAddress = req.body.bc_addr;
  } else {
    contractAddress = baseContractAddress;
  }

  try {
    // 照会
    var contract = new web3.eth.Contract(getAbi(), contractAddress);
    var resCoin = await contract.methods.balanceOf(account).call();
    res.json({ coin: resCoin, result: true });
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    err = e;
    res.json({ coin: 0, result: false, message: String(e) });
  }
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
router.post("/get_coin_year", async function (req, res, err) {
  var methodNm = "## get_coin_year";
  console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var account = req.body.account;
  var year = req.body.year;
  var amount = 0;

  // 年度開始(パラメータの年の04/01 00:00:00)
  var stDate = new Date(year, 3, 1, 0, 0, 0);
  var stTimestamp = stDate.getTime() / 1000;
  // 年度終了(パラメータの年+1の03/31 23:59:59)
  var edDate = new Date(year + 1, 2, 31, 23, 59, 59);
  var edTimestamp = edDate.getTime() / 1000;

  if (req.body.bc_addr != null && req.body.bc_addr != "") {
    contractAddress = req.body.bc_addr;
  } else {
    contractAddress = baseContractAddress;
  }

  try {
    //------------------------------------------------------------------
    // テスト処理
    /*
    var options = {
      fromBlock: 0,
      toBlock: "latest",
      address: [contractAddress],
      topics: []
    };
    var filter = web3.eth.filter(options);
    
    filter.watch(function(error, result){
      if (!error) {
        console.log(result)
        return
      } else {
        console.log(error)
        res.json({ coin: 0, result: false, message: String(error) })
        return
      }
    })
    return
    */
    //------------------------------------------------------------------

    // 全ブロックを降順で検索
    var maxNo = web3.eth.blockNumber;
    console.log("# maxNo:" + maxNo);

    for (var i = 0; i < maxNo + 1; i++) {
      var block = await web3.eth.getBlock(i);
      console.log(
        "## blockNumber:" + i + " block.timestamp:" + block.timestamp
      );

      // timestampが年度の範囲内であれば
      if (block.timestamp >= stTimestamp && block.timestamp <= edTimestamp) {
        console.log(
          "### block.transactions.length:" + block.transactions.length
        );

        for (var j = 0; j < block.transactions.length; j++) {
          var trans = await web3.eth.getTransaction(block.transactions[j]);

          // コントラクトのアドレス（送金処理）であれば
          if (trans.to == contractAddress) {
            var input = trans.input;
            var fromAccount = trans.from;

            // inputの内容より送金先と送金数を取得
            // inputの構成：10byte=MethodID, 64byte=[0]送金先(内最終40byteを切り出す), 64byte=[1]送金数(16進数)
            var toAccount = "0x" + input.substr(10 + 24, 40);
            var coin = parseInt(input.substr(10 + 64, 64), 16);

            // コインの増減を集計
            if (account == fromAccount) {
              amount -= coin;
            } else if (account == toAccount) {
              amount += coin;
            }
            console.log("### frAccount:" + fromAccount);
            console.log("### toAccount:" + toAccount);
            console.log("### coin:" + coin);
          }
        }
      }
      console.log("## amount:" + amount);
      console.log("##");
    }
    res.json({ coin: amount, result: true });
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    err = e;
    res.json({ coin: 0, result: false, message: String(e) });
  }
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
router.post("/get_transaction", async function (req, res, err) {
  var methodNm = "## get_transaction";
  console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var transaction = req.body.transaction;

  try {
    // 照会
    var trans = await web3.eth.getTransaction(transaction);
    var input = trans.input;
    var fromAccount = trans.from;

    // inputの内容より送金先と送金数を取得
    // inputの構成：10byte=MethodID, 64byte=[0]送金先(内最終40byteを切り出す), 64byte=[1]送金数(16進数)
    var toAccount = "0x" + input.substr(10 + 24, 40);
    var coin = parseInt(input.substr(10 + 64, 64), 16);

    console.log("### input:" + input);
    console.log("### frAccount:" + fromAccount);
    console.log("### toAccount:" + toAccount);
    console.log("### coin:" + coin);

    res.json({
      sender: fromAccount,
      receiver: toAccount,
      coin: coin,
      result: true
    });
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    err = e;
    res.json({
      sender: null,
      receiver: null,
      coin: 0,
      result: false,
      message: String(e)
    });
  }
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
  var methodNm = "## get_transactions";
  console.log(methodNm + ":param:" + JSON.stringify(req.body));

  var transaction = req.body.transaction;
  var resTrans = new Array(transaction.length);

  try {
    // [web3.eth.getTransaction]では複数回の通信が必要であるため性能が出ない
    // [JSON RPC API]を利用し、１回の通信でデータを取得する
    var i = 0;
    var param = new Array(transaction.length);
    while (i < transaction.length) {
      param[i] = {
        jsonrpc: "2.0",
        id: i,
        method: "eth_getTransactionByHash",
        params: [transaction[i]]
      };
      i++;
    }

    // 照会
    var bcRes;
    request
      .post(bcUrl)
      .send(param)
      .end(function (bcerr, bcres) {
        if (bcerr) {
          console.log("** err:" + bcerr);
          return;
        }
        i = 0;
        while (i < bcres.body.length) {
          bcRes = bcres.body[i];
          console.log("### id:" + bcRes.id);
          var index = bcRes.id;
          var trans = bcRes.result;
          var input = trans.input;
          var fromAccount = trans.from;

          // inputの内容より送金先と送金数を取得
          // inputの構成：10byte=MethodID, 64byte=[0]送金先(内最終40byteを切り出す), 64byte=[1]送金数(16進数)
          var toAccount = "0x" + input.substr(10 + 24, 40);
          var coin = parseInt(input.substr(10 + 64, 64), 16);

          console.log("### input:" + input);
          console.log("### frAccount:" + fromAccount);
          console.log("### toAccount:" + toAccount);
          console.log("### coin:" + coin);

          resTrans[index] = {
            sender: fromAccount,
            receiver: toAccount,
            coin: coin
          };
          i++;
        }

        res.json({ trans: resTrans, result: true });
      });
  } catch (e) {
    console.log(methodNm + ":err:" + e);
    err = e;
    res.json({ trans: null, result: false, message: String(e) });
  }
});

/**
 * ABI取得（コントラクトにアクセスするために必要な情報）
 */
function getAbi() {
  var AbiJson = require("../abi.json");
  //console.log(AbiJson.abi)
  return AbiJson.abi;
}

module.exports = router;

/*
var abi = [
  {
  "constant": true,
  "inputs": [{ "name": "", "type": "address" }],
  "name": "balanceOf",
  "outputs": [{ "name": "", "type": "uint256" }],
  "payable": false,
  "type": "function"
  }, {
  "constant": false,
  "inputs": [{ "name": "_to", "type": "address" },
             { "name": "_value", "type": "uint256" }],
  "name": "transfer",
  "outputs": [],
  "payable": false,
  "type": "function"
  }, {
  "inputs": [],
  "payable": false,
  "type": "constructor"
  }]
*/
