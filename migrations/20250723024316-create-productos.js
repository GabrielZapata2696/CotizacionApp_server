'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Productos', {
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
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
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
      peso: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        comment: 'Weight in grams'
      },
      pureza: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Purity percentage (0-100)'
      },
      quilates: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Karat value for gold (0-24)'
      },
      categoria: {
        type: Sequelize.ENUM('joyeria', 'lingote', 'moneda', 'industrial', 'otro'),
        allowNull: false,
        defaultValue: 'otro'
      },
      forma: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Shape or form of the product'
      },
      dimensiones: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Product dimensions {length, width, height, diameter}'
      },
      precioBase: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Base price in USD'
      },
      margenGanancia: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Profit margin percentage'
      },
      stockMinimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stockActual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      unidadMedida: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'g'
      },
      imagen: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Product image URL'
      },
      certificado: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Certificate document URL'
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fechaCreacion: {
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
    await queryInterface.addIndex('Productos', ['codigo']);
    await queryInterface.addIndex('Productos', ['metalId']);
    await queryInterface.addIndex('Productos', ['empresaId']);
    await queryInterface.addIndex('Productos', ['categoria']);
    await queryInterface.addIndex('Productos', ['estado']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Productos');
  }
};
