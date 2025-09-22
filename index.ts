import fastify from 'fastify';
import { CHECKSUMS, DATA_PATH, updateFiles } from './fetch-files.js';
import fs from 'node:fs';
import path from 'node:path';
import { PORT } from './env.js';

updateFiles();

const server = fastify({
  logger: true,
});

server.get('/gtfs.zip', (request, reply) => {
  if (CHECKSUMS.gtfs == null) {
    reply.code(404);
    return;
  } 
  
  const stream = fs.createReadStream(path.join(DATA_PATH, 'gtfs.zip'));
  reply.code(200);
  reply.send(stream);

  return;
});

server.get('/osm.pbf', (request, reply) => {
  if (CHECKSUMS.osm == null) {
    reply.code(404);
    return;
  }

  const stream = fs.createReadStream(path.join(DATA_PATH, 'osm.pbf'));
  reply.code(200);
  reply.send(stream);

  return;
});

server.get('/checksums', (request, reply) => {
  return CHECKSUMS;
});

server.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})