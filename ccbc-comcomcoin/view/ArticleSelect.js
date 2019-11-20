import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native'
import { Icon } from 'react-native-elements'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain

export default class ArticleSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login_shain_pk: null,
      categoryList: []
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.setState({ login_shain_pk: 1 })

    // 記事API.記事カテゴリ一覧取得処理の呼び出し
    await fetch(restdomain + '/article/findCategory', {
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
          // 結果が取得できない場合は終了
          if (typeof json.data === 'undefined') {
            return
          }
          // 取得したデータをStateに格納
          this.setState({ categoryList: json.data })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** 記事照会画面へ遷移 */
  onPressCategory = async (selectCategory) => {
    this.props.navigation.navigate('ArticleRefer', {
      mode: "article",
      selectCategory: selectCategory
    })
  }

  render() {
    return (
      <View>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- 記事カテゴリ（繰り返し） -- */}
        <View style={{ marginTop: 20 }} />
        {this.state.categoryList.map((item, i) => {
          return (
            <TouchableHighlight onPress={() => this.onPressCategory(item)} key={i}>
              <View style={styles.articleLine}>
                <View style={styles.articleTitleView}>
                  <Text style={styles.articleTitleText}>{"　　" + item.category_nm}</Text>
                </View>
                {/* 未読マーク */}
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  {(() => {
                    if (item.midoku_cnt > 0) {
                      return (
                        <View style={styles.nonReadMark}>
                          <Text style={styles.nonReadMarkStr}>{'   ' + item.midoku_cnt + '   '}</Text>
                        </View>
                      )
                    }
                  })()}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
                  <Icon name="chevron-right" type="font-awesome" color="white" />
                </View>
              </View>
            </TouchableHighlight>
          )
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  articleLine: {
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#AA0000',
    flexDirection: 'row'
  },
  articleTitleView: {
    flex: 8,
    alignItems: 'center'
  },
  articleTitleText: {
    fontSize: 26,
    color: 'white',
    padding: 10
  },
  nonReadMark: {
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#FF3333',
    borderRadius: 50,
    borderColor: 'white'
  },
  nonReadMarkStr: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5
  }
})
