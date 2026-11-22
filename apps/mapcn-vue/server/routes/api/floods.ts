export default defineEdgeCachedHandler(
  async (event) => {
    const query = getQuery(event);
    const fromDate =
      (query.fromDate as string) ||
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const toDate =
      (query.toDate as string) || new Date().toISOString().split('T')[0];
    const alertLevel = (query.alertLevel as string) || 'Green;Orange;Red';
    const limit = (query.limit as string) || '2000';

    const data = await $fetch(
      `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH`,
      {
        query: {
          eventlist: 'FL',
          fromDate,
          toDate,
          alertlevel: alertLevel,
          limit,
        },
        headers: {
          Accept: 'application/json',
          'User-Agent': 'mapcn-vue/1.0',
        },
      },
    );

    return data;
  },
  {
    maxAge: 60 * 30,
  },
);
