/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `
      select * from "entries"
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId)) {
      throw new ClientError(400, 'entryId must be an integer');
    }
    const sql = `
      select *
      from "entries"
      where "entryId" = $1;
    `;
    const result = await db.query(sql, [entryId]);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, `entry ${entryId} not found`);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entries', async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    const sql = `
    insert into "entries" ("title", "notes", "photoUrl")
    values ($1, $2, $3)
    returning *;
    `;
    const params = [title, notes, photoUrl];
    const results = await db.query(sql, params);
    const create = results.rows[0];
    if (!create) throw new ClientError(404, `Could not create entry`);
    res.json(create);
  } catch (err) {
    next(err);
  }
});

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { title, notes, photoUrl } = req.body;
    if (!Number.isInteger(+entryId)) {
      throw new ClientError(400, 'entryId must be an integer');
    }
    if (title === undefined || notes === undefined || photoUrl === undefined) {
      throw new ClientError(400, 'title, notes, and photoUrl are required');
    }

    const sql = `
      update "entries"
      set "title" = $1,
          "notes" = $2,
          "photoUrl" = $3
      where "entryId" = $4
      returning *;
    `;
    const params = [title, notes, photoUrl, entryId];
    const result = await db.query(sql, params);
    const update = result.rows[0];
    if (!update) throw new ClientError(404, `entry ${entryId} not found`);
    res.json(update);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const sql = `
    delete
    from "entries"
    where "entryId" = $1
    returning *
    `;
    const results = await db.query(sql, [entryId]);
    const erase = results.rows[0];
    if (!erase) throw new ClientError(404, `Could not delete entry`);
    res.json(erase);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
