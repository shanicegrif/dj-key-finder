# DJ Key Finder 🎧

DJ Key Finder is a web application designed to help DJs and music enthusiasts discover songs that work well together. Search for a song to retrieve its musical key and BPM (beats per minute), explore harmonically compatible tracks using the Camelot Wheel, and build a personal song library.

## ✨ Features

* **Song Search:** Search for tracks by title and artist.
* **Musical Key Detection:** Retrieve a song's musical key and corresponding Camelot notation.
* **BPM Analysis:** View a track's tempo in beats per minute.
* **Harmonic Matching:** Find songs with compatible keys to help plan smoother DJ transitions.
* **Personal Library:** Add songs to a library, view saved tracks, and remove songs when needed.
* **Persistent Storage:** Keep saved songs available between backend restarts using local JSON file storage.

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* HTML and CSS

**Backend**

* Node.js
* Express.js
* MeloData API for music metadata and audio analysis

**Other Tools**

* Git and GitHub
* Camelot Wheel harmonic mixing system
* JSON-based local storage

## 🚀 Getting Started

### Prerequisites

Before running the application, make sure you have installed:

* [Node.js](https://nodejs.org/)
* npm (included with Node.js)
* A MeloData API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shanicegrif/dj-key-finder.git
   cd dj-key-finder
   ```

2. Install the backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file inside the `backend` folder and add your MeloData API key using the environment variable name expected by your backend code.

4. Start the backend server:

   ```bash
   npm start
   ```

   If your backend uses a different start script, check `backend/package.json`.

5. Open a second terminal and install the frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

6. Start the frontend development server:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite in your browser.

## 🔐 Security Notes

* API credentials should be stored in environment variables and never committed to GitHub.
* Local library data is excluded from version control.
* Keep `.env` and other files containing private information out of public repositories.

## 📚 What I Learned

Building DJ Key Finder has given me hands-on experience with:

* Developing a React frontend that communicates with an Express backend.
* Designing and working with REST API endpoints.
* Retrieving and processing music metadata and audio-analysis results.
* Implementing music-key conversion and harmonic compatibility logic.
* Managing persistent application data.
* Using Git and GitHub for source control and project management.

## 🔮 Future Improvements

* Deploy the application so others can use it online.
* Improve the presentation of compatible-song recommendations.
* Add more filtering and sorting options for saved tracks.
* Refine the user interface for a smoother DJ workflow.

## 👩🏽‍💻 Author

**Shanice Griffin**

[GitHub Profile](https://github.com/shanicegrif)

---

*Built as a personal project combining web development, music, and harmonic mixing.*

