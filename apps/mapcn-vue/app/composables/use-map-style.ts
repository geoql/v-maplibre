/**
 * Map styles composable - uses maps.guru for rendering, carto for code examples.
 * IMPORTANT: Never expose mapsguruApiKey in documentation or code snippets.
 */
export function useMapStyle() {
  const colorMode = useColorMode();
  const config = useRuntimeConfig();

  const mapsguruApiKey = config.public.mapsguruApiKey;
  const mapsguruLightStyle = computed(
    () =>
      `https://maps.guru/api/v1/styles/standard/light/style.json?key=${mapsguruApiKey}`,
  );
  const mapsguruDarkStyle = computed(
    () =>
      `https://maps.guru/api/v1/styles/standard/dark/style.json?key=${mapsguruApiKey}`,
  );

  const cartoLightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const cartoDarkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? mapsguruDarkStyle.value
      : mapsguruLightStyle.value,
  );

  const cartoStyle = computed(() =>
    colorMode.value === 'dark' ? cartoDarkStyle : cartoLightStyle,
  );

  return {
    mapStyle,
    mapsguruLightStyle,
    mapsguruDarkStyle,
    cartoStyle,
    cartoLightStyle,
    cartoDarkStyle,
    colorMode,
  };
}
