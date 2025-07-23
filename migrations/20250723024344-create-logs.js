'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      accion: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entidad: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Entity affected (Usuario, Producto, etc.)'
      },
      entidadId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the affected entity'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      datosAnteriores: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Previous data state'
      },
      datosNuevos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'New data state'
      },
      nivel: {
        type: Sequelize.ENUM('info', 'warning', 'error', 'debug'),
        allowNull: false,
        defaultValue: 'info'
      },
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'Client IP address'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Client user agent'
      },
      fechaLog: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.addIndex('Logs', ['usuarioId']);
    await queryInterface.addIndex('Logs', ['entidad', 'entidadId']);
    await queryInterface.addIndex('Logs', ['fechaLog']);
    await queryInterface.addIndex('Logs', ['nivel']);
    await queryInterface.addIndex('Logs', ['accion']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Logs');
  }
};