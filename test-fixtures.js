const { ApiFootballClient } = require('./src/infrastructure/football/api-football-client');
const client = new ApiFootballClient();
client.get('/fixtures', { next: 15 }).then(res => console.log(res.errors, res.response?.length)).catch(console.error);
