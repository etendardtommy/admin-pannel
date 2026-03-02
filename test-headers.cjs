const axios = require('axios');
const FormData = require('form-data');

const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  console.log("Axios calculated Headers:", config.headers);
  return config;
});

const form = new FormData();
form.append('test', '123');

api.post('http://httpbin.org/post', form).catch(() => {});
