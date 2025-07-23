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
  public telefono!: string;
  public creacion!: Date;
  public empresa!: number;
  public pais!: string;
  public rol!: number;
  public estado!: number;

  static associate() {
    Usuario.belongsTo(Empresa, {
      foreignKey: 'empresa',
      as: 'company',
    });
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
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuario',
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {},
    },
  }
);

Usuario.associate();

