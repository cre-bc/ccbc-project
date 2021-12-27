import React, { Component } from "react";
import { AsyncStorage, View, Image, Platform } from "react-native";
import { Header, Icon } from "react-native-elements";
import ConfirmDialog from "./ConfirmDialog";

class InAppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLogoutDialogVisible: false,
    };
  }

  // Homeボタン押下
  onPressHomeButton = () => {
    this.props.navigate("Home");
  };

  // ログアウトボタン押下
  onPressLogoutButton = () => {
    this.setState({ confirmLogoutDialogVisible: false });
    AsyncStorage.removeItem("groupInfo");
    AsyncStorage.removeItem("loginInfo");
    this.props.navigate("LoginGroup");
  };

  render() {
    return (
      <View>
        <Header
          outerContainerStyles={{ height: 50 }}
          leftComponent={
            <View>
              {(() => {
                if (Platform.OS !== "ios") {
                  return (
                    <Icon
                      containerStyle={{ marginBottom: -5, height: 32 }}
                      size={32}
                      name="home"
                      type="font-awesome"
                      color="white"
                      onPress={() => this.onPressHomeButton()}
                    />
                  )
                }
              })()}
            </View>
          }
          centerComponent={
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("./../../images/ComComCoin_logo_02.png")}
              />
            </View>
          }
          rightComponent={
            <View>
              {(() => {
                if (Platform.OS !== "ios") {
                  return (
                    <Icon
                      containerStyle={{ marginBottom: -5, height: 32 }}
                      size={32}
                      name="sign-out"
                      type="font-awesome"
                      color="white"
                      onPress={() =>
                        this.setState({ confirmLogoutDialogVisible: true })
                      }
                    />
                  )
                }
              })()}
            </View>
          }
          backgroundColor="#ff5622"
        />

        {/* -- 確認ダイアログ -- */}
        <ConfirmDialog
          modalVisible={this.state.confirmLogoutDialogVisible}
          message={"ログアウトします。よろしいですか？"}
          handleYes={this.onPressLogoutButton.bind(this)}
          handleNo={() => {
            this.setState({ confirmLogoutDialogVisible: false });
          }}
          handleClose={() => {
            this.setState({ confirmLogoutDialogVisible: false });
          }}
        />
      </View>
    );
  }
}

export default InAppHeader;
