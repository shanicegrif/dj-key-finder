require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { library, saveLibrary } = require('./library');
const { getCompatibleKeys } = require("./camelot");
const { getTrackData } = require("./melodata");
const app = express();
const port = process.env.PORT || 5001;

// Enable CORS for all routes
app.use(cors());
// Middleware to parse JSON requests
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("DJ Key Finder Backend is Running!");
});

//Offical Routes
app.get('/api/library/compatible/:camelot', (req, res) => {
    const compatibleKeys = getCompatibleKeys(req.params.camelot);

    const matchingSongs = library.filter((song) => compatibleKeys.includes(song.camelot));

    res.json(matchingSongs);
})

app.get("/api/search", async (req, res) => {
  try {
    const { title, artist } = req.query;

    if (!title || !artist) {
      return res.status(400).json({
        error: "Please provide both a song title and artist.",
      });
    }

    const track = await getTrackData(title, artist);

    res.json(track);
  } catch (error) {
    console.error("Song search error:", error);

    res.status(500).json({
      error: "Unable to find song data.",
    });
  }
});

app.get("/api/library", (req, res) => {
  res.json(library);
});

app.delete("/api/library/:id", (req, res) => {
    const songId = Number(req.params.id);

    const songIndex = library.findIndex((song) => song.id === songId);

    if (songIndex === -1) {
        return res.status(404).json({ error: "Song not found in library." });
    }

    const [deletedSong] = library.splice(songIndex, 1);
    saveLibrary();

    res.json({
        message: "Song removed from library.",
        song: deletedSong,
    });
});

app.post("/api/library", (req, res) => {
  const { title, artist, key, camelot, bpm, isrc } = req.body;

  if (!title || !artist || !key || !camelot || bpm == null) {
    return res.status(400).json({
      error: "Missing required song information.",
    });
  }

  const alreadyExists = library.some(
    (song) =>
      (isrc && song.isrc === isrc) ||
      (song.title.toLowerCase() === title.toLowerCase() &&
        song.artist.toLowerCase() === artist.toLowerCase()),
  );

  if (alreadyExists) {
    return res.status(409).json({
      error: "This song is already in your library.",
    });
  }

  const newSong = {
    id: Date.now(),
    title,
    artist,
    key,
    camelot,
    bpm: Number(bpm),
    isrc: isrc || null,
  };

  library.push(newSong);
  saveLibrary();

  res.status(201).json({
    message: "Song added to your library.",
    song: newSong,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
