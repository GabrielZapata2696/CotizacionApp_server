'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Empresas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      nit: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      paisId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Paises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      ciudad: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      codigoPostal: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      sitioWeb: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      tipoEmpresa: {
        type: Sequelize.ENUM('joyeria', 'refineria', 'distribuidor', 'minorista', 'otro'),
        allowNull: false,
        defaultValue: 'otro'
      },
      margenGanancia: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Profit margin percentage'
      },
      comisionVenta: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Sales commission percentage'
      },
      descuentoVolumen: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Volume discount percentage'
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fechaRegistro: {
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
    await queryInterface.addIndex('Empresas', ['nit']);
    await queryInterface.addIndex('Empresas', ['paisId']);
    await queryInterface.addIndex('Empresas', ['estado']);
    await queryInterface.addIndex('Empresas', ['tipoEmpresa']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Empresas');
  }
};
