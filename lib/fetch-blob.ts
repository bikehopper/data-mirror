export const fetchBlob = async (url: string, logger: (msg: string) => void, skipProgress: boolean = false): Promise<Buffer> => {
  logger(`Dowloading from ${url}`);

  const res = await fetch(url);
  if (res.status === 200) {
    const responseLength = parseInt(res.headers.get('content-length') || '0');
    if (responseLength > 0 && res.body && !skipProgress) {
      let downloaded = 0;
      let lastProgress = 0;
      const binary = new Uint8Array(responseLength);
      for await (const chunk of res.body) {
        binary.set(chunk, downloaded);
        downloaded += chunk.length;

        const progress = Math.floor((downloaded / responseLength) * 100);

        if (progress !== lastProgress){
          logger(`URL: ${url} PROGRESS: ${progress}`);
          lastProgress = progress;
        }
      }

      return Buffer.from(binary);
    } else {
      logger(`No Content-Length header on ${url}, cannot report progress`);

      const binary = await res.arrayBuffer();
      return Buffer.from(binary);
    }
  } else {
    throw new Error(`Fetch from ${url} failed with status code ${res.status}`);
  }
}
