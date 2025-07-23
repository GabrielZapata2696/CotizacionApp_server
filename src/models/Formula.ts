import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface FormulaAttributes {
  id: number;
  a: number; // Rhodium discount
  b: number; // Palladium discount
  c: number; // Platinum discount
  cop: number; // COP currency adjustment
  createdAt?: Date;
  updatedAt?: Date;
}

interface FormulaCreationAttributes extends Optional<FormulaAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Formula extends Model<FormulaAttributes, FormulaCreationAttributes> implements FormulaAttributes {
  public id!: number;
  public a!: number;
  public b!: number;
  public c!: number;
  public cop!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Get current active formula
  static async getCurrent(): Promise<Formula | null> {
    return await Formula.findOne({
      order: [['updatedAt', 'DESC']],
    });
  }

  // Create or update formula (only one should exist)
  static async createOrUpdate(formulaData: Omit<FormulaAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<Formula> {
    const existing = await Formula.findOne();
    
    if (existing) {
      await existing.update(formulaData);
      return existing;
    } else {
      return await Formula.create(formulaData);
    }
  }
}

Formula.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    a: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
      },
      comment: 'Rhodium discount factor',
    },
    b: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
      },
      comment: 'Palladium discount factor',
    },
    c: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
      },
      comment: 'Platinum discount factor',
    },
    cop: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
      },
      comment: 'COP currency adjustment factor',
    },
  },
  {
    sequelize,
    modelName: 'Formula',
    tableName: 'formulas',
    timestamps: false,
  }
);

export { Formula, FormulaAttributes, FormulaCreationAttributes };
