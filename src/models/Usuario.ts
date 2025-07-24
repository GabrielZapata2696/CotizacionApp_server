import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/database';
import { Empresa } from '@/models/Empresa';

export class Usuario extends Model {
  public id!: number;
  public documento!: string;
  public nombre!: string;
  public apellido!: string;
  public username!: string;
  public password!: string;
  public email!: string;
  public telefono?: string;
  public direccion?: string;
  public fechaNacimiento?: Date;
  public paisId!: number;
  public rol!: string;
  public estado!: boolean;
  public consultasSemanales!: number;
  public limiteConsultas!: number;
  public ultimaConsulta?: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public lastLoginAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate() {
    // TODO: Add associations when needed
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaNacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paisId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'user', 'premium'),
      allowNull: false,
      defaultValue: 'user',
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    consultasSemanales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    limiteConsultas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
    },
    ultimaConsulta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {},
    },
  }
);

Usuario.associate();

