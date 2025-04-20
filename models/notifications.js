module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define('notifications', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        notification_type: {
            type: DataTypes.INTEGER
        },
        title: {
            type: DataTypes.STRING
        },
        notification: {
            type: DataTypes.STRING
        },
        match_id : {
            type: DataTypes.INTEGER,
            allowNull : true
        },
        date: {
            type: DataTypes.DATE,
        },
        status: {
            type: DataTypes.INTEGER,
        },
        is_send: {
            type: DataTypes.INTEGER,
        }
    })

    return Notifications
}