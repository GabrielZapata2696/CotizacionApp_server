'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Metales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      simbolo: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      codigoApi: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Symbol used in MetalPriceAPI (XAU, XAG, XPD, XPT, etc.)'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      unidadMedida: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'oz' // ounce, gram, kg
      },
      densidad: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Density in g/cm³'
      },
      pureza: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Purity percentage (0-100)'
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      esMetalPrecioso: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Add indexes
    await queryInterface.addIndex('Metales', ['simbolo']);
    await queryInterface.addIndex('Metales', ['codigoApi']);
    await queryInterface.addIndex('Metales', ['estado']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Metales');
  }
};
