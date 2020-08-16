const Sequelize = require('sequelize')

exports.sequelize = new Sequelize(
  process.env.CCBC_DATABASE_URL_HARVEST,
  {
    dialect: 'postgres',
    operatorsAliases: false,
    timezone: '+09:00'
  }
)

exports.sequelize2 = new Sequelize(
  process.env.CCBC_DATABASE_URL_HARVEST_GROUP,
  {
    dialect: 'postgres',
    operatorsAliases: false,
    timezone: '+09:00'
  }
)

exports.sequelize3 = function(db_name) {
  console.log('DBInfo:' + process.env.CCBC_DATABASE_URL + db_name)
  return new Sequelize(
    process.env.CCBC_DATABASE_URL + db_name,
    {
      dialect: 'postgres',
      operatorsAliases: false,
      timezone: '+09:00'
    }
  )
}

exports.sequelizeDB = function(req) {
  var db
  if (req.body.db_name != null && req.body.db_name != '') {
    db = this.sequelize3(req.body.db_name)
  } else {
    db = this.sequelize
  }
  return db
}