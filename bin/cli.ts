#!/usr/bin/env node

import { program } from 'commander';
import { extract } from 'tar';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { calcChecksum } from '../lib/calc-checksum.js';
import { fetchBlob } from '../lib/fetch-blob.js';
import { FILES, type SourceDataFileType } from '../files.js';

program
  .name('bikehopper/sync-data')
  .description('Download Bikehopper source data to initialize services')
  .option(
    '-o, --outDir <string>', 'output directoy relative path', 
    (value: string) => path.resolve(value),
    path.join(process.cwd(), '/data')
  )
  .option(
    '-r, --rootUrl <string>', '(Optional) root url for making requests for the file',
    'https://data.cool-bikehopper.org'
  )
  .option(
    '-f, --files <string>', '(Optional) comma separated list of which resources should be downloaded',
    'gtfs,osm'
  );

program.parse();

const options = program.opts();
const filesToDownload: SourceDataFileType[] = options.files.split(',');
const checksumUrl = path.join(options.rootUrl, '/checksums');
const checksumRes = await fetch(checksumUrl);
const checksums = await checksumRes.json() as Record<SourceDataFileType, string>;

const updateFileIfNecessary = async (fileType: SourceDataFileType) => {
  const filename = FILES[fileType].name;
  if (!existsSync(options.outDir)){
    mkdirSync(options.outDir)
  }
  const filepath = path.join(options.outDir, filename);
  let needsDownload = false;
  if (!existsSync(filepath)) {
    needsDownload = true;
  } else {
    if (checksums[fileType]) {
      const checksum = calcChecksum(Buffer.from(readFileSync(filepath)));
      if (checksum !== checksums[fileType]) {
        needsDownload = true;
      }
    }
  }

  if (needsDownload) {
    const buffer = await fetchBlob(options.rootUrl+'/'+filename, console.log, true);
    writeFileSync(filepath, buffer);

    // special case for extracting elevation tarball
    if (fileType === 'elevation') {
      await extract({file: filepath, cwd: options.outDir});
    }

  } else {
    console.log(`${filepath} does not need update`);
  }
};

for(const file of filesToDownload) {
  await updateFileIfNecessary(file);
}
