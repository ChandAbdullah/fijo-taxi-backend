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
      addressWithCityAndPostcode: type.STRING,     
      gender: type.STRING,   
      profilePhoto: type.STRING,   
    });
  };





