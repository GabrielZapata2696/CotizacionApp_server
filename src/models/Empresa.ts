import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/database';

export class Empresa extends Model {
  public id!: number;
  public nombre!: string;
  public identificacion!: string;
  public porcentaje_pago!: number;
  public porcentaje_pago_rh!: number;
  public porcentaje_pago_pt!: number;
  public gastos_operativos!: number;
  public gastos_financieros!: number;
  public estado!: number;
}

Empresa.init(
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
    identificacion: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    porcentaje_pago: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    porcentaje_pago_rh: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    porcentaje_pago_pt: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    gastos_operativos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    gastos_financieros: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'Empresa',
    tableName: 'empresa',
    timestamps: false,
  }
);
