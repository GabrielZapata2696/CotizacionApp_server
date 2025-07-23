import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PaisAttributes {
  id: number;
  pais: string;
  codigo: string;
  estado: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaisCreationAttributes extends Optional<PaisAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Pais extends Model<PaisAttributes, PaisCreationAttributes> implements PaisAttributes {
  public id!: number;
  public pais!: string;
  public codigo!: string;
  public estado!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pais.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    codigo: {
      type: DataTypes.STRING(5),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 5],
        isUppercase: true,
      },
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[1, 2]], // 1 = activo, 2 = inactivo
      },
    },
  },
  {
    sequelize,
    modelName: 'Pais',
    tableName: 'paises',
    timestamps: false,
    indexes: [
      {
        fields: ['codigo'],
        unique: true,
      },
      {
        fields: ['pais'],
      },
      {
        fields: ['estado'],
      },
    ],
  }
);

export { Pais, PaisAttributes, PaisCreationAttributes };
