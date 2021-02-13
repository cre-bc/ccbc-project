import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import DraftsIcon from '@material-ui/icons/Drafts'
import StarIcon from '@material-ui/icons/Star'
import SendIcon from '@material-ui/icons/Send'
import MailIcon from '@material-ui/icons/Mail'
import DeleteIcon from '@material-ui/icons/Delete'
import ReportIcon from '@material-ui/icons/Report'
import Avatar from '@material-ui/core/Avatar'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'

export const systemName = 'Harvest'
// export const restUrl = 'http://localhost:3001/'
// export const restUrl = 'http://118.27.23.20:3001/'
// export const restUrl = 'https://creharvest.tk:3001/'
// export const restUrl = 'https://cre-harvest.tk:3001/'
// export const restUrl = 'https://creharvest.ml:3001/'
const restdomain = require('../common/constans.js').restdomain
export const restUrl = restdomain + '/'

export const images = [
  {
    url: '/images/shain_kanri.png',
    title: '社員管理',
    width: '33%',
    path: '/'
  },
  {
    url: '/images/senkyo_kanri.png',
    title: '選挙管理',
    width: '34%',
    path: '/'
  },
  {
    url: '/images/coin_shokai.png',
    title: 'コイン照会',
    width: '33%',
    path: '/'
  }
]

export const images2 = [
  {
    url: '/images/senkyo.png',
    title: '投票',
    width: '33%',
    path: '/'
  },
  {
    url: '/images/tohyo_kekka.png',
    title: '投票結果',
    width: '34%',
    path: '/'
  },
  {
    url: '/images/zoyo.png',
    title: 'コイン贈与',
    width: '33%',
    path: '/'
  }
]

export const titleItems = (
  <div
    style={{
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      width: '100%',
      /* 左右中央寄せ */
      webkitBoxPack: 'center',
      msFlexPack: 'center',
      justifyContent: 'center'
    }}
  >
    <img src="/images/HARVEST5.png" />
    {/* <Avatar src="/images/cvircy.png" />
    <Typography
      variant="title"
      color="inherit"
      style={{
        color: 'white',
        fontSize: 'xx-large',
        fontWeight: 'bold',
        marginLeft: 10
      }}
      noWrap
    >
      {systemName}
    </Typography> */}
  </div>
)

export const titleItems2 = (
  <div
    style={{
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      width: '100%',
      /* 左右中央寄せ */
      webkitBoxPack: 'center',
      msFlexPack: 'center',
      justifyContent: 'center'
    }}
  >
    <img src="/images/ComComCoin_logo_04.png" width="25%" height="25%" />
    {/* <Avatar src="/images/cvircy.png" />
    <Typography
      variant="title"
      color="inherit"
      style={{
        color: 'white',
        fontSize: 'xx-large',
        fontWeight: 'bold',
        marginLeft: 10
      }}
      noWrap
    >
      {systemName}
    </Typography> */}
  </div>
)

export var kanriListItems = function () {
  var loginInfos = JSON.parse(sessionStorage.getItem('loginInfo'))
  if (loginInfos !== null) {
    var loginInfo = loginInfos[0]
    if (loginInfo.kengenCd === '0' || loginInfo.kengenCd === '1') {
      return (
        <div>
          <ListItem button component={Link} to="/tohyo_toroku">
            <Avatar alt="shain_kanri" src="/images/senkyo.png" />
            <ListItemText primary="投票" />
          </ListItem>
          <ListItem button component={Link} to="/tohyo_ichiran">
            <Avatar alt="shain_kanri" src="/images/tohyo_kekka.png" />
            <ListItemText primary="投票結果" />
          </ListItem>
          <ListItem button component={Link} to="/coin_zoyo">
            <Avatar alt="shain_kanri" src="/images/zoyo.png" />
            <ListItemText primary="コイン贈与" />
          </ListItem>
          <ListItem button component={Link} to="/coin_shokai">
            <Avatar alt="shain_kanri" src="/images/coin_shokai.png" />
            <ListItemText primary="コイン照会" />
          </ListItem>
          <ListItem button component={Link} to="/shain_kensaku">
            <Avatar alt="shain_kanri" src="/images/shain_kanri.png" />
            <ListItemText primary="社員管理" />
          </ListItem>
          <ListItem button component={Link} to="/senkyo_kanri">
            <Avatar alt="shain_kanri" src="/images/senkyo_kanri.png" />
            <ListItemText primary="選挙管理" />
          </ListItem>
        </div>
      )
    } else {
      return (
        <div>
          <ListItem button component={Link} to="/tohyo_toroku">
            <Avatar alt="shain_kanri" src="/images/senkyo.png" />
            <ListItemText primary="投票" />
          </ListItem>
          <ListItem button component={Link} to="/tohyo_ichiran">
            <Avatar alt="shain_kanri" src="/images/tohyo_kekka.png" />
            <ListItemText primary="投票結果" />
          </ListItem>
          <ListItem button component={Link} to="/coin_zoyo">
            <Avatar alt="shain_kanri" src="/images/zoyo.png" />
            <ListItemText primary="コイン贈与" />
          </ListItem>
          <ListItem button component={Link} to="/coin_shokai">
            <Avatar alt="shain_kanri" src="/images/coin_shokai.png" />
            <ListItemText primary="コイン照会" />
          </ListItem>
        </div>
      )
    }
  }
}

