'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Paises', [
      {
        nombre: 'Colombia',
        codigo: 'COL',
        moneda: 'COP',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Estados Unidos',
        codigo: 'USA',
        moneda: 'USD',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Canadá',
        codigo: 'CAN',
        moneda: 'CAD',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Reino Unido',
        codigo: 'GBR',
        moneda: 'GBP',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'España',
        codigo: 'ESP',
        moneda: 'EUR',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Brasil',
        codigo: 'BRA',
        moneda: 'BRL',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'México',
        codigo: 'MEX',
        moneda: 'MXN',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paises', null, {});
  }
};