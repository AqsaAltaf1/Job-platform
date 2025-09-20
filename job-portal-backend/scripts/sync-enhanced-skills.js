import { sequelize } from '../models/index.js';

async function syncEnhancedSkills() {
  try {
    console.log('🔄 Syncing enhanced skills database tables...');
    
    // Sync all models to create/update tables
    await sequelize.sync({ alter: true });
    
    console.log('✅ Enhanced skills database tables synced successfully!');
    console.log('📋 Created/Updated tables:');
    console.log('   - enhanced_skills');
    console.log('   - skill_evidence');
    console.log('   - peer_endorsements');
    console.log('   - reviewer_invitations');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncEnhancedSkills();
