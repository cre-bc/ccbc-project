import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import { Card, Divider } from "react-native-elements";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";
import AlertDialog from "./components/AlertDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import RNPickerSelect from "react-native-picker-select";
import Spinner from "react-native-loading-spinner-overlay";
import * as Speech from "expo-speech";

const restdomain = require("./common/constans.js").restdomain;

export default class Shopping extends BaseComponent {
  constructor(props) {
    super(props);
    this.inputRefs = {};
    this.state = {
      mode: "camera",
      hasCameraPermission: null,
      bokinList: [],
      buyList: [],
      haveCoin: 0,
      totalCoin: 0,
      itemCnt: 0,
      m_bokin_pk: 0,
      alertDialogVisible: false,
      alertDialogMessage: "",
      finDialogVisible: false,
      confirmDialogVisible: false,
      confirmDialogMessage: "",
      isScaning: false,
      isProcessing: false,
      screenNo: 13,
      displayCoin: 0,
      displayTotalCoin: 0,
      displayItemCount: 0,
    };
    this.props = props;
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.setState({ isProcessing: true });
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    // カメラの使用許可
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === "granted",
    });

    //アクセス情報登録
    this.setAccessLog();

    // 初期表示情報取得
    this.findShopping();

    this.setState({ isProcessing: false });
  };

  /** アクセス情報登録 */
  setAccessLog = async () => {
    await fetch(restdomain + "/access_log/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .catch((error) => console.error(error));
  };

  /** 画面初期表示情報取得 */
  findShopping = async () => {
    await fetch(restdomain + "/shopping/find", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.bokinList === "undefined") {
            return;
          }
          var dataList = json.bokinList;
          var coin = json.coin;

          // 寄付先リスト設定
          var bokinList = [];
          for (var i in dataList) {
            bokinList.push({
              label: dataList[i].bokin_nm,
              value: dataList[i].m_bokin_pk,
              key: dataList[i].m_bokin_pk,
            });
          }
          // コイン数を3桁カンマ区切り
          var s = String(coin).split(".");
          var retCoin = String(s[0]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          if (s.length > 1) {
            retCoin += "." + s[1];
          }
          this.setState({
            bokinList: bokinList,
            haveCoin: coin,
            displayCoin: retCoin,
          });
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** QRコードのスキャン処理 */
  handleBarCodeScanned = async ({ type, data }) => {
    console.log("barcode type:" + type + " \ndata: " + data);

    this.setState({ isScaning: true });
    this.state.isScaning = true;
    this.state.qrcode = data;

    await fetch(restdomain + "/shopping/checkQRCode", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          this.setState({ isScaning: false });
          this.state.isScaning = false;

          // 結果が取得できない場合は終了
          if (typeof json.status === "undefined") {
            return;
          } else if (json.status === false) {
            alert("有効なQRコードではありません");
            this.cancelCamera();
            return;
          }

          // 商品コインを3桁の桁区切りで表記する
          var shohinCoin = String(json.shohinInfo.coin).split(".");
          var retShohinCoin = String(shohinCoin[0]).replace(
            /(\d)(?=(\d\d\d)+(?!\d))/g,
            "$1,"
          );
          if (shohinCoin.length > 1) {
            retShohinCoin += "." + shohinCoin[1];
          }
          // 購入リストに商品マスタのデータを追加
          var shohinInfo = {
            m_shohin_pk: json.shohinInfo.m_shohin_pk,
            shohin_code: json.shohinInfo.shohin_code,
            shohin_nm1: json.shohinInfo.shohin_nm1,
            shohin_nm2: json.shohinInfo.shohin_nm2,
            coin: json.shohinInfo.coin,
            displayShohinCoin: retShohinCoin,
            quantity: 1,
          };
          var buyList = this.state.buyList;
          buyList.push(shohinInfo);

          var itemCnt = this.state.itemCnt + 1;

          // 個数を3桁の桁区切りで表記する
          var count = String(itemCnt).split(".");
          var retCount = String(count[0]).replace(
            /(\d)(?=(\d\d\d)+(?!\d))/g,
            "$1,"
          );
          if (count.length > 1) {
            retCount += "." + count[1];
          }

          // 合計コイン数を算出
          var totalCoin = this.calcTotalCoin(buyList);
          // コインを3桁の桁区切りで表記する
          var s = String(totalCoin).split(".");
          var retTotalCoin = String(s[0]).replace(
            /(\d)(?=(\d\d\d)+(?!\d))/g,
            "$1,"
          );
          if (s.length > 1) {
            retTotalCoin += "." + s[1];
          }

          // ショッピングカートに戻る
          this.setState({
            buyList: buyList,
            totalCoin: totalCoin,
            itemCnt: itemCnt,
            mode: "cart",
            displayTotalCoin: retTotalCoin,
            displayItemCount: retCount,
          });
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** 合計コイン数を算出 */
  calcTotalCoin(buyList) {
    var totalCoin = 0;
    for (var i = 0; i < buyList.length; i++) {
      totalCoin += buyList[i].coin;
    }
    return totalCoin;
  }

  cancelCamera() {
    // ショッピングカートに戻る
    this.setState({
      mode: "cart",
    });
  }

  moveCamera() {
    // スキャナを表示
    this.setState({
      mode: "camera",
    });
  }

  /** 支払ボタン押下 */
  onClickPay = async () => {
    // 各種入力チェック
    if (
      // 所持コイン不足チェック
      this.state.haveCoin < this.state.totalCoin
    ) {
      alertMessage = "コインが不足しています";
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage,
      });
    } else if (
      // 寄付先未入力チェック
      typeof this.state.m_bokin_pk === "undefined" ||
      this.state.m_bokin_pk === null ||
      this.state.m_bokin_pk === 0 ||
      (this.state.m_bokin_pk != null && this.state.m_bokin_pk.length === 0)
    ) {
      alertMessage = "寄付先が未入力です";
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage,
      });
    } else {
      // 確認ダイアログを表示（YESの場合、pay()を実行）
      this.setState({
        confirmDialogVisible: true,
        confirmDialogMessage: "支払いを確定します。よろしいですか？",
      });
    }
  };

  /** 支払更新処理 */
  pay = async () => {
    this.setState({ isProcessing: true });
    this.setState({ confirmDialogVisible: false });

    await fetch(restdomain + "/shopping/pay", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          if (typeof json.status === "undefined" || json.status === false) {
            var alertMessage = "";
            if (typeof json.coin === "undefined") {
              alertMessage = "支払処理でエラーが発生しました";
            } else {
              this.setState({ haveCoin: json.coin });
              alertMessage = "コインが不足しています";
            }
            this.setState({
              alertDialogVisible: true,
              alertDialogMessage: alertMessage,
            });
          } else {
            // 支払い完了ダイアログを表示し、閉じるとホーム画面に戻る
            this.setState({
              isProcessing: false,
              finDialogVisible: true,
            });
            Speech.speak("com com coin", {
              language: "en",
            });
          }
        }.bind(this)
      )
      .catch((error) => alert(error));
  };

  /** 購入リストより１件削除 */
  deleteShohin(i) {
    var buyList = this.state.buyList;
    buyList.splice(i, 1);
    var totalCoin = this.calcTotalCoin(buyList);
    // コインを3桁の桁区切りで表記する
    var s = String(totalCoin).split(".");
    var retTotalCoin = String(s[0]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    if (s.length > 1) {
      retTotalCoin += "." + s[1];
    }

    // 個数を3桁の桁区切りで表記する
    var count = String(this.state.itemCnt - 1).split(".");
    var retCount = String(count[0]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    if (count.length > 1) {
      retCount += "." + count[1];
    }

    this.setState({
      buyList: buyList,
      itemCnt: this.state.itemCnt - 1,
      totalCoin: totalCoin,
      displayTotalCoin: retTotalCoin,
      displayItemCount: retCount,
    });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginTop: 100,
          }}
        >
          <Text style={{ fontSize: 22, color: "gray" }}>
            カメラにアクセスを許可しますか？
          </Text>
        </View>
      );
    }

    if (hasCameraPermission === false) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginTop: 100,
          }}
        >
          <Text style={{ fontSize: 22, color: "gray" }}>
            カメラにアクセスできません
          </Text>
        </View>
      );
    }

    if (this.state.mode == "camera") {
      // --- スキャナモード ---
      return (
        <BarCodeScanner
          onBarCodeScanned={
            this.state.isScaning ? undefined : this.handleBarCodeScanned
          }
          style={[StyleSheet.absoluteFill, styles.container]}
        >
          <View style={styles.layerTop}>
            {/* TODO : テスト用にQRコードを読み込んだ状態を再現 */}
            {/* <Text
              onPress={() =>
                this.handleBarCodeScanned({ type: "QR", data: "CCC_0001" })
              }
              style={styles.cancel}
            >
              テスト
            </Text> */}
            <Text style={styles.description}>
              ＱＲコードを読み込んでください
            </Text>
          </View>
          <View style={styles.layerCenter}>
            <View style={styles.layerLeft} />
            <View style={styles.focused} />
            <View style={styles.layerRight} />
          </View>
          <View style={styles.layerBottom}>
            <Text onPress={() => this.cancelCamera()} style={styles.cancel}>
              キャンセル
            </Text>
          </View>
        </BarCodeScanner>
      );
    } else if (this.state.mode == "cart" || this.state.mode == "input") {
      // --- ショッピングカートモード ---
      return (
        <View style={{ flex: 1, backgroundColor: "ivory" }}>
          {/* -- 処理中アニメーション -- */}
          <Spinner
            visible={this.state.isProcessing}
            textContent={"Processing…"}
            textStyle={styles.spinnerTextStyle}
          />
          {/* -- 共有ヘッダ -- */}
          <InAppHeader navigate={this.props.navigation.navigate} />

          {/* -- 所持コイン、購入合計コイン・個数 -- */}
          <View style={{ flex: 1.2, marginTop: 20 }}>
            <View style={{ marginLeft: 20 }}>
              <View>
                <View>
                  <View>
                    <Text style={{ fontSize: 22, color: "gray" }}>
                      所持コイン
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ textAlign: "right", fontSize: 24 }}>
                        {this.state.displayCoin}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ textAlign: "left", fontSize: 24 }}>
                        {" コイン"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 24 }}>{"　"}</Text>
                    </View>
                  </View>
                </View>
                <View>
                  <View>
                    <Text style={{ fontSize: 22, color: "gray" }}>合計</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ textAlign: "right", fontSize: 24 }}>
                        {this.state.displayTotalCoin}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ textAlign: "left", fontSize: 24 }}>
                        {" コイン"}
                      </Text>
                    </View>
                    <View style={{ flex: 0.5 }}>
                      <Text style={{ textAlign: "right", fontSize: 24 }}>
                        {this.state.displayItemCount}
                      </Text>
                    </View>
                    <View style={{ flex: 0.5 }}>
                      <Text style={{ textAlign: "left", fontSize: 24 }}>
                        {" 個"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* -- カート内容 -- */}
          <View style={{ flex: 2.8, marginTop: 20 }}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginLeft: 20 }}>
                <View>
                  <Text style={{ fontSize: 22, color: "gray" }}>
                    カートの内容
                  </Text>
                </View>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                <Card containerStyle={{ padding: 0 }}>
                  {this.state.buyList.map((slist, i) => {
                    return (
                      <View key={i}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                          <View style={{ flex: 6 }}>
                            <Text style={{ fontSize: 26 }}>
                              {slist.shohin_nm1}
                            </Text>
                            <Text style={{ fontSize: 26 }}>
                              {slist.shohin_nm2}
                            </Text>
                            <Text style={{ fontSize: 22 }}>
                              {slist.displayShohinCoin} コイン
                            </Text>
                          </View>

                          <TouchableHighlight
                            onPress={() => this.deleteShohin(i)}
                          >
                            <View
                              style={{
                                flex: 1,
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Image
                                source={require("./../images/icons8-waste-48.png")}
                              />
                            </View>
                          </TouchableHighlight>
                        </View>
                        <Divider style={{ backgroundColor: "lightgray" }} />
                      </View>
                    );
                  })}
                </Card>
              </View>
            </ScrollView>
          </View>

          {/* -- 寄付先 -- */}
          <View style={{ marginLeft: 20, marginTop: 5 }}>
            <View>
              <Text style={{ fontSize: 22, color: "gray" }}>寄付先</Text>
            </View>
          </View>
          <View>
            <RNPickerSelect
              placeholder={{
                label: "【寄付先を選択してください】",
                value: null,
              }}
              items={this.state.bokinList}
              onValueChange={(value) => {
                this.setState({
                  m_bokin_pk: value,
                });
              }}
              //onUpArrow={() => {
              //  this.inputRefs.name.focus()
              //}}
              //onDownArrow={() => {
              //  this.inputRefs.picker2.togglePicker()
              //}}
              style={{ ...pickerSelectStyles }}
              value={this.state.m_bokin_pk}
              ref={(el) => {
                this.inputRefs.picker = el;
              }}
            />
          </View>

          {/* -- ボタン -- */}
          <View style={{ flex: 1, flexDirection: "row", marginTop: 20 }}>
            <View style={{ flex: 1 }}>
              <TouchableHighlight onPress={() => this.moveCamera()}>
                <View style={styles.shopbtnLine}>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Image
                      source={require("./../images/icons8-shopping-cart-24_white.png")}
                    />
                  </View>
                  <View style={styles.shopbtnTitleView}>
                    <Text style={styles.shopbtnTitleText}>
                      続けて{"\n"}買い物する
                    </Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableHighlight
                onPress={() => this.onClickPay()}
                disabled={this.state.itemCnt === 0 ? true : false}
              >
                <View style={styles.paybtnLine}>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Image
                      source={require("./../images/icons8-purse-24_white.png")}
                    />
                  </View>
                  <View style={styles.paybtnTitleView}>
                    <Text style={styles.paybtnTitleText}>支払いする</Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          </View>

          {/* -- 確認ダイアログ -- */}
          <ConfirmDialog
            modalVisible={this.state.confirmDialogVisible}
            message={this.state.confirmDialogMessage}
            handleYes={this.pay.bind(this)}
            handleNo={() => {
              this.setState({ confirmDialogVisible: false });
            }}
            handleClose={() => {
              this.setState({ confirmDialogVisible: false });
            }}
          />
          {/* -- メッセージダイアログ -- */}
          <AlertDialog
            modalVisible={this.state.alertDialogVisible}
            message={this.state.alertDialogMessage}
            handleClose={() => {
              this.setState({ alertDialogVisible: false });
            }}
          />
          <AlertDialog
            modalVisible={this.state.finDialogVisible}
            message={"支払いが完了しました"}
            handleClose={() => {
              this.props.navigation.navigate("Home");
            }}
          />
        </View>
      );
    }
  }
}

