import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/database';

export class Marca extends Model {
  public id!: number;
  public nombre!: string;
  public descripcion!: string;
  public estado!: number;
  public fechaCreacion!: Date;
  public fechaActualizacion!: Date;

  static associate() {
    // This will be called when associations are set up
  }
}

Marca.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    descripcion: {
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
    fechaActualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Marca',
    tableName: 'marcas',
    timestamps: false,
  }
);

Marca.associate();
