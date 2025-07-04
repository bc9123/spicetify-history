import { OptionsModalCallback } from "../types/spicetify-history";

export function showOptionsModal({ pageSize, pageNavigationType, displayedHistoryType, onConfirm }: OptionsModalCallback) {
  Spicetify.PopupModal.display({
    title: "Display Options",
    content: `
      <div class="optionsModal">
        <div class="optionsContainer">
          <div class="optionItem">
            <label class="optionLabel">Navigation type: </label>
            <div class="navigationOptions">
              <input type="radio" name="navigationType" value="Pagination" id="paginationNavigation">
              <label for="paginationNavigation" class="optionRadioLabel">Pagination</label>

              <input type="radio" name="navigationType" value="Infinite Scroll" id="infiniteScrollNavigation">
              <label for="infiniteScrollNavigation" class="optionRadioLabel">Infinite Scroll</label>
            </div>
          </div>
          <div class="optionItem">
            <label class="optionLabel">Songs per page: </label>
            <select class="optionSelect" id="pageSizeSelect">
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="150">150</option>
              <option value="200">200</option>
            </select>
          </div>
          <div class="optionItem">
            <label class="optionLabel">Displayed History Type: </label>
            <div class="displayedHistoryTypeOptions">
              <input type="radio" name="displayedHistoryType" value="Song" id="typeSong">
              <label for="typeSong" class="optionRadioLabel">Song</label>

              <input type="radio" name="displayedHistoryType" value="Album" id="typeAlbum">
              <label for="typeAlbum" class="optionRadioLabel">Album</label>
            </div>
          </div>
        </div>
        <button id="option_confirm_button">Confirm</button>
      </div>
    `,
  });

  setTimeout(() => {
    const container = document.querySelector(".main-trackCreditsModal-container");
    const modal = document.querySelector(".optionsModal") as HTMLDivElement;
    const pageSizeSelect = document.getElementById("pageSizeSelect") as HTMLSelectElement;
    const navPaginationRadio = document.getElementById("paginationNavigation") as HTMLInputElement;
    const navInfiniteRadio = document.getElementById("infiniteScrollNavigation") as HTMLInputElement;
    const typeSongRadio = document.getElementById("typeSong") as HTMLInputElement;
    const typeAlbumRadio = document.getElementById("typeAlbum") as HTMLInputElement;
    const confirmBtn = document.getElementById("option_confirm_button") as HTMLButtonElement;

    if (!container || !modal || !confirmBtn) {
      Spicetify.showNotification("Modal not found");
      return;
    }

    container.classList.add("optionsModalContainer");
    modal.classList.add("optionsModal");
    confirmBtn.classList.add("confirmButton");

    pageSizeSelect.value = pageSize.toString();

    if (pageNavigationType === "pagination") {
      navPaginationRadio.checked = true;
      navInfiniteRadio.checked = false;
    } else {
      navPaginationRadio.checked = false;
      navInfiniteRadio.checked = true;
    }

    if (displayedHistoryType === "song") {
      typeSongRadio.checked = true;
      typeAlbumRadio.checked = false;
    } else {
      typeSongRadio.checked = false;
      typeAlbumRadio.checked = true;
    }

    confirmBtn.addEventListener("click", () => {
      const pageSize = parseInt(pageSizeSelect.value, 10);
      const pageNavigationType = navPaginationRadio.checked ? "pagination" : "infiniteScroll";
      const displayedHistoryType = typeAlbumRadio.checked ? "album" : "song";

      onConfirm({ pageSize, pageNavigationType, displayedHistoryType });
      Spicetify.PopupModal.hide();
    });
  }, 100);
}