const opacity = "rgba(0, 0, 0, .6)";

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 22,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black",
  },
  inputAndroid: {
    fontSize: 22,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  layerTop: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerCenter: {
    flex: 1,
    flexDirection: "row",
  },
  layerLeft: {
    flex: 1,
    backgroundColor: opacity,
  },
  focused: {
    flex: 8,
  },
  layerRight: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerBottom: {
    flex: 1,
    backgroundColor: opacity,
  },
  description: {
    fontSize: 25,
    marginTop: "40%",
    textAlign: "center",
    color: "white",
  },
  cancel: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
    marginTop: "30%",
  },
  screenTitleView: {
    alignItems: "center",
    marginTop: 25,
    backgroundColor: "#ff5622",
  },
  screenTitleText: {
    fontSize: 26,
    color: "white",
    padding: 10,
    fontWeight: "bold",
  },
  itemLine: {
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: "cornflowerblue",
    flexDirection: "row",
  },
  paybtnLine: {
    borderRadius: 10,
    alignItems: "center",
    marginTop: 0,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: "#ff5622",
    flexDirection: "row",
    height: 65,
  },
  paybtnTitleView: {
    flex: 3,
    alignItems: "center",
  },
  paybtnTitleText: {
    fontSize: 22,
    color: "white",
    padding: 5,
  },
  shopbtnLine: {
    borderRadius: 10,
    alignItems: "center",
    marginTop: 0,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: "#FFB300",
    flexDirection: "row",
    height: 65,
  },
  shopbtnTitleView: {
    flex: 3,
    alignItems: "center",
  },
  shopbtnTitleText: {
    fontSize: 22,
    color: "white",
    padding: 5,
  },
});
