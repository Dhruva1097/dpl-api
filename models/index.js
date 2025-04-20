'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Series = require('./series')(sequelize, Sequelize.DataTypes)
db.Users = require('./users')(sequelize, Sequelize.DataTypes)
db.Referral = require('./referral')(sequelize, Sequelize.DataTypes)
db.Fixtures = require('./fixtures')(sequelize, Sequelize.DataTypes)
db.Teams = require('./teams')(sequelize, Sequelize.DataTypes)
db.Match_contest = require('./match_contest')(sequelize, Sequelize.DataTypes)
db.Contest_category = require('./contest_category')(sequelize, Sequelize.DataTypes)
db.Contests = require('./contests')(sequelize, Sequelize.DataTypes)
db.Squads = require('./squads')(sequelize, Sequelize.DataTypes)
db.Upcoming_breakup = require('./upcoming_breakup')(sequelize, Sequelize.DataTypes)
db.Live_breakup = require('./live_breakup')(sequelize, Sequelize.DataTypes)
db.Join_contest = require('./join_contest')(sequelize, Sequelize.DataTypes)
db.Setting = require('./setting')(sequelize, Sequelize.DataTypes)
db.Squads = require('./squads')(sequelize, Sequelize.DataTypes)
db.Lineup = require('./lineup')(sequelize, Sequelize.DataTypes)
db.Performance = require('./playerPerformance')(sequelize, Sequelize.DataTypes)
db.CaptainViceCaptain = require('./userteam_cap_vice')(sequelize, Sequelize.DataTypes)
db.UserTeam = require('./userteam')(sequelize, Sequelize.DataTypes)
db.Scorecard = require('./scorecard')(sequelize, Sequelize.DataTypes)
db.Full_scorecard = require('./full_scorecard')(sequelize, Sequelize.DataTypes)
db.PointSystem = require('./point_system')(sequelize, Sequelize.DataTypes)
db.Pan_aadhar_details = require('./pan_aadhar_details')(sequelize, Sequelize.DataTypes)
db.Bank_details = require('./bank_details')(sequelize, Sequelize.DataTypes)
db.Transaction_type = require('./transaction_type')(sequelize, Sequelize.DataTypes)
db.Transactions = require('./transactions')(sequelize, Sequelize.DataTypes)
db.Groups = require('./groups')(sequelize, Sequelize.DataTypes)
db.Wallet_transaction = require('./wallet_transaction')(sequelize, Sequelize.DataTypes)
db.Withdraw_Request = require('./withdraw_request')(sequelize, Sequelize.DataTypes)
db.Notifications = require('./notifications')(sequelize, Sequelize.DataTypes)
db.Banners = require('./banners')(sequelize, Sequelize.DataTypes)
db.Payment_Response = require('./payment_response')(sequelize, Sequelize.DataTypes)


// contest
db.Contest_category.hasMany(db.Contests, { foreignKey: "category_id" })
db.Contests.belongsTo(db.Contest_category, { foreignKey: "category_id" })


db.Contests.hasMany(db.Match_contest, { foreignKey: "contest_id" })
db.Match_contest.belongsTo(db.Contests, { foreignKey: "contest_id" })

db.Contests.hasMany(db.Upcoming_breakup, { foreignKey: "contest_id" })
db.Upcoming_breakup.belongsTo(db.Contests, { foreignKey: "contest_id" })
db.Live_breakup.belongsTo(db.Contests, { foreignKey: "contest_id" })

db.Contests.hasMany(db.Join_contest, { foreignKey: "contest_id" })
db.Join_contest.belongsTo(db.Contests, { foreignKey: "contest_id" })

db.Fixtures.hasMany(db.Match_contest, { foreignKey: "fixture_id" })
db.Match_contest.belongsTo(db.Fixtures, { foreignKey: "fixture_id" })

db.Fixtures.hasMany(db.Upcoming_breakup, { foreignKey: "fixture_id" })
db.Upcoming_breakup.belongsTo(db.Fixtures, { foreignKey: "fixture_id" })

db.Fixtures.hasMany(db.Live_breakup, { foreignKey: 'fixture_id' })
db.Live_breakup.belongsTo(db.Fixtures, { foreignKey: "fixture_id" })

db.Users.hasMany(db.Join_contest, { foreignKey: "user_id" })
db.Join_contest.belongsTo(db.Users, { foreignKey: "user_id" })

