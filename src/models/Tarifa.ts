import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TarifaAttributes {
  id: number;
  timestamp: number;
  date: string;
  cop: number;
  usd: number;
  xpd: number; // Palladium
  xpt: number; // Platinum
  xrh: number; // Rhodium
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TarifaCreationAttributes extends Optional<TarifaAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Tarifa extends Model<TarifaAttributes, TarifaCreationAttributes> implements TarifaAttributes {
  public id!: number;
  public timestamp!: number;
  public date!: string;
  public cop!: number;
  public usd!: number;
  public xpd!: number;
  public xpt!: number;
  public xrh!: number;
  public unit!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to get the latest rates
  static async getLatest(): Promise<Tarifa | null> {
    return await Tarifa.findOne({
      order: [['timestamp', 'DESC']],
    });
  }

  // Static method to get rates for a specific date
  static async getRatesForDate(date: string): Promise<Tarifa | null> {
    return await Tarifa.findOne({
      where: { date },
      order: [['timestamp', 'DESC']],
    });
  }
}

Tarifa.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cop: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
      defaultValue: 1.0,
    },
    xpd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    xpt: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    xrh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
  },
  {
    sequelize,
    modelName: 'Tarifa',
    tableName: 'tarifas',
    timestamps: false,
    indexes: [
      {
        fields: ['timestamp'],
      },
      {
        fields: ['date'],
      },
      {
        fields: ['date', 'timestamp'],
        unique: true,
      },
    ],
  }
);

export { Tarifa, TarifaAttributes, TarifaCreationAttributes };
