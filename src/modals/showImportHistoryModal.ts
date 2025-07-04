export function showImportHistoryModal(onImport: (file: File) => void) {
  Spicetify.PopupModal.display({
    title: "Import History",
    content: `
      <div id="import_history_modal">
        <div class="fileInputContainer">
          <label for="import_file_input" class="custom-file-upload">&#10514;</label>
          <input 
            id="import_file_input" 
            type="file" 
            name="file" 
            accept=".json"
            required 
          />
        </div>
        <button id="import_history_button">Import</button>
      </div>
    `,
  });

  setTimeout(() => {
    const container = document.querySelector(".main-trackCreditsModal-container");
    const modal = document.getElementById("import_history_modal") as HTMLDivElement;
    const input = document.getElementById("import_file_input") as HTMLInputElement;
    const button = document.getElementById("import_history_button") as HTMLButtonElement;

    if (!container || !modal || !input || !button) {
      Spicetify.showNotification("Modal not found");
      return;
    }

    container.classList.add("importHistoryModalContainer");
    modal.classList.add("importHistoryModal");
    input.classList.add("fileInput");
    button.classList.add("importButton");

    button.addEventListener("click", () => {
      if (!input.files || input.files.length === 0) {
        Spicetify.showNotification("Please select a file");
        return;
      }
      onImport(input.files[0]);
    });
  }, 100);
}
