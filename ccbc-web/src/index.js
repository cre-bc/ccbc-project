import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  HashRouter,
  Route,
  Link,
  Switch,
} from "react-router-dom";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import createHistory from "history/createBrowserHistory";
import Auth from "./view/auth";
import {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
} from "react-router-redux";
import { countReducer } from "./reducers/count";
import { coinShokaiReducer } from "./reducers/coin_shokai";
import { tohyo_shokai_shosaiReducer } from "./reducers/tohyo_shokai_shosai";
import { tohyoShokaiKobetsuReducer } from "./reducers/tohyo_shokai_kobetsu";
import { tohyo_shokai_nendoReducer } from "./reducers/tohyo_shokai_nendo";
import { shainTorokuReducer } from "./reducers/shain_toroku";
import { senkyoKanriReducer } from "./reducers/senkyo_kanri";
import ScrollToTop from "./view/scroll_to_top";

import HeaderForm from "./view/header";
import FooterForm from "./view/footer";
import LoginForm from "./view/login";
import CheckForm from "./view/check";
import CheckSuccessForm from "./view/check_success";
import ReduxForm from "./view/redux";
import ReduxCountForm from "./view/redux_count";
import ReduxDisplayForm from "./view/redux_display";
import ReduxDisplayForm2 from "./view/redux_display2";

import SampleForm from "./view/sample";
import RadarChartForm from "./view/radar";
import GraphForm from "./view/graph";
import DbForm from "./view/db";
import ImageForm from "./view/image";
import MenuForm from "./view/menu";
import SenkyoKanriForm from "./view/senkyo_kanri";
import SenkyoTorokuForm from "./view/senkyo_toroku";
import TohyoTorokuForm from "./view/tohyo_toroku";
import TohyoIchiranForm from "./view/tohyo_ichiran";
import TohyoShokaiKobetsuForm from "./view/tohyo_shokai_kobetsu";
import TohyoShokaiShosaiForm from "./view/tohyo_shokai_shosai";
import CommentShokaiForm from "./view/comment_shokai";
import CoinShokaiForm from "./view/coin_shokai";
import TohyoShokaiNendoForm from "./view/tohyo_shokai_nendo";
import ShainKensakuForm from "./view/shain_kensaku";
import ShainTorokuForm from "./view/shain_toroku";
import CoinZoyoForm from "./view/coin_zoyo";

// ComComCoin
import ComCoinShokaiForm from "./view/com_coin_shokai";
import ComCoinShokaiGraphForm from "./view/com_coin_shokai_graph";
import ComCoinShojicoinForm from "./view/com_coin_shojicoin";
import ComShohinMenteForm from "./view/com_shohin_mente";
import ComKokokuMenteForm from "./view/com_kokoku_mente";
import ComOshiraseMenteForm from "./view/com_oshirase_mente";
import ArtcleForm from "./view/article";

import AppSelectForm from "./view/app_select";
import ComMenuForm from "./view/com_menu";

const history = createHistory();
const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    count: countReducer,
    coinShokai: coinShokaiReducer,
    tohyo_shokai_shosai: tohyo_shokai_shosaiReducer,
    tohyoShokaiKobetsu: tohyoShokaiKobetsuReducer,
    tohyo_shokai_nendo: tohyo_shokai_nendoReducer,
    shainToroku: shainTorokuReducer,
    shain_toroku: shainTorokuReducer,
    senkyoKanri: senkyoKanriReducer,
    routing: routerReducer,
  }),
  applyMiddleware(middleware)
);

// history.listen(location => {
//   setTimeout(() => {
//     if (location.action === 'POP') {
//       return
//     }
//     window.scrollTo(0, 0)
//   })
// })

ReactDOM.render(
  <Provider store={store}>
    {/* <HashRouter> */}
    <ConnectedRouter history={history}>
      <ScrollToTop>
        <div>
          <Route path="/check" component={HeaderForm} />
          <Route path="/check_success" component={HeaderForm} />
          <Route path="/redux" component={HeaderForm} />
          <Route path="/redux_count" component={HeaderForm} />
          <Route path="/redux_display" component={HeaderForm} />
          <Route path="/redux_display2" component={HeaderForm} />
          <Route path="/radar" component={HeaderForm} />
          <Route path="/graph" component={HeaderForm} />
          <Route path="/db" component={HeaderForm} />
          <Route path="/image" component={HeaderForm} />

          <Switch>
            <Route exact path="/" component={LoginForm} />

            <Route path="/sample" component={SampleForm} />
            <Route path="/check" component={CheckForm} />
            <Route path="/check_success" component={CheckSuccessForm} />
            <Route path="/redux" component={ReduxForm} />
            <Route path="/redux_count" component={ReduxCountForm} />
            <Route path="/redux_display" component={ReduxDisplayForm} />
            <Route path="/redux_display2" component={ReduxDisplayForm2} />
            <Route path="/radar" component={RadarChartForm} />
            <Route path="/graph" component={GraphForm} />
            <Route path="/db" component={DbForm} />
            <Route path="/image" component={ImageForm} />
            <Route path="/app_select" component={AppSelectForm} />
            <Route path="/menu" component={MenuForm} />
            <Route path="/com_menu" component={ComMenuForm} />
            <Route path="/com_coin_shokai" component={ComCoinShokaiForm} />
            <Route
              path="/com_coin_shokai_graph"
              component={ComCoinShokaiGraphForm}
            />
            <Route
              path="/com_coin_shojicoin"
              component={ComCoinShojicoinForm}
            />
            <Route path="/com_shohin_mente" component={ComShohinMenteForm} />
            <Route path="/com_kokoku_mente" component={ComKokokuMenteForm} />
            <Route
              path="/com_oshirase_mente"
              component={ComOshiraseMenteForm}
            />
            <Auth>
              <Switch>
                <Route path="/senkyo_kanri" component={SenkyoKanriForm} />
                <Route path="/senkyo_toroku" component={SenkyoTorokuForm} />
                <Route path="/tohyo_toroku" component={TohyoTorokuForm} />
                <Route path="/tohyo_ichiran" component={TohyoIchiranForm} />
                <Route
                  path="/tohyo_shokai_kobetsu"
                  component={TohyoShokaiKobetsuForm}
                />
                <Route
                  path="/tohyo_shokai_shosai"
                  component={TohyoShokaiShosaiForm}
                />
                <Route path="/comment_shokai" component={CommentShokaiForm} />
                <Route path="/coin_shokai" component={CoinShokaiForm} />
                <Route
                  path="/tohyo_shokai_nendo"
                  component={TohyoShokaiNendoForm}
                />
                <Route path="/shain_kensaku" component={ShainKensakuForm} />
                <Route path="/shain_toroku" component={ShainTorokuForm} />
                <Route path="/coin_zoyo" component={CoinZoyoForm} />
                <Route path="/article" component={ArtcleForm} />
              </Switch>
            </Auth>
            <FooterForm />
          </Switch>
        </div>
      </ScrollToTop>
    </ConnectedRouter>
    {/* </HashRouter> */}
  </Provider>,
  document.getElementById("root")
);
