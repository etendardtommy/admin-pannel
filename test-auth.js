const axios = require('axios');

async function run() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:3000/api' });
    console.log("1. Logging in...");
    const loginRes = await api.post('/auth/login', {
      email: 'admin@eclipse.com', // fallback to common dev email if needed
      password: 'password123'     // fallback to common dev pass
    }).catch(e => {
        // Just try common credentials for local dev
        return api.post('/auth/login', { email: 'tommy@example.com', password: 'password123' });
    });
    
    const token = loginRes.data.access_token;
    console.log("Token obtained:", token?.substring(0, 15) + "...");

    console.log("2. Testing Sites (GET) with JWT...");
    const sitesRes = await api.get('/sites', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Sites array length:", sitesRes.data.length);
    const siteId = sitesRes.data[0]?.id || 1;

    console.log("3. Testing Projects (POST) with JWT (simulating multipart)...");
    const FormData = require('form-data');
    const form = new FormData();
    form.append('title', 'Test API Project');
    form.append('description', 'Testing 401');
    form.append('published', 'false');

    const projectRes = await api.post('/portfolio/projects', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
        'x-site-id': siteId.toString()
      }
    });
    
    console.log("Successfully created project! ID:", projectRes.data.id);
  } catch (e) {
    console.error("FAILED.");
    if (e.response) {
      console.error("Status:", e.response.status);
      console.error("Data:", e.response.data);
    } else {
      console.error(e.message);
    }
  }
}
run();
