import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SessionAttributes {
  id: number;
  usuario_id: string; // bigint comes as string from postgres
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  refresh_expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface SessionCreationAttributes extends Optional<SessionAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public usuario_id!: string;
  public access_token!: string;
  public refresh_token!: string;
  public expires_at!: Date;
  public refresh_expires_at!: Date;
  public ip_address?: string;
  public user_agent?: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    refresh_expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['usuario_id'],
      },
      {
        fields: ['access_token'],
        unique: true,
      },
      {
        fields: ['refresh_token'],
        unique: true,
      },
      {
        fields: ['expires_at'],
      },
    ],
  }
);

export default Session;
