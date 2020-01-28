import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  AsyncStorage,
  Image
} from 'react-native'
import { Button, FormLabel, FormInput, Card } from 'react-native-elements'

const restdomain = require('./common/constans.js').restdomain

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: '',
      passwordInput: '',
      bc_account: '',
      image_file_nm: '',
      shimei: '',
      kengen_cd: '',
      msg: '',
      saveFlg: false,
      group_id: '',
      db_name: '',
      bc_addr: ''
    }
  }

  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    this.removeLoginInfo()

    var groupInfo = await this.getGroupInfo()

    this.setState({ saveFlg: groupInfo['saveFlg'] })
    this.setState({ group_id: groupInfo['group_id'] })
    this.setState({ db_name: groupInfo['db_name'] })
    this.setState({ bc_addr: groupInfo['bc_addr'] })
  }

  getGroupInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('groupInfo'))
    } catch (error) {
      return
    }
  }

  removeLoginInfo = async () => {
    try {
      await AsyncStorage.removeItem('loginInfo')
    } catch (error) {
      return
    }
  }

  setLoginInfo = async loginInfo => {
    try {
      await AsyncStorage.setItem('loginInfo', loginInfo)
    } catch (error) {
      //alert(error)
      return
    }
  }

  onPressButton = () => {
    fetch(restdomain + '/login/find', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function (response) {
        return response.json()
      })
      .then(
        function (json) {
          if (json.status) {
            // 結果が取得できない場合は終了
            if (typeof json.data === 'undefined') {
              return
            }
            var resList = json.data[0]
            let loginInfo = {
              userid: this.state.id,
              password: this.state.passwordInput,
              tShainPk: resList.t_shain_pk,
              imageFileName: resList.image_file_nm,
              bcAccount: resList.bc_account,
              shimei: resList.shimei,
              kengenCd: resList.kengen_cd,
              tokenId: json.token
            }
            this.setLoginInfo(JSON.stringify(loginInfo))

            this.props.navigation.navigate('Home')
          } else {
            this.setState({
              msg: 'ユーザ名またはパスワードを確認してください'
            })
            return
          }
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  onPressButton2 = () => {
    this.props.navigation.navigate('MenuPh2')
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('./../images/title2.jpg')}
          style={styles.backgroud_image}
        >
          <View
            style={{
              height: 30,
              minWidth: 100,
              marginTop: 100,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View>
              <Image
                style={{
                  height: 40,
                  width: 350
                }}
                resizeMode="contain"
                source={require('./../images/ComComCoin_logo.png')}
              />
            </View>
          </View>
          <Card>
            <View>
              <FormLabel>ID</FormLabel>
              <FormInput
                onChangeText={text => this.setState({ id: text })}
                value={this.state.id}
              />
              <FormLabel>Password</FormLabel>
              <FormInput
                onChangeText={text => this.setState({ passwordInput: text })}
                value={this.state.passwordInput}
                secureTextEntry={true}
              />
              <Button
                title="login"
                onPress={this.onPressButton}
                icon={{ name: 'sign-in', type: 'font-awesome' }}
                buttonStyle={{
                  borderColor: 'transparent',
                  borderWidth: 0,
                  borderRadius: 5
                }}
              />
              <Text style={{ color: 'red' }}>{this.state.msg}</Text>
            </View>
            <View>
              <Text style={{ textAlign: 'right' }}>
                ※ID、パスワード紛失時は管理者に連絡してください
              </Text>
            </View>
          </Card>
          {/* <View>
            <Text style={{ color: '#FFFFFF', textAlign: 'right' }}>
              Copyright © 2018 Creative Consultant Co., Ltd
            </Text>
          </View> */}
          {/* <Button
            title="フェーズ2画面モックアップ"
            onPress={this.onPressButton2}
            icon={{ name: 'sign-in', type: 'font-awesome' }}
          /> */}
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  backgroud_image: {
    width: '100%',
    height: '100%'
  }
})
