# bbp-backend

This is a backend api implementation for a beat battle website.

## Setup

### Run Local DB
```
docker compose up
```

### Start Server

```
npm install
npm start
```

## API Endpoints
```
# Battles
GET   /battles
POST  /battles
PATCH /battles/battle_id
GET   /battles/battle_id

# Brackets
GET   /battles/battle_id/brackets
POST  /battles/battle_id/brackets
GET   /battles/battle_id/brackets/bracket_id
POST  /battles/battle_id/brackets/bracket_id/matches/match_id

# Submissions
GET   /battles/battle_id/submissions
POST  /battles/battle_id/submissions
GET   /battles/battle_id/submissions/submitter_id
POST  /battles/battle_id/submissions/submitter_id/votes
```
