const express = require("express");

const router = express.Router();

const db = require("./common/pg_helper.js");

const query = (sql, params, res) => {
  db.query(sql, params, (err, datas) => {
    if (err) {
      console.log(`failed...${err}`);
      res.status(400).send(`エラーが発生しました<br />${err}`);
      return;
    }
    res.json({ status: true, data: datas });
  });
};

router.post("/makeKenegenList", (req, res) => {
  const params = [];
  const sql = "select kengen_cd, kengen_nm from m_kengen order by kengen_cd ";
  query(sql, params, res);
});

router.post("/find", (req, res) => {
  const params = [];
  var sql =
    "select t_shain.t_shain_pk, t_shain.user_id, t_shain.shimei, t_shain.image_file_nm, t_shain.kengen_cd, m_kengen.kengen_nm, t_shain.bc_account, t_shain.shimei_kana from t_shain inner join m_kengen on t_shain.kengen_cd = m_kengen.kengen_cd where t_shain.delete_flg = '0' ";
  if (req.body.election != "") {
    sql =
      sql +
      "and (t_shain.shimei = '" +
      req.body.election +
      "' or t_shain.shimei_kana = '" +
      req.body.election +
      "')";
  }
  if (req.body.kengen != "") {
    sql = sql + "and t_shain.kengen_cd = '" + req.body.kengen + "'";
  }
  sql =
    sql + " order by t_shain.kengen_cd, convert_to(t_shain.shimei_kana,'UTF8')";

  query(sql, params, res);
});

module.exports = router;
