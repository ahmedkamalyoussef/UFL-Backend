const { sequelize } = require('../config/database');
const { Team, Player } = require('../models');

async function seedPlayers() {
  await sequelize.authenticate();
  const teams = await Team.findAll();
  console.log(`Found ${teams.length} teams.`);

  for (const team of teams) {
    console.log(`Fetching players for team ${team.name} (ext ID: ${team.externalId})...`);
    try {
      const response = await fetch(`https://v3.football.api-sports.io/players/squads?team=${team.externalId}`, {
        headers: {
          'x-apisports-key': '03341569310d01203f5f257b7dc18d92'
        }
      });
      const data = await response.json();
      
      const players = data.response[0]?.players || [];
      console.log(`Got ${players.length} players for team ${team.name}`);
      
      for (const p of players) {
        let position = 'ATTACKER';
        if (p.position === 'Goalkeeper') position = 'GOALKEEPER';
        if (p.position === 'Defender') position = 'DEFENDER';
        if (p.position === 'Midfielder') position = 'MIDFIELDER';
                         
        await Player.findOrCreate({
          where: { externalId: p.id },
          defaults: {
            name: p.name,
            position: position,
            teamId: team.id,
            photoUrl: p.photo,
            isStar: false,
            avgPoints: Math.floor(Math.random() * 50) + 10
          }
        });
      }
    } catch (e) {
      console.error(`Error fetching team ${team.name}:`, e.message);
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Done!');
  process.exit(0);
}

seedPlayers();
