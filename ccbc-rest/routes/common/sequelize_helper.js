const Sequelize = require('sequelize')

exports.sequelize = new Sequelize(
  process.env.DATABASE_URL_HARVEST,
  {
    dialect: 'postgres',
    operatorsAliases: false,
    timezone: '+09:00'
  }
)

exports.sequelize2 = new Sequelize(
  process.env.DATABASE_URL_HARVEST_GROUP,
  {
    dialect: 'postgres',
    operatorsAliases: false,
    timezone: '+09:00'
  }
)

exports.sequelize3 = function(db_name) {
  console.log('sequelize3')
  console.log('db_name:' + db_name)
  return new Sequelize(
    process.env.DATABASE_URL + '/' + db_name,
    {
      dialect: 'postgres',
      operatorsAliases: false,
      timezone: '+09:00'
    }
  )
}
