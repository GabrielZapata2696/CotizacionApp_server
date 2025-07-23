'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Formulas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      empresaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Metales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      formula: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Mathematical formula for price calculation'
      },
      parametros: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Formula parameters and constants'
      },
      tipoFormula: {
        type: Sequelize.ENUM('simple', 'compuesta', 'personalizada'),
        allowNull: false,
        defaultValue: 'simple'
      },
      activa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      creadaPor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('Formulas', ['empresaId']);
    await queryInterface.addIndex('Formulas', ['metalId']);
    await queryInterface.addIndex('Formulas', ['activa']);
    await queryInterface.addIndex('Formulas', ['creadaPor']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Formulas');
  }
};