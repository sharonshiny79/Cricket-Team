const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, " cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObject = (objectItem) => {
    return {
        playerId: objectItem.player_id,
        playerName: objectItem.player_name,
        jerseyNumber: objectItem.jersey_number,
        role: objectItem.role,
    };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
   ;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((eachPlayer)=> convertDbObject(eachPlayer)));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES(`${playerName}`,${jerseyNumber}, `${role}`);`;
});
const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/",async(request,response)=>{
    const {playerId} = request.params;
    const getPlayerDetailsQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
    const getPlayerDetailsQueryResponse = await db.get(getPlayerDetailsQuery);
    response.send(convertDbObject(getPlayerDetailsQueryResponse));
});

app.put("/players/",async(request,response)=>{
    const {playerId} = request.params;
    const { playerName, jerseyNumber, role } = request.body;
    const updatePlayerDetailsQuery = `update cricket_team set
     player_name = `${playerName}`, jersey_number = ${jerseyNumber},role = `${role}`
      where player_id = ${playerId};`;
      await db.run(updatePlayerDetailsQuery);
      response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async(request,response)=>{
    const {playerId} = request.params;
    const deletePlayerQuery = `DELETE FROM cricket_team 
    WHERE player_id = ${playerId};`;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
});

module.exports = app;
