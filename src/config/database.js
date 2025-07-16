const { Sequelize } = require('sequelize')

let uri = process.env.ENV_APP === "DEV" ? process.env.DB_URI : process.env.PROD_DB_URI

const sequelize = new Sequelize(uri, {
    dialect: 'postgres',
    database:"agri_db",
    define: {
        freezeTableName: true
    },
    logging: false,
    timezone: '+05:30'
})

const initConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log('Connection has been established successfully.')

        await sequelize.sync({
            alter: true
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}


module.exports = sequelize
module.exports.initConnection = initConnection