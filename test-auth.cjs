const axios = require('axios');
const FormData = require('form-data');

async function testApi() {
  try {
    const api = axios.create({ baseURL: 'http://[::1]:3000/api' });
    console.log("1. Logging in...");
    
    let loginRes;
    try {
        loginRes = await api.post('/auth/login', { email: 'admin@eclipse.com', password: 'password123' });
    } catch(e) {
        loginRes = await api.post('/auth/login', { email: 'tommy@example.com', password: 'password123' });
    }
    
    const token = loginRes.data.access_token;
    console.log("Token obtained:", token ? "YES" : "NO");

    console.log("2. Testing Projects (POST) with JWT...");
    const form = new FormData();
    form.append('title', 'Test API Project');
    form.append('description', 'Testing 401');
    form.append('published', 'false');

    const projectRes = await api.post('/portfolio/projects', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
        'x-site-id': '1'
      }
    });
    
    console.log("API responded:", projectRes.status);
  } catch (error) {
    console.error("FAILED.");
    if (error.response) {
      console.error("Status:", error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testApi();
