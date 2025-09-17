import { sequelize, User } from '../models/index.js';

async function initializeDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully.');

    // Create default super admin user
    const superAdmin = await User.create({
      email: 'admin@jobportal.com',
      password_hash: 'admin123', // Will be hashed by the hook
      role: 'super_admin',
      first_name: 'Super',
      last_name: 'Admin',
      phone: '+1234567890',
    });

    console.log('✅ Default super admin created:', superAdmin.email);

    // Create sample employer
    const employer = await User.create({
      email: 'employer@techcorp.com',
      password_hash: 'employer123',
      role: 'employer',
      first_name: 'John',
      last_name: 'Employer',
      phone: '+1234567891',
    });

    console.log('✅ Sample employer created:', employer.email);

    // Create sample candidate
    const candidate = await User.create({
      email: 'candidate@example.com',
      password_hash: 'candidate123',
      role: 'candidate',
      first_name: 'Jane',
      last_name: 'Candidate',
      phone: '+1234567892',
    });

    console.log('✅ Sample candidate created:', candidate.email);

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();
