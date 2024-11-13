const i18next = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-express-middleware');
const swapi = require("./src/swapi");
const objectTranslate = require("./src/utils/object-translate");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
require('dotenv').config()
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");

const app = express();
console.log("ENVIRONMENT", process.env.ENVIRONMENT)
app.use(express.json());
const USERS_TABLE = process.env.ENVIRONMENT === 'development'?process.env.USERS_TABLE: "users-table-dev";
const client = new DynamoDBClient(process.env.ENVIRONMENT === 'development'? undefined: {
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});
const docClient = DynamoDBDocumentClient.from(client);

//translate configuration with locales
i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath:__dirname + '/locales/{{lng}}/{{ns}}.json'
        },
        fallbackLng: 'en',
        preload: ['en']
    });
app.use(i18nextMiddleware.handle(i18next));

//swapi integration endpoints
app.get("/get-info-person/:id", async (req, res, next) => {
  try {
    const person = await swapi.people.getOne(req.params.id, req.query.full);
    return res.status(200).json(objectTranslate(req.t, person));
  } catch (error) {
    return res.status(500).json({mensaje:"Internal Error"});
  }
  
});

app.get("/get-info-film/:id", async (req, res, next) => {
  try {
    const film = await swapi.films.getOne(req.params.id, req.query.full);
    return res.status(200).json(objectTranslate(req.t, film));
  } catch (error) {
    return res.status(500).json({mensaje:"Internal Error"});
  }  
});

//dynamo save and find endpoints
app.get("/user-favorite-film/:userId", async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { userId, name, filmId, filmTitle } = Item;
      res.json({ userId, name, filmId, filmTitle });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

app.post("/user-favorite-film", async (req, res) => {
  const { userId, name, filmId, filmTitle } = req.body;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }
  if(!filmId || !filmTitle){
    res.status(400).json({ error: 'missing filmId or filmTitle' });
  }
  const params = {
    TableName: USERS_TABLE,
    Item: { userId, name, filmId, filmTitle },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ userId, name, filmId, filmTitle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

//error handling
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// uncomment next lines for local use, only endpoints integration swapi
// app.listen(3000, ()=>{
//   console.log("app init")
// })

module.exports = app;
