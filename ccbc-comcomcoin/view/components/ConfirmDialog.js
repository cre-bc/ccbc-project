import React, { Component } from 'react';
import { Modal, View, Text } from 'react-native';
import { Button, Card } from 'react-native-elements'

class ConfirmDialog extends Component {
	/**
	 * 親コンポーネントで設定する値
	 * ・modalVisible：ダイアログを表示したい場合にTrueをセット（stateで管理すると良い）
	 * ・message：ダイアログに表示するメッセージ
	 * ・handleYes：YES押下時に実行したいイベント
	 * ・handleNo：NO押下時に実行したいイベント
	 * ・handleClose：ボタンを押さずにダイアログを閉じた時に実行したいイベント
	 */
	render() {
		return (
			<Modal
				visible={this.props.modalVisible}
				animationType={'slide'}
				onRequestClose={() => this.props.handleClose()}
			>
				<View style={{ flex: 1 }}>
					<View style={{ flex: 1 }} />
					<Card title="確認ダイアログ" style={{ flex: 1 }}>
						<Text style={{ fontSize: 18 }}>{this.props.message}</Text>
					</Card>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<View style={{ flex: 1 }}>
							<Button
								onPress={() => this.props.handleYes()}
								title="はい"
							/>
						</View>
						<View style={{ flex: 1 }}>
							<Button
								onPress={() => this.props.handleNo()}
								title="いいえ"
							/>
						</View>
					</View>
					<View style={{ flex: 1 }} />
				</View>
			</Modal>
		)
	}
}

export default ConfirmDialog