export var comKanriListItems = function () {
  var loginInfos = JSON.parse(sessionStorage.getItem('loginInfo'))
  if (loginInfos !== null) {
    var loginInfo = loginInfos[0]
    if (loginInfo.kengenCd === '0' || loginInfo.kengenCd === '1') {
      return (
        <div>
          <ListItem button component={Link} to="/com_coin_shokai">
            <img src="/images/com_coin_shokai.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_coin_shokai.png" /> */}
            <ListItemText primary="コイン照会" />
          </ListItem>
          <ListItem button component={Link} to="/article">
            <img src="/images/com_kiji.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_oshirase_mente.png" /> */}
            <ListItemText primary="記事投稿" />
          </ListItem>
          <ListItem button component={Link} to="/com_coin_shojicoin">
            <img src="/images/com_coin_ichiran.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_oshirase_mente.png" /> */}
            <ListItemText primary="所持コイン一覧" />
          </ListItem>
          <ListItem button component={Link} to="/com_oshirase_mente">
            <img src="/images/com_oshirase_mente2.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_oshirase_mente.png" /> */}
            <ListItemText primary="お知らせメンテナンス" />
          </ListItem>
          <ListItem button component={Link} to="/com_kokoku_mente">
            <img src="/images/com_kokoku_mente2.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_kokoku_mente.png" /> */}
            <ListItemText primary="広告メンテナンス" />
          </ListItem>
          <ListItem button component={Link} to="/com_shohin_mente">
            <img src="/images/com_shohin_mente4.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_shohin_mente3.png" /> */}
            <ListItemText primary="商品メンテナンス" />
          </ListItem>
        </div>
      )
    } else {
      return (
        <div>
          <ListItem button component={Link} to="/com_coin_shokai">
            <img src="/images/com_coin_shokai.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_coin_shokai.png" /> */}
            <ListItemText primary="コイン照会" />
          </ListItem>
          <ListItem button component={Link} to="/article">
            <img src="/images/com_kiji.png" width="40" />
            {/* <Avatar alt="shain_kanri" src="/images/com_oshirase_mente.png" /> */}
            <ListItemText primary="記事投稿" />
          </ListItem>
        </div>
      )
    }
  }
}

export const ippanListItems = (
  <div>
    <ListItem button component={Link} to="/tohyo_toroku">
      <Avatar alt="shain_kanri" src="/images/senkyo.png" />
      <ListItemText primary="投票" />
    </ListItem>
    <ListItem button component={Link} to="/tohyo_ichiran">
      <Avatar alt="shain_kanri" src="/images/tohyo_kekka.png" />
      <ListItemText primary="投票結果" />
    </ListItem>
    <ListItem button component={Link} to="/coin_zoyo">
      <Avatar alt="shain_kanri" src="/images/zoyo.png" />
      <ListItemText primary="コイン贈与" />
    </ListItem>
    <ListItem button component={Link} to="/coin_shokai">
      <Avatar alt="shain_kanri" src="/images/coin_shokai.png" />
      <ListItemText primary="コイン照会" />
    </ListItem>
  </div>
)

export const kojiListItems = (
  <div>
    <ListItem button component={Link} to="/menu">
      <Avatar alt="shain_kanri" src="/images/koji.png" />
      <ListItemText primary="画面モック" />
    </ListItem>
  </div>
)

export const mailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <InboxIcon />
      </ListItemIcon>
      <ListItemText primary="Inbox" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <StarIcon />
      </ListItemIcon>
      <ListItemText primary="Starred" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <SendIcon />
      </ListItemIcon>
      <ListItemText primary="Send mail" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <DraftsIcon />
      </ListItemIcon>
      <ListItemText primary="Drafts" />
    </ListItem>
  </div>
)

export const otherMailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <MailIcon />
      </ListItemIcon>
      <ListItemText primary="All mail" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary="Trash" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ReportIcon />
      </ListItemIcon>
      <ListItemText primary="Spam" />
    </ListItem>
  </div>
)

export const documentHelp = (
  <div>
    <div>①資料全体を通して統一感があった。</div>
    <div>②「見やすい」「分かりやすい」「理解しやすい」資料になっていた。</div>
    <div>③話の流れを表現した構成で資料が作られていた。</div>
    <div>④量・質が適当だった。</div>
    <div>⑤定量的・定性的な観点を意識した資料になっていた。</div>
    <div>等</div>
  </div>
)

export const presentationHelp = (
  <div>
    <div>①人前に立っても、臆せずに、落ち着いて発表していた。</div>
    <div>②質問などの突発事態が発生しても、臨機応変な対応が行えていた。</div>
    <div>
      ③理解しやすい、聞きやすい内容だった（メリハリがあって、間の取り方が適切。
    </div>
    <div>　発表の構成（導入・本論・終幕　等）が分かりやすい等）。</div>
    <div>
      ④適切な時間で効率よく言いたい事が伝わるわかりやすい説明ができていた。
    </div>
    <div>等</div>
  </div>
)

export const expressionHelp = (
  <div>
    <div>①専門用語を使いすぎず、わかりやすい表現をしていた。</div>
    <div>②表情に配慮していた。（ノンバーバルスキル）</div>
    <div>
      ③声の大きさ、質、イントネーションに配慮していた。（ノンバーバルスキル）
    </div>
    <div>
      ④ジェスチャー等を交えた動作による状況説明を配慮していた。（ノンバーバルスキル）
    </div>
    <div>等</div>
  </div>
)

export const influenceHelp = (
  <div>
    <div>①発表を聞いた後、行動したいと感じた。</div>
    <div>②発表を聞いた後、インスピレーションを得た。</div>
    <div>③資料の構成、表現を手本にしたい、真似したいと感じた。</div>
    <div>等</div>
  </div>
)

export const breakthroughHelp = (
  <div>
    <div>①過去の自分自身を一歩でも半歩でも超えていた。</div>
    <div>②前例のないことにチャレンジしていた。</div>
    <div>③苦手を克服する、得意なことを更に伸ばす取り組みをしていた。</div>
    <div>等</div>
  </div>
)
