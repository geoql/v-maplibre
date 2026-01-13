export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const json = query.json as string;

    if (!json) {
      throw createError({
        statusCode: 400,
        message: 'Missing json parameter',
      });
    }

    const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(json)}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'mapcn-vue/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createError({
        statusCode: response.status,
        message: `Valhalla API error: ${errorText}`,
      });
    }

    const data = await response.json();
    return data;
  },
  {
    maxAge: 60 * 60,
    getKey: (event) => {
      const query = getQuery(event);
      return `valhalla:${query.json}`;
    },
  },
);
