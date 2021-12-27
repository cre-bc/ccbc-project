import { Component } from "react";
import { Platform, Linking, Alert, AsyncStorage } from "react-native";
import { expo } from "../../app.json";

export default class BaseComponent extends Component {
  constructor(props) {
    super(props);
  }

  getLoginInfo = async () => {
    const groupInfo = JSON.parse(await AsyncStorage.getItem("groupInfo"));
    this.state.saveFlg = groupInfo["saveFlg"];
    this.state.group_id = groupInfo["group_id"];
    this.state.db_name = groupInfo["db_name"];
    this.state.bc_addr = groupInfo["bc_addr"];
    this.state.app_ver = expo.version;
    this.state.app_type = "hvt";
    this.state.os_type = Platform.OS;

    const loginInfo = JSON.parse(await AsyncStorage.getItem("loginInfo"));
    this.state.userid = loginInfo["userid"];
    this.state.password = loginInfo["password"];
    this.state.loginShainPk = loginInfo["tShainPk"];
    this.state.tShainPk = Number(loginInfo["tShainPk"]);
    this.state.imageFileName = loginInfo["imageFileName"];
    this.state.shimei = loginInfo["shimei"];
    this.state.kengenCd = loginInfo["kengenCd"];
    this.state.tokenId = loginInfo["tokenId"];
    this.state.bcAccount = loginInfo["bcAccount"];

    this.state.expo_push_token = await AsyncStorage.getItem("expo_push_token");
  };

  checkApiResult = async (json) => {
    if ("status_cd" in json) {
      if (json.status_cd == "1") {
        // メンテナンス中
        await new Promise(resolve => {
          Alert.alert("HARVEST", "メンテナンス中です。\nアナウンスがあるまで利用を控えてください。", [{ onPress: resolve }]);
        });
        this.props.navigation.navigate("LoginGroup");
      } else if (json.status_cd == "2") {
        // バージョンアップが必要
        await new Promise(resolve => {
          Alert.alert("HARVEST", "最新バージョンがリリースされています。\nストアよりアップデートをしてください。", [{ onPress: resolve }]);
        });
        this.props.navigation.navigate("LoginGroup");
        this.openStoreUrl();
      }
      return false;
    }
    return true;
  };

  // ストアのURLを開く
  openStoreUrl = () => {
    // iOSとAndroidでストアのURLが違うので分岐する
    if (Platform.OS === "ios") {
      const appId = 1448055815; // AppStoreのURLから確認できるアプリ固有の数値
      const itunesURLScheme = `itms-apps://itunes.apple.com/jp/app/id${appId}?mt=8`;
      const itunesURL = `https://itunes.apple.com/jp/app/id${appId}?mt=8`;

      Linking.canOpenURL(itunesURLScheme).then(supported => {
        // AppStoreアプリが開ける場合はAppStoreアプリで開く。開けない場合はブラウザで開く。
        if (supported) {
          Linking.openURL(itunesURLScheme);
        } else {
          Linking.openURL(itunesURL);
        }
      });
    } else {
      const appId = "com.creativeconsultant.harvest"; // PlayストアのURLから確認できるid=?の部分
      const playStoreURLScheme = `market://details?id=${appId}`;
      const playStoreURL = `https://play.google.com/store/apps/details?id=${appId}`;

      Linking.canOpenURL(playStoreURLScheme).then(supported => {
        // Playストアアプリが開ける場合はPlayストアアプリで開く。開けない場合はブラウザで開く。
        if (supported) {
          Linking.openURL(playStoreURLScheme);
        } else {
          Linking.openURL(playStoreURL);
        }
      });
    }
  };

  errorApi = async (error) => {
    await new Promise(resolve => {
      Alert.alert("HARVEST", "通信ができないか、サーバがメンテナンス中の可能性があります。\nしばらく時間をおいてからご利用ください。", [{ onPress: resolve }]);
    });
    console.error(error);
    this.props.navigation.navigate("LoginGroup");
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
}
