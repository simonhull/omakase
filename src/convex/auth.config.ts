export default {
	providers: [
		{
			// eslint-disable-next-line node/no-process-env
			domain: process.env.CONVEX_SITE_URL,
			applicationID: 'convex',
		},
	],
}
