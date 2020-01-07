import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  AsyncStorage,
  Text,
  ScrollView,
  TextInput
} from 'react-native'
import {
  Header,
  Button,
  Icon,
  Avatar,
  Card,
  ListItem,
  FormInput,
  Divider
} from 'react-native-elements'
import { Table } from 'react-native-table-component'
import InputNumberStyles from 'rmc-input-number/lib/styles'
import InputNumber from 'rmc-input-number'

export default class ChatMsgForm extends Component {
  state = {
    open: false,
    open2: false,
    anchor: 'left',
    activeStep1: {},
    activeStep2: {},
    activeStep3: {},
    activeStep4: {},
    activeStep5: {},
    completed: {},
    comment: '',
    coin: 0,
    tohyoCoin: 0,
    headList: [],
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    configCoin: 0,
    text: ''
  }
  constructor(props) {
    super(props)
    this.state = {}
  }
  /** コンポーネントのマウント時処理 */
  async componentWillMount() {}

  onPressLogoutButton = () => {
    this.props.navigation.navigate('Login')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }
  onPressLoginGroupButton = () => {
    this.props.navigation.navigate('LoginGroup')
  }
  onPressChatButton = () => {
    this.props.navigation.navigate('Chat')
  }
  onPressChatSelectButton = () => {
    this.props.navigation.navigate('ChatSelect')
  }
  onPressHomeButton = () => {
    this.props.navigation.navigate('Home')
  }
  render() {
    const { name, email } = this.state
    const footerStyle = {
      ...StyleSheet.flatten(styles.footerOverlay),
      width: this.state.footerWidth
    }
    return (
      <View style={styles.container}>
        <Header
          leftComponent={
            <Icon
              name={'chevron-left'}
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
                <Text
                  style={{
                    fontSize: 24,
                    color: '#FFFFFF',
                    textAlign: 'center'
                  }}
                >
                  コイン送付
                </Text>
              </View>
            </View>
          }
          backgroundColor="#ff5622"
        />
        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'nowrap'
            }}
          >
            <View
              style={{
                flexDirection: 'column',
                flexWrap: 'nowrap'
              }}
            >
              <Card>
                <Avatar
                  large
                  rounded
                  // source={require('./../images/man6.jpg')}
                  //activeOpacity={0.7}
                  containerStyle={{ marginLeft: 10, marginRight: 10 }}
                />
                <Text style={{ fontSize: 20, textAlign: 'center' }}>
                  瀬川　大和
                </Text>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>
                  11,200コイン
                </Text>
              </Card>
            </View>
            <Text
              style={{
                fontSize: 32,
                textAlign: 'center',
                flex: 3,
                marginTop: 120
              }}
            >
              >>
            </Text>
            <Card>
              <Avatar
                large
                rounded
                // source={require('./../images/woman4.jpg')}
                //activeOpacity={0.7}
                containerStyle={{ marginLeft: 10, marginRight: 10 }}
              />
              <Text style={{ fontSize: 20, textAlign: 'center' }}>
                島崎　杏
              </Text>
            </Card>
          </View>

          <Text
            style={{
              fontSize: 16,
              color: 'blue',
              textAlign: 'left',
              marginLeft: 54
            }}
          />
          <Text style={{ fontSize: 20, marginLeft: 16, marginTop: 20 }}>
            コイン
          </Text>
          <Card>
            <InputNumber
              min={0}
              max={10000}
              keyboardType="numeric"
              value={300}
              styles={InputNumberStyles}
            />
          </Card>

          <Text
            style={{
              fontSize: 16,
              color: 'blue',
              textAlign: 'left',
              marginLeft: 54
            }}
          />
          <Text style={{ fontSize: 20, marginLeft: 16, marginTop: 20 }}>
            コメント
          </Text>
          <Card>
            <TextInput
              {...this.props}
              multiline={true}
              onChangeText={text => {
                this.setState({
                  comment: text
                })
              }}
              style={[
                styles.default,
                { height: Math.max(35, this.state.height), fontSize: 20 }
              ]}
              value={
                'この前は仕事の相談に乗っていただきありがとうございました。\n先輩と会話したことによって、ずっと頭の中にいたモヤモヤが解消されました！！\n感謝の気持ちとしてコインを送らせていただきます。'
              }
              ref={component => (this._textinput = component)}
              underlineColorAndroid="transparent"
            />
          </Card>
          <Text
            style={{
              fontSize: 16,
              color: 'blue',
              textAlign: 'left',
              marginLeft: 54
            }}
          />
          <Button
            title="save"
            icon={{ name: 'sign-in', type: 'font-awesome' }}
          />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  header: {},
  menu_item: {
    flexDirection: 'row',
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30
  },
  menu_icon: {
    width: 25,
    height: 25
  },
  menu_button: {},
  menu_icon_view: {},
  menu_button_view: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10
  }
})
