const axios = require('axios');
async function run() {
    try {
        const login = await axios.post('http://localhost:3000/api/auth/login', { email: 'admin@eclipse.com', password: 'password123' });
        const token = login.data.access_token;
        const res = await axios.get('http://localhost:3000/api/portfolio/projects', {
            headers: { 'x-site-id': '1' }
        });
        console.log("Projects:", JSON.stringify(res.data, null, 2));
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
