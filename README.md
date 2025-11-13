# Movie Search App

Simple Express application for searching movie information via the OMDB API.

## Prerequisites
- Node.js 18+ (older versions likely work but are untested)
- npm (ships with Node.js)

## Setup
```sh
npm install
```

## Run
```sh
npm start
```

The server listens on port `3000` by default; override with `PORT=<number>`.

## Usage
Visit `http://localhost:3000`, enter a search term, and submit the form to view the top results from OMDB. Update `app.js` if you want to swap in your own API key.
