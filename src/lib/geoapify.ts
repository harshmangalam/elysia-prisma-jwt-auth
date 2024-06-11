async function reverseGeocodingAPI(lat: number, lon: number) {
  const resp = await fetch(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${Bun.env.GEOAPIFY_API_KEY}`
  );
  const jsonResp = await resp.json();
  const data = jsonResp?.features[0]?.properties;
  return data;
}

export { reverseGeocodingAPI };
