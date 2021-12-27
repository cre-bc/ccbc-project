import React, { Component } from 'react'
import ReactNative, {
  StyleSheet,
  View,
  ScrollView,
  Text,
  AsyncStorage,
  KeyboardAvoidingView,
  Image,
  Picker,
  Modal,
  Keyboard
} from 'react-native'
import {
  Header,
  Button,
  Icon,
  Avatar,
  Rating,
  FormLabel,
  FormInput,
  CheckBox,
  Card
} from 'react-native-elements'
import TextInput from './common/TextInput'
import RNPickerSelect from 'react-native-picker-select'
import InputNumberStyles from 'rmc-input-number/lib/styles'
import InputNumber from 'rmc-input-number'
import BaseComponent from "./components/BaseComponent"

const restdomain = require('./common/constans.js').restdomain

export default class CoinZoyo extends BaseComponent {
  constructor(props) {
    super(props)
    this.inputRefs = {}
    this.state = {
      resultList: [],
      target_manager: 0,
      comment: null,
      checked: false,
      from_bcaccount: '',
      to_bcaccount: '',
      to_tShainPk: '',
      nenjiFlg: '0',
      modalVisible: false,
      modalVisible2: false,
      modalVisible3: false,
      shainList: [],
      zoyoCoin: 0,
      height: 0,
      value: 5,
      saveFlg: false,
      group_id: '',
      db_name: '',
      bc_addr: '',
      loadFlg: false
    }
    this.props = props
  }
  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    this.setState({ modalVisible: false })
    this.setState({ modalVisible2: false })
    this.setState({ modalVisible3: false })
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._handleKeyboardWillShow.bind(this)
    )

    // 初期表示情報取得
    this.findCoinZoyo()
  }

  //画面初期表示情報取得
  findCoinZoyo = async () => {
    await fetch(restdomain + '/coin_zoyo/find', {
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
          if (typeof json.data === 'undefined') {
            return
          }
          // 抽出結果の取得
          var dataList = json.data
          var resbccoin = json.bccoin
          var resshimei = json.shimei
          var resfrom_bcaccount = json.from_bcaccount

          this.setState({ resultList: dataList })
          this.setState({ bccoin: resbccoin })
          this.setState({ shimei: resshimei })
          this.setState({ from_bcaccount: resfrom_bcaccount })

          //贈与相手社員リスト設定
          for (var i in dataList) {
            this.state.shainList.push({
              label: dataList[i].shimei,
              value: dataList[i].t_shain_pk,
              key: dataList[i].kengen_cd,
              to_bcaccount: dataList[i].bc_account
            })
          }
          this.setState({ shainList: this.state.shainList })
        }.bind(this)
      )
      .catch((error) => this.errorApi(error))
  }

  handleSubmit = async () => {
    this.setState({ loadFlg: true })
    await fetch(restdomain + '/coin_zoyo/create', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(
        function (response) {
          this.closeModal()
          return response.json()
        }.bind(this)
      )
      .then(
        async function (json) {
          // API戻り値の確認
          if (!await this.checkApiResult(json)) {
            return
          }
          if (!json.status) {
            this.openModal3()
          } else {
            this.props.navigation.navigate('Menu')
          }
        }.bind(this)
      )
      .catch((error) => this.errorApi(error))
    this.setState({ loadFlg: false })
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove()
  }

  onPressLogoutButton = () => {
    AsyncStorage.removeItem('groupInfo')
    this.props.navigation.navigate('LoginGroup')
  }

  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }

  onIconPress() {
    var checked = this.state.checked
    // 初期表示はFalse
    if (checked) {
      this.setState({ checked: false })
      this.setState({ zoyoCoin: 0 })
      this.setState({ comment: null })
      this.setState({ nenjiFlg: '0' })
    } else {
      this.setState({ checked: true })
      this.setState({ zoyoCoin: Number(this.state.bccoin) })
      this.setState({ comment: '年度末コイン返却' })
      this.setState({ nenjiFlg: '1' })

      for (var i in this.state.shainList) {
        var shainList = this.state.shainList[i]
        if (shainList.key === '0') {
          this.setState({ to_tShainPk: shainList.value })
          this.setState({ to_bcaccount: shainList.to_bcaccount })
          break
        }
      }
    }
  }

  handleSubmitCheck = () => {
    var flgZoyoaite = false
    var flgComment = false
    var flgCoin = false

    //贈与相手未入力チェック
    if (
      typeof this.state.to_tShainPk === 'undefined' ||
      this.state.to_tShainPk === null ||
      (this.state.to_tShainPk != null && this.state.to_tShainPk.length === 0)
    ) {
      flgZoyoaite = true
    }
    //コメント未入力チェック
    if (
      typeof this.state.comment === 'undefined' ||
      (this.state.comment != null && this.state.comment.length === 0)
    ) {
      flgComment = true
    }
    if (
      typeof this.state.zoyoCoin === 'undefined' ||
      (this.state.zoyoCoin != null && this.state.zoyoCoin < 1)
    ) {
      flgCoin = true
    }
    //エラー有無確認
    if (flgZoyoaite || flgComment || flgCoin) {
      this.openModal2()
    } else {
      this.openModal()
    }
  }

  openModal() {
    this.setState({ modalVisible: true })
  }

  closeModal() {
    this.setState({ modalVisible: false })
  }

  openModal2() {
    this.setState({ modalVisible2: true })
  }

  closeModal2() {
    this.setState({ modalVisible2: false })
  }

  openModal3() {
    this.setState({ modalVisible3: true })
  }

  closeModal3() {
    this.setState({ modalVisible3: false })
  }

  onChange = value => {
    this.setState({ zoyoCoin: value })
  }

  render() {
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

        <KeyboardAvoidingView behavior="padding">
          <ScrollView ref={component => (this._scrollview = component)}>
            <Card>
              <Text style={{ fontSize: 18 }}>
                {this.state.shimei}
                の所持コイン数
                {'\n'}
                {this.state.bccoin}
                コイン
              </Text>
            </Card>
            <View>
              <Text style={{ color: '#b8860b' }}>
                {'\n'}
                【贈与相手】
              </Text>
              <RNPickerSelect
                disabled={this.state.checked}
                placeholder={{
                  label: '贈与相手を選択してください',
                  value: null
                }}
                items={this.state.shainList}
                onValueChange={value => {
                  this.setState({
                    to_tShainPk: value
                  })
                  for (var i in this.state.shainList) {
                    var shainList = this.state.shainList[i]
                    if (value === shainList.value) {
                      this.setState({ to_bcaccount: shainList.to_bcaccount })
                      break
                    }
                  }
                }}
                //onUpArrow={() => {
                //  this.inputRefs.name.focus()
                //}}
                //onDownArrow={() => {
                //  this.inputRefs.picker2.togglePicker()
                //}}
                style={{ ...pickerSelectStyles }}
                value={this.state.to_tShainPk}
                ref={el => {
                  this.inputRefs.picker = el
                }}
              />
              <CheckBox
                style={{ marginLeft: 30 }}
                title="年度末処理"
                checked={this.state.checked}
                onIconPress={checked => this.onIconPress()}
              />
              <Text style={{ color: '#b8860b' }}>
                {'\n'}
                【贈与コイン】
              </Text>
              {/* <TextInput
                {...this.props}
                keyboardType="numeric"
                onChangeText={text => {
                  this.state.zoyoCoin = text
                }}
                value={this.state.zoyoCoin}
                ref={component => (this._textinput = component)}
              /> */}
              <InputNumber
                min={0}
                max={this.state.bccoin}
                keyboardType="numeric"
                value={this.state.zoyoCoin}
                onChange={this.onChange}
                styles={InputNumberStyles}
                disabled={this.state.checked}
              />
              <Text style={{ color: '#b8860b' }}>
                {'\n'}
                【コメント】
              </Text>
              <TextInput
                {...this.props}
                multiline={true}
                onChangeText={text => {
                  this.setState({
                    comment: text
                  })
                }}
                onContentSizeChange={event => {
                  this.setState({
                    height: event.nativeEvent.contentSize.height
                  })
                }}
                style={[
                  styles.default,
                  { height: Math.max(35, this.state.height) }
                ]}
                value={this.state.comment}
                ref={component => (this._textinput = component)}
                editable={!this.state.checked}
                underlineColorAndroid="transparent"
              />
              <Button
                title="save"
                icon={{ name: 'sign-in', type: 'font-awesome' }}
                onPress={() => this.handleSubmitCheck()}
              />
              <Modal
                visible={this.state.modalVisible}
                animationType={'slide'}
                onRequestClose={() => this.closeModal()}
              //transparent={true}
              >
                <View style={styles.modal_style}>
                  <View style={{ flex: 1 }} />
                  <Card title="確認ダイアログ" style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>
                      入力情報を登録しますか？
                    </Text>
                  </Card>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        disabled={this.state.loadFlg}
                        onPress={() => this.handleSubmit()}
                        title="YES"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        disabled={this.state.loadFlg}
                        onPress={() => this.closeModal()}
                        title="NO"
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </Modal>
              <Modal
                visible={this.state.modalVisible2}
                animationType={'slide'}
                onRequestClose={() => this.closeModal2()}
              //transparent={true}
              >
                <View style={styles.modal_style}>
                  <View style={{ flex: 1 }} />
                  <Card title="確認ダイアログ" style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>
                      未入力の項目について入力してください
                    </Text>
                  </Card>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        onPress={() => this.closeModal2()}
                        title="CLOSE"
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </Modal>
              <Modal
                visible={this.state.modalVisible3}
                animationType={'slide'}
                onRequestClose={() => this.closeModal3()}
              //transparent={true}
              >
                <View style={styles.modal_style}>
                  <View style={{ flex: 1 }} />
                  <Card title="エラー" style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>不正なログインです</Text>
                  </Card>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        onPress={() => this.closeModal3()}
                        title="CLOSE"
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </Modal>
              <View style={{ height: 80 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }

  _handleKeyboardWillShow() {
    const responder = this._scrollview.getScrollResponder()
    responder.scrollResponderScrollNativeHandleToKeyboard(
      ReactNative.findNodeHandle(this._textinput),
      100,
      true
    )
  }
}

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1
  },
  header: {},
  modal_style: {
    flex: 1
  }
})
