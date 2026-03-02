const axios = require('axios');
const FormData = require('form-data');

async function run() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:3000/api' });
    let loginRes;
    try {
      loginRes = await api.post('/auth/login', { email: 'admin@eclipse.com', password: 'password123' });
    } catch (e) {
      loginRes = await api.post('/auth/login', { email: 'tommy@example.com', password: 'password123' });
    }
    const token = loginRes.data.access_token;

    const form = new FormData();
    form.append('title', 'Test 500 Error');
    form.append('description', 'Testing 500');
    form.append('published', 'false');

    const projectRes = await api.post('/portfolio/projects', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
        'x-site-id': '1'
      }
    });
    console.log("Success! ID:", projectRes.data.id);
  } catch (error) {
    if (error.response) {
      console.error("HTTP", error.response.status, "=>", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}
run();
