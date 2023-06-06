const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//get

app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM cricket_team;`;

  const players = await db.all(getPlayers);
  response.send(
    players.map((eachplayer) => convertDbObjectToResponseObject(eachplayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayers = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;

  const players = await db.get(getPlayers);
  response.send(convertDbObjectToResponseObject(players));
});

//post
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
            INSERT INTO cricket_team (player_name,
            jersey_number,
            role)
            VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

//PUT

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
    UPDATE
     cricket_team
    SET
     player_name='${playerName}',
     jersey_number=${jerseyNumber},
      role=${role}
    WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteteamQuery = `
    DELETE FROM
     cricket_team
    WHERE
     player_id = ${playerId};`;
  await db.run(deleteteamQuery);
  response.send("Player Removed");
});

module.exports = app;
