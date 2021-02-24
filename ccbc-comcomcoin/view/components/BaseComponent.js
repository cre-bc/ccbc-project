import { Component } from "react";
import { AsyncStorage } from "react-native";

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

    const loginInfo = JSON.parse(await AsyncStorage.getItem("loginInfo"));
    this.state.userid = loginInfo["userid"];
    this.state.password = loginInfo["password"];
    this.state.loginShainPk = loginInfo["tShainPk"];
    this.state.imageFileName = loginInfo["imageFileName"];
    this.state.shimei = loginInfo["shimei"];
    this.state.kengenCd = loginInfo["kengenCd"];
    this.state.tokenId = loginInfo["tokenId"];
    this.state.bcAccount = loginInfo["bcAccount"];
    this.state.chatGroupPk = loginInfo["chatGroupPk"];

    this.state.expo_push_token = await AsyncStorage.getItem("expo_push_token");
  };
}
