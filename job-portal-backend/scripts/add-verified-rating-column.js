import { sequelize } from '../models/index.js';

async function addVerifiedRatingColumn() {
  try {
    console.log('🔧 Adding verified_rating column to enhanced_skills table...');
    
    // Add the verified_rating column
    await sequelize.query(`
      ALTER TABLE enhanced_skills 
      ADD COLUMN IF NOT EXISTS verified_rating DECIMAL(2, 1)
    `);
    
    console.log('✅ Successfully added verified_rating column to enhanced_skills table');
    
  } catch (error) {
    console.error('❌ Error adding verified_rating column:', error);
  } finally {
    await sequelize.close();
  }
}

addVerifiedRatingColumn();
