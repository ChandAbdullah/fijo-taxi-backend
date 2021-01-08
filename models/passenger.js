module.exports = (sequelize, type) => {
  return sequelize.define("passenger", {
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
    phoneNumber: type.STRING,
    address: type.STRING,
    postalCode: type.STRING,
    city: type.STRING,
    gender: type.STRING,
    profilePhoto: type.STRING,
    currentLat: type.STRING,
    currentLng: type.STRING,
    passengerAvailablity: {
      type: type.BOOLEAN,
      defaultValue: true
    },
    isLogedIn: {
      type: type.BOOLEAN,
      defaultValue: false
    },
  });
};




