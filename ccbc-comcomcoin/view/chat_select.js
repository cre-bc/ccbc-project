import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  AsyncStorage,
  Text,
  ScrollView
} from 'react-native'
import {
  Header,
  Button,
  Icon,
  Avatar,
  Card,
  ListItem
} from 'react-native-elements'

const users = [
  // {
  //   name: '安倍　大翔',
  //   avatar: require('./../images/man1.jpg'),
  //   cnt: 1
  // },
  // {
  //   name: '伊藤　俊介',
  //   avatar: require('./../images/man2.jpg'),
  //   cnt: 9
  // },
  // {
  //   name: '牛込　達也',
  //   avatar: require('./../images/man3.jpg'),
  //   cnt: 0
  // },
  // {
  //   name: '江藤　蓮',
  //   avatar: require('./../images/man4.jpg'),
  //   cnt: 3
  // },
  // {
  //   name: '織田　結月',
  //   avatar: require('./../images/woman1.jpg'),
  //   cnt: 2
  // },
  // {
  //   name: '小川　結愛',
  //   avatar: require('./../images/woman2.jpg'),
  //   cnt: 2
  // },
  // {
  //   name: '佐藤　結菜',
  //   avatar: require('./../images/woman3.jpg'),
  //   cnt: 6
  // },
  // {
  //   name: '島崎　杏',
  //   avatar: require('./../images/woman4.jpg'),
  //   cnt: 2
  // },
  // {
  //   name: '須藤　陽翔',
  //   avatar: require('./../images/man5.jpg'),
  //   cnt: 0
  // },
  // {
  //   name: '瀬川　大和',
  //   avatar: require('./../images/man6.jpg'),
  //   cnt: 0
  // },
  // {
  //   name: '曽我　湊',
  //   avatar: require('./../images/man7.jpg'),
  //   cnt: 1
  // },
  // {
  //   name: '西村　新',
  //   avatar: require('./../images/man8.jpg'),
  //   cnt: 0
  // }
]

export default class ChatSelectForm extends Component {
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
    comment: {},
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
    configCoin: 0
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
  onPressChatMsgButton = () => {
    this.props.navigation.navigate('ChatMsg')
  }
  onPressHomeButton = () => {
    this.props.navigation.navigate('Home')
  }
  render() {
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
                  チャット選択
                </Text>
              </View>
            </View>
          }
          backgroundColor="#ff5622"
          // style={styles.header}
        />
        <ScrollView>
          <Card containerStyle={{ padding: 0 }}>
            {users.map((u, i) => {
              if (u.cnt === 0) {
                return (
                  <ListItem
                    key={i}
                    roundAvatar
                    title={u.name}
                    titleStyle={{ fontSize: 20 }}
                    avatar={u.avatar}
                  />
                )
              } else {
                return (
                  <ListItem
                    key={i}
                    roundAvatar
                    title={u.name}
                    titleStyle={{ fontSize: 20 }}
                    avatar={u.avatar}
                    badge={{
                      value: u.cnt,
                      textStyle: { color: 'orange' }
                    }}
                  />
                )
              }
            })}
          </Card>
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
  menu_item: {
    flexDirection: 'row',
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30
  },
  menu_icon: {
    width: 50,
    height: 50
  },
  menu_button: {},
  menu_icon_view: {},
  menu_button_view: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10
  }
})
