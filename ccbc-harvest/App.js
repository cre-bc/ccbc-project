import React, { Component } from "react";
import { View, Text, Button } from "react-native";
import { Provider, connect } from "react-redux"; // 5.0.6
import { createStore, combineReducers } from "redux"; // 3.7.2
import { createStackNavigator, createAppContainer } from "react-navigation"; // 1.0.0-beta.21
import { sampleReducer } from "./reducers/sampleReducer";
import { coinShokaiReducer } from "./reducers/coin_shokai";
import HomeForm from "./view/Home";
import NextForm from "./view/Next";
import CarouselForm from "./view/carousel";
import KeyboardForm from "./view/Keyboard";
import LoginForm from "./view/login";
import MenuForm from "./view/menu";
import TohyoTorokuForm from "./view/tohyo_toroku";
import TohyoShokaiForm from "./view/tohyo_shokai";
import TohyoShokaiShosaiForm from "./view/tohyo_shokai_shosai";
import CoinShokaiForm from "./view/coin_shokai";
import CoinZoyoForm from "./view/coin_zoyo";
import CommentShokaiForm from "./view/comment_shokai";
import TohyoIchiranForm from "./view/tohyo_ichiran";
import LoginGroupForm from "./view/login_group";

/******* Navigator *******/

var HomeNavigator = createStackNavigator(
  {
    Home: { screen: HomeForm },
    NextScreen: { screen: NextForm },
    CarouselScreen: { screen: CarouselForm },
    KeyboardScreen: { screen: KeyboardForm },
    Login: { screen: LoginForm },
    Menu: { screen: MenuForm },
    TohyoToroku: { screen: TohyoTorokuForm },
    TohyoIchiran: { screen: TohyoIchiranForm },
    TohyoShokai: { screen: TohyoShokaiForm },
    TohyoShokaiShosai: { screen: TohyoShokaiShosaiForm },
    CoinShokai: { screen: CoinShokaiForm },
    CoinZoyo: { screen: CoinZoyoForm },
    CommentShokai: { screen: CommentShokaiForm },
    LoginGroup: { screen: LoginGroupForm },
  },
  {
    initialRouteName: "LoginGroup",
    defaultNavigationOptions: () => ({
      header: null
    })
  }
);

const AppContainer = createAppContainer(HomeNavigator);

/******* Set up store *******/

const store = createStore(
  combineReducers({
    sample: sampleReducer,
    coinShokai: coinShokaiReducer
  })
);

/**************/

export default class App extends Component {
  state = {
    saveFlg: false
  };

  async componentWillMount() {
    var groupInfo = await this.getGroupInfo();
    if (groupInfo != null) {
      this.setState({ saveFlg: groupInfo["saveFlg"] });
    }
  }

  getGroupInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem("groupInfo"));
    } catch (error) {
      return;
    }
  };

  render() {
    return (
      <Provider store={store}>
        <AppContainer
          ref={nav => {
            this.navigator = nav;
          }}
        />
      </Provider>
    );
  }
}
