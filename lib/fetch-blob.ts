export const fetchBlob = async (url: string, logger: (msg: string) => void, skipProgress: boolean = false): Promise<Buffer> => {
  logger(`Downloading from ${url}`);

  const res = await fetch(url);
  if (res.status === 200) {
    const binary = await res.arrayBuffer();
    return Buffer.from(binary);
  } else {
    throw new Error(`Fetch from ${url} failed with status code ${res.status}`);
  }
}
