/**
 * Google Flood Forecasting API proxy
 *
 * Supports both GET (query param based) and POST (body based) endpoints.
 * POST endpoints: searchLatestFloodStatusByArea, gauges:searchGaugesByArea, significantEvents:search
 * GET endpoints: queryLatestFloodStatusByGaugeIds, gauges:queryGaugeForecasts, gaugeModels:batchGet
 *
 * The `serializedPolygons/{id}` resource is handled via GET with the ID in the endpoint string.
 */

const VALID_ENDPOINT_PREFIXES = [
  'floodStatus:queryLatestFloodStatusByGaugeIds',
  'floodStatus:searchLatestFloodStatusByArea',
  'gauges:searchGaugesByArea',
  'gauges:queryGaugeForecasts',
  'gaugeModels:batchGet',
  'significantEvents:search',
  'serializedPolygons',
] as const;

/** POST endpoints require a JSON body instead of query params */
const POST_ENDPOINTS = new Set([
  'floodStatus:searchLatestFloodStatusByArea',
  'gauges:searchGaugesByArea',
  'significantEvents:search',
]);

/**
 * POST bodies are proxied verbatim to Google (the shape varies per endpoint),
 * so validation only asserts a plain JSON object before forwarding.
 */
function parseProxyBody(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw createError({
      statusCode: 400,
      message: 'Request body must be a JSON object',
    });
  }
  return data as Record<string, unknown>;
}

function isValidEndpoint(endpoint: string): boolean {
  return VALID_ENDPOINT_PREFIXES.some(
    (prefix) =>
      endpoint === prefix || endpoint.startsWith('serializedPolygons/'),
  );
}

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const apiKey = config.googleFloodApiKey as string;

    if (!apiKey) {
      throw createError({
        statusCode: 503,
        message:
          'Google Flood Forecasting API key not configured. Apply at developers.google.com/flood-forecasting',
      });
    }

    const query = getQuery(event);
    const endpoint = (query.endpoint as string) || 'significantEvents:search';

    if (!isValidEndpoint(endpoint)) {
      throw createError({
        statusCode: 400,
        message: `Invalid endpoint "${endpoint}". Supported prefixes: ${VALID_ENDPOINT_PREFIXES.join(', ')}`,
      });
    }

    const apiUrl = `https://floodforecasting.googleapis.com/v1/${endpoint}`;

    if (POST_ENDPOINTS.has(endpoint)) {
      // Read JSON body from the incoming request for POST endpoints
      const body = await readValidatedBody(event, parseProxyBody).catch(
        (): Record<string, unknown> => ({}),
      );

      const data = await $fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        query: { key: apiKey },
        body,
      });

      return data;
    }

    // GET endpoint — pass query params (minus 'endpoint' key)
    const { endpoint: _endpoint, ...apiParams } = query;

    const data = await $fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      query: {
        ...apiParams,
        key: apiKey,
      },
    });

    return data;
  },
  {
    maxAge: 60 * 15,
    getKey: async (event) => {
      const query = getQuery(event);
      const endpoint = (query.endpoint as string) || 'significantEvents:search';

      // Include POST body in cache key so different regions/params don't collide
      if (POST_ENDPOINTS.has(endpoint)) {
        const body = await readValidatedBody(event, parseProxyBody).catch(
          (): Record<string, unknown> => ({}),
        );
        return `flood-forecasting:${endpoint}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
      }

      return `flood-forecasting:${endpoint}:${JSON.stringify(query)}`;
    },
  },
);
