import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MetalAttributes {
  id: number;
  metal: string;
  simbolo: string;
  unidad: string;
  estado: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MetalCreationAttributes extends Optional<MetalAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Metal extends Model<MetalAttributes, MetalCreationAttributes> implements MetalAttributes {
  public id!: number;
  public metal!: string;
  public simbolo!: string;
  public unidad!: string;
  public estado!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Metal.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    metal: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    simbolo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 10],
      },
    },
    unidad: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Partes por millón',
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
    modelName: 'Metal',
    tableName: 'metales',
    timestamps: false,
    indexes: [
      {
        fields: ['metal'],
      },
      {
        fields: ['simbolo'],
      },
      {
        fields: ['estado'],
      },
    ],
  }
);

export { Metal, MetalAttributes, MetalCreationAttributes };
