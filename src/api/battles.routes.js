const express = require('express');

const queries = require('./battles.queries');

const router = express.Router();

router.get('/', async (req, res) => {
  const battles = await queries.find();
  res.json(battles);
});

router.get('/:id', async (req, res, next) => {
  try {
    const battle = await queries.get(req.params.id);
    if (battle) {
      return res.json(battle);
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
