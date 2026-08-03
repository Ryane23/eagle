/**
 * Test Authentication Endpoints
 * 
 * Make sure the server is running: npm run start:dev
 */

const API_URL = 'http://localhost:3000';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
  expiresIn: number;
}

async function testLogin(email: string, password: string, role: string) {
  console.log(`\n🔐 Testing login for ${role}...`);
  console.log(`   Email: ${email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`   ❌ Login failed: ${error.message}`);
      return null;
    }

    const data: AuthResponse = await response.json();
    console.log(`   ✅ Login successful!`);
    console.log(`   👤 User: ${data.user.name}`);
    console.log(`   🎫 Role: ${data.user.role}`);
    console.log(`   🔑 Access Token: ${data.accessToken.substring(0, 30)}...`);
    
    return data;
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function testGetProfile(accessToken: string) {
  console.log(`\n👤 Testing GET /auth/me...`);
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`   ❌ Failed: ${error.message}`);
      return;
    }

    const user = await response.json();
    console.log(`   ✅ Profile retrieved!`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🏥 Hospital ID: ${user.hospitalId || 'N/A'}`);
    console.log(`   📱 Phone: ${user.phone || 'N/A'}`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function testRefreshToken(refreshToken: string) {
  console.log(`\n🔄 Testing POST /auth/refresh...`);
  
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`   ❌ Failed: ${error.message}`);
      return null;
    }

    const data: AuthResponse = await response.json();
    console.log(`   ✅ Token refreshed!`);
    console.log(`   🔑 New Access Token: ${data.accessToken.substring(0, 30)}...`);
    
    return data;
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function testLogout(refreshToken: string, accessToken: string) {
  console.log(`\n🚪 Testing POST /auth/logout...`);
  
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`   ❌ Failed: ${error.message}`);
      return;
    }

    const data = await response.json();
    console.log(`   ✅ ${data.message}`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 EAGLES Authentication API Tests');
  console.log('═══════════════════════════════════════════════');

  // Test 1: Admin Login
  const adminAuth = await testLogin('admin@eagles.com', 'Admin@123456', 'Admin');
  if (adminAuth) {
    await testGetProfile(adminAuth.accessToken);
  }

  // Test 2: Primary Secretary Login
  const primaryAuth = await testLogin('secretary.primary@eagles.com', 'Primary@123', 'Primary Secretary');
  if (primaryAuth) {
    await testGetProfile(primaryAuth.accessToken);
  }

  // Test 3: Secondary Secretary Login
  const secondaryAuth = await testLogin('secretary.douala@eagles.com', 'Douala@123', 'Secondary Secretary (Douala)');
  if (secondaryAuth) {
    await testGetProfile(secondaryAuth.accessToken);
  }

  // Test 4: Nurse Login
  const nurseAuth = await testLogin('nurse.douala@eagles.com', 'Nurse@123', 'Nurse (Douala)');
  if (nurseAuth) {
    await testGetProfile(nurseAuth.accessToken);
  }

  // Test 5: Doctor Login
  const doctorAuth = await testLogin('doctor.nana@eagles.com', 'Doctor@123', 'Doctor');
  if (doctorAuth) {
    await testGetProfile(doctorAuth.accessToken);

    // Test 6: Refresh Token
    const refreshedAuth = await testRefreshToken(doctorAuth.refreshToken);

    // Test 7: Logout
    if (refreshedAuth) {
      await testLogout(refreshedAuth.refreshToken, refreshedAuth.accessToken);
    }
  }

  // Test 8: Invalid Credentials
  console.log(`\n❌ Testing invalid credentials...`);
  await testLogin('wrong@eagles.com', 'wrongpassword', 'Invalid User');

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ All tests completed!');
  console.log('═══════════════════════════════════════════════\n');
}

// Run the tests
runTests().catch(console.error);
