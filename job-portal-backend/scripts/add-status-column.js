import { sequelize } from '../models/index.js';

async function addStatusColumn() {
  try {
    console.log('🔧 Adding status column to reviewer_invitations table...');
    
    // Add the status column
    await sequelize.query(`
      ALTER TABLE reviewer_invitations 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'accepted', 'completed', 'expired'))
    `);
    
    console.log('✅ Successfully added status column to reviewer_invitations table');
    
  } catch (error) {
    console.error('❌ Error adding status column:', error);
  } finally {
    await sequelize.close();
  }
}

addStatusColumn();
