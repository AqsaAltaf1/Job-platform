// Simple test script to get JWT token
const API_BASE_URL = 'http://localhost:5000/api';

async function testJWT() {
  try {
    console.log('🔐 Testing JWT Authentication...\n');

    // Test login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@jobportal.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', loginData.user);
      console.log('🔑 JWT Token:', loginData.token);
      
      const token = loginData.token;
      
      // Test protected route
      console.log('\n2. Testing protected route...');
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        console.log('✅ Protected route access successful!');
        console.log('👤 Profile:', profileData.user);
      } else {
        console.log('❌ Protected route failed:', profileData.error);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testJWT();
