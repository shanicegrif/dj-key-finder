const { keyToCamelot } = require('./camelot');

const resolveTrack = async (title, artist) => {
    const url = new URL (
        'https://melodata.voltenworks.com/api/v1/tracks/resolve'
    )
    url.searchParams.append('title', title);
    url.searchParams.append('artist', artist);

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.MELODATA_API_KEY}`,
        },
    });

    if(!response.ok) {
        throw new Error(`Melodata request failed: ${resonse.status} ${response.status}`);
    }

    const data = await response.json();
    return data.data;
}

const getTrackFeatures = async (isrc) => {
  const response = await fetch(
    `https://melodata.voltenworks.com/api/v1/tracks/${isrc}/features`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MELODATA_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`MeloData features request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.data;
};

const getTrackData = async (title, artist) => {
  const track = await resolveTrack(title, artist);

  const featuresData = await getTrackFeatures(track.isrc);
  const features = featuresData.features;

  return {
    title: track.matched.title,
    artist: track.matched.artist,
    isrc: track.isrc,
    key: features.key,
    camelot: keyToCamelot(features.key),
    bpm: features.bpm,
  };
};

module.exports = {
    resolveTrack,
    getTrackFeatures,
    getTrackData
}