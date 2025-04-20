module.exports = (sequelize, DataTypes) => {
    const Banners = sequelize.define('banners', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sequence: {
            type: DataTypes.INTEGER
        },
        banner_type: {
            type: DataTypes.DOUBLE,
        },
        image: {
            type: DataTypes.STRING
        },
        offer_id: {
            type: DataTypes.INTEGER
        },
        series_id: {
            type: DataTypes.INTEGER
        },
        fixture_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.INTEGER,
        },
    })

    return Banners
}