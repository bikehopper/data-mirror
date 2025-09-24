# data-mirror

Basic Node server that mirrors the GTFS and OSM PBF files that act as the source of truth for data in other services.

# Setup

Use `nvm` https://github.com/nvm-sh/nvm to install the appropriate NodeJS version.
```
$ nvm install
```
```
$ nvm use
```
This will automatically use the correct Node version defined in `.nvmrc`, you can also install that node version manually

# Env Vars

If setting up for the Bay Area, set the following env vars:

```
API_511_KEY=<API key obtained from https://511.org/>
```

If setting up for a different region, you need the full url's for both GTFS and OSM data

```
GTFS_URL=<full url where you can GET a gtfs.zip file>
OSM_PBF_URL=<full url where you can GET a osm pbf file>
```

# Building

This project uses transpiled Typescript when running. To transpile run:
```
npm run build
```
then
```
npm run start
```
to start the server.