import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const EmployerProfile = sequelize.define('EmployerProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_picture_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Employer-specific fields
  position: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  company_website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_industry: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'employer_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

export default EmployerProfile
