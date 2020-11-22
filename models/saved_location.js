module.exports = (sequelize, type) => {
    return sequelize.define("savedlocation", {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        required: true
      },      
      routePath: type.STRING,
      routeTitle: type.STRING,
    });
  };

  