db.CaptainViceCaptain.hasMany(db.Join_contest, { foreignKey: "player_team_id" })
db.Join_contest.belongsTo(db.CaptainViceCaptain, { foreignKey: "player_team_id" })

db.Users.hasMany(db.CaptainViceCaptain, { foreignKey: "user_id" })
db.CaptainViceCaptain.belongsTo(db.Users, { foreignKey: "user_id" })

db.Join_contest.belongsTo(db.Series, { foreignKey: "series_id" })
db.Join_contest.belongsTo(db.Fixtures, { foreignKey: "fixture_id" })

db.Groups.hasMany(db.Join_contest, { 'foreignKey': "group_id" })
db.Join_contest.belongsTo(db.Groups, { 'foreignKey': "group_id" })

////////////////


// Series
db.Series.hasMany(db.Fixtures, { foreignKey: 'series_id' })
db.Fixtures.belongsTo(db.Series, { foreignKey: 'series_id' })

db.Series.hasMany(db.Squads, { foreignKey: 'series_id' })
db.Squads.belongsTo(db.Series, { foreignKey: 'series_id' })

db.Series.hasMany(db.Banners, { foreignKey: 'series_id' })
db.Banners.belongsTo(db.Series, { foreignKey: 'series_id' })
///////////////////

//banners

db.Fixtures.hasMany(db.Banners, { foreignKey: 'fixture_id' })
db.Banners.belongsTo(db.Fixtures, { foreignKey: 'fixture_id' })

db.Series.hasMany(db.Banners, { foreignKey: 'series_id' })
db.Banners.belongsTo(db.Series, { foreignKey: 'series_id' })

///////////////////

// Lineup
db.Squads.hasMany(db.Lineup, { foreignKey: 'player_id' })
db.Lineup.belongsTo(db.Squads, { foreignKey: 'player_id' })
///////////////////

//Performance
db.Squads.hasMany(db.Performance, { foreignKey: 'p_id' })
db.Performance.belongsTo(db.Squads, { foreignKey: 'p_id' })

db.Fixtures.hasMany(db.Performance, { foreignKey: 'm_id' })
db.Performance.belongsTo(db.Fixtures, { foreignKey: 'm_id' })
///////////////////


// UserTeams
db.CaptainViceCaptain.hasMany(db.UserTeam, { foreignKey: 'team_id' })
db.UserTeam.belongsTo(db.CaptainViceCaptain, { foreignKey: 'team_id' })


db.Fixtures.hasMany(db.CaptainViceCaptain, { foreignKey: "match_id" })
db.CaptainViceCaptain.belongsTo(db.Fixtures, { foreignKey: 'match_id' })

db.Squads.hasMany(db.CaptainViceCaptain, { foreignKey: 'captain_id' , sourceKey:'player_id'})
db.CaptainViceCaptain.belongsTo(db.Squads, { foreignKey: 'captain_id', targetKey: 'player_id' })

///////////////////

//Users
db.Users.hasOne(db.Pan_aadhar_details, { foreignKey: "user_id" })
db.Pan_aadhar_details.belongsTo(db.Users, { foreignKey: 'user_id' })

db.Users.hasOne(db.Bank_details, { foreignKey: "user_id" })
db.Bank_details.belongsTo(db.Users, { foreignKey: 'user_id' })

db.Users.hasMany(db.Transactions, { foreignKey: 'user_id' })
db.Transactions.belongsTo(db.Users, { foreignKey: 'user_id' })

db.Users.hasMany(db.Referral, { foreignKey: 'user_id' })
db.Referral.belongsTo(db.Users, { foreignKey: 'user_id' })

db.Users.hasMany(db.Wallet_transaction, { foreignKey: 'user_id' })
db.Wallet_transaction.belongsTo(db.Users, { foreignKey: 'user_id' })

//notifications
db.Users.hasMany(db.Notifications, { foreignKey: 'user_id' })
db.Notifications.belongsTo(db.Users, { foreignKey: 'user_id' })

db.Fixtures.hasMany(db.Notifications, { foreignKey: 'match_id' })
db.Notifications.belongsTo(db.Fixtures, { foreignKey: 'match_id' })
///////////////////


//Transactions
db.Transaction_type.hasMany(db.Transactions, { foreignKey: "trans_type_id" })
db.Transactions.belongsTo(db.Transaction_type, { foreignKey: "trans_type_id" })

module.exports = db;