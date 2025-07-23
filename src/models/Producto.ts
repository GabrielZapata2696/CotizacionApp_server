import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/database';
import { Marca } from '@/models/Marca';
import { ProductoComponente } from '@/models/ProductoComponente';

export class Producto extends Model {
  public id!: number;
  public nombre!: string;
  public referencia!: string;
  public referencia2!: string;
  public peso!: number;
  public marca!: number;
  public foto1!: string;
  public foto2!: string;
  public observacion!: string;
  public estado!: number;
  public fechaCreacion!: Date;

  static associate() {
    Producto.belongsTo(Marca, {
      foreignKey: 'marca',
      as: 'brand',
    });
    
    Producto.hasMany(ProductoComponente, {
      foreignKey: 'id_producto',
      as: 'metalCompositions',
    });
  }
}

Producto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referencia2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    peso: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    marca: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    foto1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foto2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Producto',
    tableName: 'productos',
    timestamps: false,
  }
);

Producto.associate();
