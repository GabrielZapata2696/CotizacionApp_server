import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ProductoComponenteAttributes {
  id: number;
  id_producto: number;
  id_metal: number;
  cantidad: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductoComponenteCreationAttributes extends Optional<ProductoComponenteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ProductoComponente extends Model<ProductoComponenteAttributes, ProductoComponenteCreationAttributes> implements ProductoComponenteAttributes {
  public id!: number;
  public id_producto!: number;
  public id_metal!: number;
  public cantidad!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductoComponente.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_producto: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id',
      },
    },
    id_metal: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'metales',
        key: 'id',
      },
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
      comment: 'Cantidad en partes por millón (PPM)',
    },
  },
  {
    sequelize,
    modelName: 'ProductoComponente',
    tableName: 'producto_componentes',
    timestamps: false,
    indexes: [
      {
        fields: ['id_producto'],
      },
      {
        fields: ['id_metal'],
      },
      {
        fields: ['id_producto', 'id_metal'],
        unique: true,
      },
    ],
  }
);

export { ProductoComponente, ProductoComponenteAttributes, ProductoComponenteCreationAttributes };
