interface NominatimResponse {
  name?: string;
  display_name?: string;
  address?: {
    amenity?: string;
    tourism?: string;
    shop?: string;
    building?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
  };
}

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const lat = query.lat as string;
    const lon = query.lon as string;

    if (!lat || !lon) {
      throw createError({
        statusCode: 400,
        message: 'Missing lat or lon parameter',
      });
    }

    const data = await $fetch<NominatimResponse>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'mapcn-vue/1.0 (https://mapcn-vue.geoql.in)',
        },
      },
    );

    const name =
      data.name ||
      data.address?.amenity ||
      data.address?.tourism ||
      data.address?.shop ||
      data.address?.building ||
      data.address?.road ||
      data.address?.neighbourhood ||
      data.address?.suburb ||
      data.display_name?.split(',')[0] ||
      'Unknown location';

    return { name, address: data.address, displayName: data.display_name };
  },
  {
    maxAge: 60 * 60 * 24,
    getKey: (event) => {
      const query = getQuery(event);
      return `geocode:${query.lat}:${query.lon}`;
    },
  },
);
