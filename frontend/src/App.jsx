import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [matchingSongs, setMatchingSongs] = useState([]);
  const [librarySongs, setLibrarySongs] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchArtist, setSearchArtist] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const deleteSong = async (songId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this song from your library?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/library/${songId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to remove song.");
      }

      await fetchLibrary();
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchLibrary = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/library");

      if (!response.ok) {
        throw new Error("Unable to load your library.");
      }

      const data = await response.json();
      setLibrarySongs(data);
    } catch (error) {
      console.error("Error fetching library:", error);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const addSongToLibrary = async () => {
    if (!selectedSong) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedSong),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add song.");
      }

      await fetchLibrary();
      alert(`${data.song.title} was added to your library!`);
    } catch (error) {
      alert(error.message);
    }
  };

  const searchForSong = async (event) => {
    event.preventDefault();

    if (!searchTitle.trim() || !searchArtist.trim()) {
      setSearchError("Please enter both a song title and artist.");
      return;
    }

    setSearchError("");
    setIsSearching(true);
    setSelectedSong(null);
    setMatchingSongs([]);

    try {
      const params = new URLSearchParams({
        title: searchTitle.trim(),
        artist: searchArtist.trim(),
      });

      const response = await fetch(
        `http://localhost:5001/api/search?${params.toString()}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to find song.");
      }

      setSelectedSong(data);
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSongChange = (event) => {
    const songId = Number(event.target.value);

    const song = librarySongs.find((song) => song.id === songId);

    setSelectedSong(song);
    setMatchingSongs([]);
  };

  const findMatchingSongs = () => {
    if (!selectedSong) {
      return;
    }

    const encodedCamelot = encodeURIComponent(selectedSong.camelot);

    fetch(`http://localhost:5001/api/library/compatible/${encodedCamelot}`)
      .then((response) => response.json())
      .then((data) => {
        const filteredSongs = data.filter(
          (song) =>
            song.id !== selectedSong.id &&
            !(
              song.title.toLowerCase() === selectedSong.title.toLowerCase() &&
              song.artist.toLowerCase() === selectedSong.artist.toLowerCase()
            ),
        );

        setMatchingSongs(filteredSongs);
      })
      .catch((error) => {
        console.error("Error fetching matching songs:", error);
      });
  };

  const sameKeySongs = matchingSongs.filter(
    (song) => song.camelot === selectedSong?.camelot,
  );

  const compatibleKeySongs = matchingSongs.filter(
    (song) => song.camelot !== selectedSong?.camelot,
  );

  const getTempoComparison = (song) => {
    if (!selectedSong || !Number(song.bpm) || !Number(selectedSong.bpm)) {
      return {
        difference: 0,
        relationship: "same tempo",
        equivalentBpm: Number(song.bpm) || 0,
      };
    }

    const selectedBpm = Number(selectedSong.bpm);
    const songBpm = Number(song.bpm);

    const possibilities = [
      { bpm: songBpm, relationship: "same tempo" },
      { bpm: songBpm / 2, relationship: "double-time" },
      { bpm: songBpm * 2, relationship: "half-time" },
    ];

    const closest = possibilities.reduce((best, current) =>
      Math.abs(current.bpm - selectedBpm) < Math.abs(best.bpm - selectedBpm)
        ? current
        : best,
    );

    const difference = Number((closest.bpm - selectedBpm).toFixed(1));

    // Only use half-time or double-time when the
    // equivalent tempo is within 10 BPM.
    if (closest.relationship !== "same tempo" && Math.abs(difference) > 10) {
      return {
        difference: Number((songBpm - selectedBpm).toFixed(1)),
        relationship: "same tempo",
        equivalentBpm: songBpm,
      };
    }

    return {
      difference,
      relationship: closest.relationship,
      equivalentBpm: Number(closest.bpm.toFixed(1)),
    };
  };

  const getBpmDifference = (song) => {
    return getTempoComparison(song).difference;
  };

  const bpmCompatible = (song) => {
    if (!selectedSong) {
      return false;
    }

    return Math.abs(getBpmDifference(song)) <= 10;
  };

  const getMatchStrength = (song) => {
    const tempo = getTempoComparison(song);
    const bpmDifference = Math.abs(tempo.difference);
    const sameKey = song.camelot === selectedSong?.camelot;

    let strength;

    if (sameKey && bpmDifference <= 5) {
      strength = "Excellent Match";
    } else if (sameKey && bpmDifference <= 10) {
      strength = "Good Match";
    } else if (!sameKey && bpmDifference <= 5) {
      strength = "Strong Compatible Match";
    } else if (!sameKey && bpmDifference <= 10) {
      strength = "Compatible Match";
    } else {
      strength = "Key Compatible — BPM Difference";
    }

    if (tempo.relationship !== "same tempo") {
      return `${strength} (${tempo.relationship})`;
    }

    return strength;
  };

  const sortByBpmDifference = (songs) => {
    return [...songs].sort(
      (a, b) => Math.abs(getBpmDifference(a)) - Math.abs(getBpmDifference(b)),
    );
  };

  const sameKeyAndBpmSongs = sameKeySongs.filter((song) => bpmCompatible(song));

  const sameKeyDifferentBpmSongs = sameKeySongs.filter(
    (song) => !bpmCompatible(song),
  );

  const compatibleKeyAndBpmSongs = compatibleKeySongs.filter((song) =>
    bpmCompatible(song),
  );

  const compatibleKeyDifferentBpmSongs = compatibleKeySongs.filter(
    (song) => !bpmCompatible(song),
  );

  return (
    <div>
      <h1>DJ Key Finder</h1>

      <h2>Search for a Song</h2>

      <form onSubmit={searchForSong}>
        <input
          type="text"
          placeholder="Enter song title"
          value={searchTitle}
          onChange={(event) => setSearchTitle(event.target.value)}
        />

        <input
          type="text"
          placeholder="Enter artist name"
          value={searchArtist}
          onChange={(event) => setSearchArtist(event.target.value)}
        />

        <button type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search Song"}
        </button>
      </form>
      {searchError && <p role="alert">{searchError}</p>}

      <h2>Select a Song</h2>

      <select onChange={handleSongChange} defaultValue="">
        <option value="" disabled>
          Choose a song
        </option>

        {librarySongs.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title} — {song.artist}
          </option>
        ))}
      </select>

      {selectedSong && (
        <div>
          <h2>Selected Song</h2>

          <p>Title: {selectedSong.title}</p>
          <p>Artist: {selectedSong.artist}</p>
          <p>
            Key: {selectedSong.key} · {selectedSong.camelot}
          </p>
          <p>BPM: {selectedSong.bpm}</p>

          <button onClick={addSongToLibrary}>Add to My Library</button>

          <button onClick={findMatchingSongs}>Find Matching Songs</button>
        </div>
      )}

      {matchingSongs.length > 0 && (
        <div>
          <h2>Matching Songs</h2>

          {sameKeyAndBpmSongs.length > 0 && (
            <div>
              <h3>Same Key + Similar BPM</h3>

              {sortByBpmDifference(sameKeyAndBpmSongs).map((song) => (
                <div key={song.id}>
                  <h4>{song.title}</h4>
                  <p>Artist: {song.artist}</p>
                  <p>
                    Key: {song.key} · {song.camelot}
                  </p>
                  <p>BPM: {song.bpm}</p>
                  <p>
                    BPM Difference: {getBpmDifference(song) > 0 ? "+" : ""}
                    {getBpmDifference(song)} BPM
                    {getTempoComparison(song).relationship !== "same tempo" && (
                      <span>
                        {" "}
                        (adjusted for {getTempoComparison(song).relationship})
                      </span>
                    )}
                  </p>
                  <p>Match: {getMatchStrength(song)}</p>
                </div>
              ))}
            </div>
          )}

          {sameKeyDifferentBpmSongs.length > 0 && (
            <div>
              <h3>Same Key + Different BPM</h3>

              {sortByBpmDifference(sameKeyDifferentBpmSongs).map((song) => (
                <div key={song.id}>
                  <h4>{song.title}</h4>
                  <p>Artist: {song.artist}</p>
                  <p>
                    Key: {song.key} · {song.camelot}
                  </p>
                  <p>BPM: {song.bpm}</p>
                  <p>
                    BPM Difference: {getBpmDifference(song) > 0 ? "+" : ""}
                    {getBpmDifference(song)} BPM
                  </p>
                  <p>Match: {getMatchStrength(song)}</p>
                </div>
              ))}
            </div>
          )}

          {compatibleKeyAndBpmSongs.length > 0 && (
            <div>
              <h3>Compatible Key + Similar BPM</h3>

              {sortByBpmDifference(compatibleKeyAndBpmSongs).map((song) => (
                <div key={song.id}>
                  <h4>{song.title}</h4>
                  <p>Artist: {song.artist}</p>
                  <p>
                    Key: {song.key} · {song.camelot}
                  </p>
                  <p>BPM: {song.bpm}</p>
                  <p>
                    BPM Difference: {getBpmDifference(song) > 0 ? "+" : ""}
                    {getBpmDifference(song)} BPM
                  </p>
                  <p>Match: {getMatchStrength(song)}</p>
                </div>
              ))}
            </div>
          )}

          {compatibleKeyDifferentBpmSongs.length > 0 && (
            <div>
              <h3>Compatible Key + Different BPM</h3>

              {sortByBpmDifference(compatibleKeyDifferentBpmSongs).map(
                (song) => (
                  <div key={song.id}>
                    <h4>{song.title}</h4>
                    <p>Artist: {song.artist}</p>
                    <p>
                      Key: {song.key} · {song.camelot}
                    </p>
                    <p>BPM: {song.bpm}</p>
                    <p>
                      BPM Difference: {getBpmDifference(song) > 0 ? "+" : ""}
                      {getBpmDifference(song)} BPM
                    </p>
                    <p>Match: {getMatchStrength(song)}</p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h2>My Library</h2>

        {librarySongs.length === 0 ? (
          <p>Your library is empty. Add a song to get started.</p>
        ) : (
          librarySongs.map((song) => (
            <div key={song.id}>
              <h3>{song.title}</h3>
              <p>Artist: {song.artist}</p>
              <p>
                Key: {song.key} · {song.camelot}
              </p>
              <p>BPM: {song.bpm}</p>
              <button onClick={() => deleteSong(song.id)}>
                Remove from Library
              </button>
            </div>
          ))
        )}
      </div>

      {selectedSong && matchingSongs.length === 0 && (
        <p>No matching songs found.</p>
      )}
    </div>
  );
}

export default App;
