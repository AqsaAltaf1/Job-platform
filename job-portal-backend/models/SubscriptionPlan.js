import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  display_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price_monthly: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  price_yearly: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stripe_price_id_monthly: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stripe_price_id_yearly: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stripe_product_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  limits: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_popular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['sort_order']
    }
  ]
});

export default SubscriptionPlan;
