'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Metales', [
      {
        nombre: 'Oro',
        simbolo: 'Au',
        codigoApi: 'XAU',
        descripcion: 'Oro puro - Metal precioso más valorado',
        unidadMedida: 'oz',
        densidad: 19.3200,
        pureza: 99.99,
        estado: true,
        esMetalPrecioso: true,
        orden: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Plata',
        simbolo: 'Ag',
        codigoApi: 'XAG',
        descripcion: 'Plata pura - Metal precioso versátil',
        unidadMedida: 'oz',
        densidad: 10.4900,
        pureza: 99.90,
        estado: true,
        esMetalPrecioso: true,
        orden: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Platino',
        simbolo: 'Pt',
        codigoApi: 'XPT',
        descripcion: 'Platino puro - Metal precioso industrial',
        unidadMedida: 'oz',
        densidad: 21.4500,
        pureza: 99.95,
        estado: true,
        esMetalPrecioso: true,
        orden: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Paladio',
        simbolo: 'Pd',
        codigoApi: 'XPD',
        descripcion: 'Paladio puro - Metal precioso catalizador',
        unidadMedida: 'oz',
        densidad: 12.0230,
        pureza: 99.95,
        estado: true,
        esMetalPrecioso: true,
        orden: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Rodio',
        simbolo: 'Rh',
        codigoApi: 'RHODIUM',
        descripcion: 'Rodio puro - Metal precioso extremadamente raro',
        unidadMedida: 'oz',
        densidad: 12.4100,
        pureza: 99.90,
        estado: true,
        esMetalPrecioso: true,
        orden: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Metales', null, {});
  }
};