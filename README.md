# Spicetify History
A custom Spicetify app that tracks your Spotify listening history.

## 📖 About
Spicetify History is a custom Spicetify app designed to enhance your listening experience on Spotify. It tracks the songs you've played, providing a detailed history with timestamps. The app offers useful features such as sorting options, song management, and export functionality. You can organize your history, delete songs, or export your data for backup. With seamless integration into Spicetify’s themes, it’s fully customizable to match your style while providing a personalized way to interact with your music history.

## ✨ Features
- 📌 Persistent history — Tracks songs even after restarting Spotify.
- 🔄 Sortable list — Sort songs by title, album, duration, or listen date.
- 🎵 Play & Pause — Resume or restart any song directly from the history list.
- 🗑 Manage history — Delete individual songs or clear your entire history.
- 💾 Export history — Save your listening history as a json file for backup.
- 🎨 Theme adaptability — Integrates seamlessly with Spicetify's themes.

## 📦 Installation
### 1️⃣ Install Spicetify
- If you haven't already installed Spicetify, follow the installation guide.
### 2️⃣ Download & Install Spicetify History
1. Go to the Releases page and download the latest version.
2. Extract the downloaded folder.
3. Change the folder name to "spicetify-history".
### 3️⃣ Move to Spicetify's Custom Apps Folder
- **On Windows:** Move the extracted folder to:  
  ```sh
  %appdata%\spicetify\CustomApps\
- **On Linux/macOS:** Move the extracted folder to:
  ```sh
  ~/.config/spicetify/CustomApps/
### 4️⃣ Enable and Apply the Custom App
- Run the following commands:
  ```sh
    spicetify config custom_apps spicetify-history
    spicetify apply
  ```

