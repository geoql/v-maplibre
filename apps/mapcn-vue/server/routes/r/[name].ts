import type { H3Event } from 'h3';

export default defineEventHandler((event: H3Event) => {
  const rawName = getRouterParam(event, 'name');
  const name = rawName?.replace(/\.json$/, '');

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Missing name parameter',
    });
  }

  if (name === 'registry') {
    return getRegistryIndex();
  }

  const item = getRegistryItem(name);

  if (!item) {
    throw createError({
      statusCode: 404,
      message: `Registry item "${name}" not found`,
    });
  }

  return item;
});
