'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Tarifas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      metalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Metales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      precio: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        comment: 'Price per ounce in USD'
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      fuente: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Price source (MetalPriceAPI, manual, etc.)'
      },
      tipoTarifa: {
        type: Sequelize.ENUM('spot', 'bid', 'ask', 'average'),
        allowNull: false,
        defaultValue: 'spot'
      },
      fechaCotizacion: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When this price was quoted'
      },
      validoHasta: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When this price expires'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      cambio24h: {
        type: Sequelize.DECIMAL(8, 4),
        allowNull: true,
        comment: '24h price change'
      },
      porcentajeCambio24h: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        comment: '24h price change percentage'
      },
      volumen24h: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: '24h trading volume'
      },
      metadatos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional price metadata'
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
    await queryInterface.addIndex('Tarifas', ['metalId']);
    await queryInterface.addIndex('Tarifas', ['fechaCotizacion']);
    await queryInterface.addIndex('Tarifas', ['activo']);
    await queryInterface.addIndex('Tarifas', ['metalId', 'fechaCotizacion']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Tarifas');
  }
};
