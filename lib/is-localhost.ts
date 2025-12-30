export const isLocalhost = (reqIp: string | undefined): reqIp is string => {
	return !!(reqIp && (reqIp === '::ffff:127.0.0.1' || reqIp === '::1'));
};