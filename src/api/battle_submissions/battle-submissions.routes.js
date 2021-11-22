const express = require('express');

const queries = require('./battle-subimssions.queries');

const router = express.Router();

router.get('/:id/submissions', async (req, res) => {
  // TODO: MAke this only find battle submissions for the battle id
  const submissions = await queries.find();
  res.json(submissions);
});

// TODO: This doesnt work. Make this work with query params
router.get('/:id/submissions/:submission_id', async (req, res, next) => {
  try {
    const submission = await queries.get(req.params.id);
    if (submission) {
      return res.json(submission);
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const submission = await queries.create(req.body);
    res.json(submission);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
