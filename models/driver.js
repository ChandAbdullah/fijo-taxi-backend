module.exports = (sequelize, type) => {
  return sequelize.define("driver", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      required: true
    },
    firstName: type.STRING,
    lastName: type.STRING,
    email: type.STRING,
    password: type.STRING,
    gender: type.STRING,
    driverPhoto: type.STRING,
    phoneNumber: type.STRING,
    address: type.STRING,
    postalCode: type.STRING,
    city: type.STRING,
    nie_Dnle: type.STRING,
    nie_Dnle_FrontPic: type.STRING,
    nie_Dnle_BackPic: type.STRING,
    nationality: type.STRING,
    accountNumber: type.STRING,
    currentLat: type.STRING,
    currentLng: type.STRING,
    rating_no: {
      type: type.DOUBLE,
      defaultValue: 0
    },
    rating: {
      type: type.DOUBLE,
      defaultValue: 0
    },
    balance: {
      type: type.INTEGER,
      defaultValue: 0
    },
    viacash: {
      type: type.INTEGER,
      defaultValue: 0
    },
    viacard: {
      type: type.INTEGER,
      defaultValue: 0
    },
    isApproved: {
      type: type.BOOLEAN,
      defaultValue: false
    },
    diverAvailablity: {
      type: type.BOOLEAN,
      defaultValue: true
    },
    isWithdrawRequested: {
      type: type.BOOLEAN,
      defaultValue: false
    },
    isLogedIn: {
      type: type.BOOLEAN,
      defaultValue: false
    },
  });
};
