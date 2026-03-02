const axios = require('axios');
async function run() {
    try {
        console.log("Fetching siteId = 1...");
        let res1 = await axios.get('http://localhost:3000/api/portfolio/projects', {
            headers: { 'x-site-id': '1' }
        });
        console.log("Projects for Site 1:", JSON.stringify(res1.data, null, 2));

        console.log("Fetching siteId = 2...");
        let res2 = await axios.get('http://localhost:3000/api/portfolio/projects', {
            headers: { 'x-site-id': '2' }
        });
        console.log("Projects for Site 2:", JSON.stringify(res2.data, null, 2));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
