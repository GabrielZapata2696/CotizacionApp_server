'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Usuarios', [
      {
        documento: '12345678',
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@sitekol.com',
        username: 'admin',
        password: '$2a$12$LkR.Chtj2YoYE4VxjqW97.pxVgYp0X0KKuFirROC.JwUT/JRnY98e',
        rol: 'admin',
        paisId: 1, // Colombia
        telefono: '+57 300 123 4567',
        direccion: 'Bogotá, Colombia',
        fechaNacimiento: '1990-01-01',
        estado: true,
        consultasSemanales: 0,
        limiteConsultas: 1000,
        ultimaConsulta: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', {
      email: 'admin@sitekol.com'
    }, {});
  }
};