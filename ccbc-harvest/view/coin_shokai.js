import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  Picker,
  FlatList,
  AsyncStorage,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import {
  Header,
  Button,
  Icon,
  Avatar,
  Rating,
  FormInput,
  Card
} from 'react-native-elements'
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component'
import { Provider, connect } from 'react-redux' // 5.0.6
import { createStore, bindActionCreators } from 'redux' // 3.7.2
import * as myActions from '../actions/coin_shokai'
import { StackNavigator } from 'react-navigation' // 1.0.0-beta.21
import BaseComponent from "./components/BaseComponent"

const restdomain = require('./common/constans.js').restdomain

class CoinShokai extends BaseComponent {
  constructor(props) {
    super(props)
    this.inputRefs = {}
    this.state = {
      resultList: [],
      shainList: [],
      yearList: [],
      getCoinAllList: [],
      getCoinList: [],
      takeCoinAllList: [],
      takeCoinList: [],
      allGetCoin: 0,
      getCoin: 0,
      allTakeCoin: 0,
      takeCoin: 0,
      happyoSu: '',
      year_info: '',
      target_manager: '',
      selectList: [],
      target_select: 0,
      jimukyokuList: [],
      target_jimukyoku: 0,
      tableData: [],
      tableHead: [],
      kengenCd: null,
      checked: false,
      userid: null,
      password: null,
      tShainPk: 0,
      imageFileName: null,
      shimei: null,
      saveFlg: false,
      group_id: '',
      db_name: '',
      bc_addr: ''
    }
    this.props = props
  }

  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // 初期表示情報取得
    this.findCoinShokai()
    this.setState({
      selectList: [
        { label: '獲得コイン情報', value: 0 },
        { label: '投票コイン情報', value: 1 }
      ]
    })
    this.setState({
      jimukyokuList: [
        { label: '事務局を表示しない', value: 0 },
        { label: '事務局を表示する', value: 1 }
      ]
    })
    this.setState({
      tableHead: [
        '日付',
        '投票・コイン贈与',
        '投票（授与）者',
        '受領コイン',
        'コメント'
      ]
    })
  }

  findCoinShokai = async () => {
    await fetch(restdomain + '/coin_shokai/find', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function (response) {
        return response.json()
      })
      .then(
        async function (json) {
          // API戻り値の確認
          if (!await this.checkApiResult(json)) {
            return
          }
          // 結果が取得できない場合は終了
          if (typeof json.getCoinDatas === 'undefined') {
            return
          }
          // 検索結果の取得
          var resList = json.getCoinDatas
          var resList2 = json.shainDatas
          var resList3 = json.nendoDatas
          var tableData_copy = []
          for (var i in resList) {
            tableData_copy.push([
              resList[i].insert_tm,
              resList[i].title,
              resList[i].shimei,
              resList[i].coin,
              i
            ])
          }
          this.setState({ tableData: tableData_copy })

          for (var i in resList2) {
            this.state.shainList.push({
              label: resList2[i].shimei,
              value: resList2[i].t_shain_pk
            })
          }
          for (var i in resList3) {
            this.state.yearList.push({
              label: resList3[i] + '年',
              value: resList3[i]
            })
          }
          this.setState({ getCoinAllList: json.getCoinDatasAll })
          this.setState({ getCoinList: resList })
          this.setState({ takeCoinAllList: json.takeCoinDatasAll })
          this.setState({ takeCoinList: json.takeCoinDatas })
          this.setState({
            allGetCoin: '受領コイン計（事務局含む）：' + json.allGetCoinSu
          })
          this.setState({
            getCoin: '受領コイン計：' + json.getCoinSu
          })
          this.setState({
            allTakeCoin: '授与コイン計（事務局含む）：' + json.allTakeCoinSu
          })
          this.setState({
            takeCoin: '授与コイン計：' + json.takeCoinSu
          })
          this.setState({ happyoSu: json.happyoSu })
        }.bind(this)
      )
      .catch((error) => this.errorApi(error))
  }

  onPressLogoutButton = () => {
    AsyncStorage.removeItem('groupInfo')
    this.props.navigation.navigate('LoginGroup')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }
  onPressTarget(index) {
    // 獲得コイン情報表示
    if (this.state.target_select == 0) {
      // 事務局非表示
      if (this.state.target_jimukyoku == 0) {
        var para = this.state.getCoinList
        this.props.actions.setData(
          para[index].t_tohyo_pk,
          para[index].t_zoyo_pk,
          para[index].title,
          para[index].shimei,
          para[index].coin
        )
      } else {
        var para = this.state.getCoinAllList
        this.props.actions.setData(
          para[index].t_tohyo_pk,
          para[index].t_zoyo_pk,
          para[index].title,
          para[index].shimei,
          para[index].coin
        )
      }
    } else {
      // 授与コイン情報表示
      // 事務局非表示
      if (this.state.target_jimukyoku == 0) {
        var para = this.state.takeCoinList
        this.props.actions.setData(
          para[index].t_tohyo_pk,
          para[index].t_zoyo_pk,
          para[index].title,
          para[index].shimei,
          para[index].coin
        )
      } else {
        var para = this.state.takeCoinAllList
        this.props.actions.setData(
          para[index].t_tohyo_pk,
          para[index].t_zoyo_pk,
          para[index].title,
          para[index].shimei,
          para[index].coin
        )
      }
    }
    this.props.navigation.navigate('CommentShokai')
  }

  render() {
    const { classes, theme, actions } = this.props
    const element = (data, index) => (
      <TouchableOpacity onPress={e => this.onPressTarget(index)}>
        <View style={tableStyles.btn}>
          <Text style={tableStyles.btnText}>REFER</Text>
        </View>
      </TouchableOpacity>
    )

    if (this.state.kengenCd == '1' || this.state.kengenCd == '0') {
      var targetSelect = (
        <RNPickerSelect
          placeholder={{
            label: '照会する対象者を選択してください',
            value: ''
          }}
          items={this.state.shainList}
          onValueChange={value => {
            this.state.target_manager = value
            this.setState({ target_manager: value })
            if (value === '') {
              return
            }
            if (this.state.year_info === '') {
              return
            }
            fetch(restdomain + '/coin_shokai/findChange', {
              method: 'POST',
              body: JSON.stringify(this.state),
              headers: new Headers({ 'Content-type': 'application/json' })
            })
              .then(function (response) {
                return response.json()
              })
              .then(
                function (json) {
                  // 結果が取得できない場合は終了
                  if (typeof json.getCoinDatas === 'undefined') {
                    return
                  }
                  // 検索結果の取得
                  if (this.state.target_select == 0) {
                    this.setState({
                      tableHead: [
                        '日付',
                        '投票・コイン贈与',
                        '投票（授与）者',
                        '受領コイン',
                        'コメント'
                      ]
                    })
                    if (this.state.target_jimukyoku == 0) {
                      var resList = json.getCoinDatas
                    } else {
                      var resList = json.getCoinDatasAll
                    }
                  } else {
                    this.setState({
                      tableHead: [
                        '日付',
                        '投票・コイン贈与',
                        '投票（受領）相手',
                        '授与コイン',
                        'コメント'
                      ]
                    })
                    if (this.state.target_jimukyoku == 0) {
                      var resList = json.takeCoinDatas
                    } else {
                      var resList = json.takeCoinDatasAll
                    }
                  }
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                  this.setState({ getCoinAllList: json.getCoinDatasAll })
                  this.setState({ getCoinList: json.getCoinDatas })
                  this.setState({ takeCoinAllList: json.takeCoinDatasAll })
                  this.setState({ takeCoinList: json.takeCoinDatas })
                  this.setState({
                    allGetCoin:
                      '受領コイン計（事務局含む）：' + json.allGetCoinSu
                  })
                  this.setState({
                    getCoin: '受領コイン計：' + json.getCoinSu
                  })
                  this.setState({
                    allTakeCoin:
                      '授与コイン計（事務局含む）：' + json.allTakeCoinSu
                  })
                  this.setState({
                    takeCoin: '授与コイン計：' + json.takeCoinSu
                  })
                  this.setState({ happyoSu: json.happyoSu })
                }.bind(this)
              )
              .catch(error => console.error(error))
          }}
          style={{ ...pickerSelectStyles }}
          value={this.state.target_manager}
          ref={el => {
            this.inputRefs.picker = el
          }}
        />
      )
    } else {
      var targetSelect = (
        <RNPickerSelect
          placeholder={{
            label: '照会する対象者を選択してください',
            value: ''
          }}
          items={this.state.shainList}
          onValueChange={value => {
            this.setState({
              target_manager: value
            })
          }}
          style={{ ...pickerSelectStyles }}
          value={this.state.target_manager}
          ref={el => {
            this.inputRefs.picker = el
          }}
          disabled
        />
      )
    }

    if (this.state.target_select == '0') {
      var showAllCoin = (
        <Text style={{ fontSize: 14 }}>{this.state.allGetCoin}</Text>
      )
      var showCoin = <Text style={{ fontSize: 14 }}>{this.state.getCoin}</Text>
    } else {
      var showAllCoin = (
        <Text style={{ fontSize: 14 }}>{this.state.allTakeCoin}</Text>
      )
      var showCoin = <Text style={{ fontSize: 14 }}>{this.state.takeCoin}</Text>
    }

    return (
      <View style={styles.container}>
        <Header
          leftComponent={
            <Icon
              name={'home'}
              type={'font-awesome'}
              color="#fff"
              onPress={this.onPressMenuButton}
            />
          }
          centerComponent={
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <View>
                <Image source={require('./../images/HARVEST3.png')} />
              </View>
            </View>
          }
          rightComponent={
            <Icon
              name={'sign-out'}
              type={'font-awesome'}
              color="#fff"
              onPress={this.onPressLogoutButton}
            />
          }
          style={styles.header}
        />
        <ScrollView>
          <Text>年度情報</Text>
          <RNPickerSelect
            placeholder={{
              label: '照会する年度を選択してください',
              value: ''
            }}
            items={this.state.yearList}
            onValueChange={value => {
              this.state.year_info = value
              this.setState({ year_info: value })
              if (value === '') {
                return
              }
              fetch(restdomain + '/coin_shokai/findChange', {
                method: 'POST',
                body: JSON.stringify(this.state),
                headers: new Headers({ 'Content-type': 'application/json' })
              })
                .then(function (response) {
                  return response.json()
                })
                .then(
                  function (json) {
                    // 結果が取得できない場合は終了
                    if (typeof json.getCoinDatas === 'undefined') {
                      alert(value)
                      return
                    }
                    // 検索結果の取得
                    if (this.state.target_select == 0) {
                      this.setState({
                        tableHead: [
                          '日付',
                          '投票・コイン贈与',
                          '投票（授与）者',
                          '受領コイン',
                          'コメント'
                        ]
                      })
                      if (this.state.target_jimukyoku == 0) {
                        var resList = json.getCoinDatas
                      } else {
                        var resList = json.getCoinDatasAll
                      }
                    } else {
                      this.setState({
                        tableHead: [
                          '日付',
                          '投票・コイン贈与',
                          '投票（受領）相手',
                          '授与コイン',
                          'コメント'
                        ]
                      })
                      if (this.state.target_jimukyoku == 0) {
                        var resList = json.takeCoinDatas
                      } else {
                        var resList = json.takeCoinDatasAll
                      }
                    }
                    var resList = json.getCoinDatas
                    var tableData_copy = []
                    for (var i in resList) {
                      tableData_copy.push([
                        resList[i].insert_tm,
                        resList[i].title,
                        resList[i].shimei,
                        resList[i].coin,
                        i
                      ])
                    }
                    this.setState({ tableData: tableData_copy })
                    this.setState({ getCoinAllList: json.getCoinDatasAll })
                    this.setState({ getCoinList: json.getCoinDatas })
                    this.setState({ takeCoinAllList: json.takeCoinDatasAll })
                    this.setState({ takeCoinList: json.takeCoinDatas })
                    this.setState({
                      allGetCoin:
                        '受領コイン計（事務局含む）：' + json.allGetCoinSu
                    })
                    this.setState({
                      getCoin: '受領コイン計：' + json.getCoinSu
                    })
                    this.setState({
                      allTakeCoin:
                        '授与コイン計（事務局含む）：' + json.allTakeCoinSu
                    })
                    this.setState({
                      takeCoin: '授与コイン計：' + json.takeCoinSu
                    })
                    this.setState({ happyoSu: json.happyoSu })
                  }.bind(this)
                )
                .catch(error => console.error(error))
            }}
            style={{ ...pickerSelectStyles }}
            value={this.state.year_info}
            ref={el => {
              this.inputRefs.picker = el
            }}
          />
          <Text>対象者（管理者用）</Text>
          <View>{targetSelect}</View>
          <Text>事務局表示</Text>
          <RNPickerSelect
            placeholder={{
              label: '事務局表示有無を選択してください',
              value: null
            }}
            items={this.state.jimukyokuList}
            onValueChange={value => {
              //獲得コイン情報表示の場合
              if (this.state.target_select == 0) {
                this.setState({
                  tableHead: [
                    '日付',
                    '投票・コイン贈与',
                    '投票（授与）者',
                    '受領コイン',
                    'コメント'
                  ]
                })
                if (value == 0) {
                  // 事務局無
                  var resList = this.state.getCoinList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else if (value == 1) {
                  // 事務局有
                  var resList = this.state.getCoinAllList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else {
                  // 事務局未選択
                  var tableData_copy = []
                  this.setState({ tableData: tableData_copy })
                }
              } else if (this.state.target_select == 1) {
                // 投票コイン情報表示の場合
                this.setState({
                  tableHead: [
                    '日付',
                    '投票・コイン贈与',
                    '投票（受領）相手',
                    '授与コイン',
                    'コメント'
                  ]
                })
                if (value == 0) {
                  // 事務局無
                  var resList = this.state.takeCoinList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else if (value == 1) {
                  // 事務局有
                  var resList = this.state.takeCoinAllList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else {
                  // 事務局未選択
                  var tableData_copy = []
                  this.setState({ tableData: tableData_copy })
                }
              } else {
                // 照会対象未選択
                var tableData_copy = []
                this.setState({ tableData: tableData_copy })
              }
              this.setState({
                target_jimukyoku: value
              })
            }}
            style={{ ...pickerSelectStyles }}
            value={this.state.target_jimukyoku}
            ref={el => {
              this.inputRefs.picker = el
            }}
          />
          <Text>照会対象コイン</Text>
          <RNPickerSelect
            placeholder={{
              label: '照会する対象コインを選択してください',
              value: null
            }}
            items={this.state.selectList}
            onValueChange={value => {
              //獲得コイン情報表示の場合
              if (value == 0) {
                this.setState({
                  tableHead: [
                    '日付',
                    '投票・コイン贈与',
                    '投票（授与）者',
                    '受領コイン',
                    'コメント'
                  ]
                })
                if (this.state.target_jimukyoku == 0) {
                  // 事務局無
                  var resList = this.state.getCoinList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else if (this.state.target_jimukyoku == 1) {
                  // 事務局有
                  var resList = this.state.getCoinAllList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else {
                  // 事務局未選択
                  var tableData_copy = []
                  this.setState({ tableData: tableData_copy })
                }
              } else if (value == 1) {
                // 投票コイン情報表示の場合
                this.setState({
                  tableHead: [
                    '日付',
                    '投票・コイン贈与',
                    '投票（受領）相手',
                    '授与コイン',
                    'コメント'
                  ]
                })
                if (this.state.target_jimukyoku == 0) {
                  // 事務局無
                  var resList = this.state.takeCoinList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else if (this.state.target_jimukyoku == 1) {
                  // 事務局有
                  var resList = this.state.takeCoinAllList
                  var tableData_copy = []
                  for (var i in resList) {
                    tableData_copy.push([
                      resList[i].insert_tm,
                      resList[i].title,
                      resList[i].shimei,
                      resList[i].coin,
                      i
                    ])
                  }
                  this.setState({ tableData: tableData_copy })
                } else {
                  // 事務局未選択
                  var tableData_copy = []
                  this.setState({ tableData: tableData_copy })
                }
              } else {
                // 照会対象未選択
                var tableData_copy = []
                this.setState({ tableData: tableData_copy })
              }
              this.setState({
                target_select: value
              })
            }}
            style={{ ...pickerSelectStyles }}
            value={this.state.target_select}
            ref={el => {
              this.inputRefs.picker = el
            }}
          />
          <Card>
            <Text style={{ fontSize: 14 }}>
              発表数：
              {this.state.happyoSu}
            </Text>
            <View>{showAllCoin}</View>
            <View>{showCoin}</View>
          </Card>
          <Table borderStyle={{ borderColor: 'transparent' }}>
            <Row
              data={this.state.tableHead}
              style={tableStyles.head}
              textStyle={tableStyles.text}
            />
            {this.state.tableData.map((rowData, index) => (
              <TableWrapper key={index} style={tableStyles.row}>
                {rowData.map((cellData, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    data={cellIndex === 4 ? element(cellData, index) : cellData}
                    textStyle={tableStyles.text}
                  />
                ))}
              </TableWrapper>
            ))}
          </Table>
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF'
  },
  header: {},
  targe_item: {
    flexDirection: 'row',
    marginTop: 0,
    marginLeft: 30,
    marginRight: 30
  },
  target_year_view: {},
  target_name_view: {
    flexDirection: 'column',
    marginLeft: 30,
    justifyContent: 'center'
  },
  target_title_view: {
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 20
  },
  target_coin_view: {
    marginLeft: 0
  },
  target_total_coin_view: {
    marginLeft: 10
  },
  rating_item: {
    flexDirection: 'row'
  },
  rating_title_view: {
    justifyContent: 'center',
    marginLeft: 0
  },
  rating_point_view: {
    justifyContent: 'center'
  },
  rating_value_view: {
    flexDirection: 'column',
    marginLeft: 10
  },
  picker: {
    width: 200
  },
  year_list: {
    color: 'blue'
  }
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black'
  },
  inputAndroid: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black",
  },
})

const tableStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: '#F5FCFF'
  },
  head: { height: 40, backgroundColor: '#808B97' },
  text: { margin: 6, fontSize: 11 },
  row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
  btn: {
    width: 58,
    height: 30,
    backgroundColor: '#78B7BB',
    borderRadius: 2
    // verticalAlign: 'middle'
  },
  btnText: {
    textAlign: 'center',
    color: '#fff'
    // verticalAlign: 'middle'
  }
})

const mapDispatch = dispatch => ({
  actions: bindActionCreators(myActions, dispatch)
})

export default connect(
  null,
  mapDispatch
)(CoinShokai)
