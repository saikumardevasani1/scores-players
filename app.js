const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const filePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();
app.use(express.json());

let database = null;
const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

// API 1
const changingPlayersVarName = (dataObj) => {
  return {
    playerId: dataObj.player_id,
    playerName: dataObj.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const gettingAllPlayersQuery = `SELECT * FROM player_details;`;
  const gettingAllPlayers = await database.all(gettingAllPlayersQuery);
  const gettingFinalAllPlayers = gettingAllPlayers.map((eachObj) => {
    return changingPlayersVarName(eachObj);
  });
  response.send(gettingFinalAllPlayers);
});

// API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const gettingPlayerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const gettingPlayer = await database.get(gettingPlayerQuery);
  response.send(changingPlayersVarName(gettingPlayer));
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatingPlayerDetailsQuery = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
  const updatingPlayerDetails = await database.run(updatingPlayerDetailsQuery);
  response.send("Player Details Updated");
});

// API4

const changingMatchVarName = (dataObj) => {
  return {
    matchId: dataObj.match_id,
    match: dataObj.match,
    year: dataObj.year,
  };
};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const gettingMatchDetailsQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const gettingMatchDetails = await database.get(gettingMatchDetailsQuery);
  const finalObj = changingMatchVarName(gettingMatchDetails);
  response.send(finalObj);
});

// API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const gettingMatchDetailsQuery = `SELECT DISTINCT match_details.match_id,match_details.match,match_details.year  FROM player_details NATURAL JOIN player_match_score NATURAL JOIN match_details WHERE player_details.player_id = ${playerId};`;
  const gettingMatchDetails = await database.all(gettingMatchDetailsQuery);
  const finalObj = gettingMatchDetails.map((eachObj) => {
    return changingMatchVarName(eachObj);
  });
  response.send(finalObj);
});

// API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playersOfaMatchQuery = `SELECT player_details.player_id,player_details.player_name FROM match_details NATURAL JOIN player_match_score NATURAL JOIN player_details WHERE match_details.match_id = ${matchId};`;
  const playersOfaMatch = await database.all(playersOfaMatchQuery);
  const finalObj = playersOfaMatch.map((eachObj) => {
    return changingPlayersVarName(eachObj);
  });
  response.send(finalObj);
});

// API 7

const changingVarNames = (dataObj) => {
  return {
    playerId: dataObj.playerId,
    playerName: dataObj.playerName,
    totalScore: dataObj.score,
    totalFours: dataObj.fours,
    totalSixes: dataObj.sixes,
  };
};

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const statesOfaPlayerQuery = `SELECT player_details.player_id AS playerId,player_details.player_name AS playerName,SUM(player_match_score.score) AS score,SUM(player_match_score.fours) AS fours,SUM(player_match_score.sixes) AS sixes FROM player_details NATURAL JOIN player_match_score WHERE player_details.player_id = ${playerId};`;
  const statesOfaPlayer = await database.get(statesOfaPlayerQuery);
  response.send(changingVarNames(statesOfaPlayer));
});

module.exports = app;
