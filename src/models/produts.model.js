// src/models/product.model.js

const { Sequelize, DataTypes } = require('sequelize');
const database = require('../config/database'); // Ajusta la ruta según tu proyecto

const Product = database.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

}, {
  tableName: 'products',     
  timestamps: true,          
  underscored: true        
});

module.exports = Product;
