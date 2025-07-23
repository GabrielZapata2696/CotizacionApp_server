'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      documento: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('admin', 'user', 'premium'),
        allowNull: false,
        defaultValue: 'user'
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
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fechaNacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      consultasSemanales: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      limiteConsultas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50
      },
      ultimaConsulta: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      resetPasswordExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('Usuarios', ['email']);
    await queryInterface.addIndex('Usuarios', ['username']);
    await queryInterface.addIndex('Usuarios', ['documento']);
    await queryInterface.addIndex('Usuarios', ['paisId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuarios');
  }
};
