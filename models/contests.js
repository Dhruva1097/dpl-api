module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define("contests", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
    },
    admin_commision: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    winning_amount: {
      type: DataTypes.INTEGER,
    },
    contest_size: {
      type: DataTypes.INTEGER,
    },
    min_contest_size: {
      type: DataTypes.INTEGER,
    },
    contest_type: {
      type: DataTypes.INTEGER,
    },
    invite_code: {
      type: DataTypes.STRING,
    },
    price_breakup: {
      type: DataTypes.INTEGER,
    },
    entry_fee: {
      type: DataTypes.INTEGER,
    },
    confirmed_winning: {
      type: DataTypes.STRING,
    },
    multiple_team: {
      type: DataTypes.INTEGER,
    },
    auto_create: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
    },
  });

  return Contest;
};
