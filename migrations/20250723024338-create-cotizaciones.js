'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Cotizaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Quotation number'
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
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
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        comment: 'Quantity requested'
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        comment: 'Unit price at time of quotation'
      },
      precioTotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Total price including margins'
      },
      descuento: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Discount applied'
      },
      impuestos: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Taxes applied'
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      tasaCambio: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1.0000,
        comment: 'Exchange rate applied'
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada', 'vencida'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      fechaCotizacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fechaVencimiento: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Quote expiration date'
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadatos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional quotation metadata'
      },
      formulaUsada: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Formulas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('Cotizaciones', ['numero']);
    await queryInterface.addIndex('Cotizaciones', ['usuarioId']);
    await queryInterface.addIndex('Cotizaciones', ['empresaId']);
    await queryInterface.addIndex('Cotizaciones', ['productoId']);
    await queryInterface.addIndex('Cotizaciones', ['estado']);
    await queryInterface.addIndex('Cotizaciones', ['fechaCotizacion']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Cotizaciones');
  }
};