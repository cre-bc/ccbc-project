# ccbc-project

## 環境変数
実行する端末に以下の環境変数を設定する必要があります。
* **CCBC_BC_URL**=http://[BCサーバのIPアドレス]:[ポート]
* **CCBC_BASE_CONTRACT_ADDRESS**=[コントラクトアドレス]
* **CCBC_BC_DOMAIN**=http://[BC-RESTサーバのIPアドレス]:3002
* **CCBC_JIMU_ACCOUNT**=[事務局アカウントのBCアドレス]
* **CCBC_JIMU_PASSWORD**=[事務局アカウントのパスワード]
* **CCBC_JIMU_SHAIN_PK**=[事務局アカウントの社員PK]
* **CCBC_DATABASE_URL_HARVEST**=postgres://[ユーザ]:[パスワード]@[DBサーバのIPアドレス]:[ポート]/[HARVESTのDB名]
* **CCBC_DATABASE_URL_HARVEST_GROUP**=postgres://[ユーザ]:[パスワード]@[DBサーバのIPアドレス]:[ポート]/[HARVEST-GROUPのDB名]
* **CCBC_DATABASE_URL**=postgres://[ユーザ]:[パスワード]@[DBサーバのIPアドレス]:[ポート]/

macの場合  
`echo 'export [環境変数名]=[内容]' >> ~/.bash_profile`

linuxの場合  
`export [環境変数名]=[内容]`
