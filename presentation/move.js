(() => {
  document.addEventListener("keydown", (event) => {
    const currentPageNumber = parseInt(
      window.location.pathname.split("/").pop().match(/(\d+)/)?.pop() ?? 0
    );
    let nextPageNumber;
    switch (event.key) {
      case "ArrowRight":
        nextPageNumber = currentPageNumber + 1;
        break;
      case "ArrowLeft":
        nextPageNumber = currentPageNumber - 1;
        break;
      default:
        return;
    }
    if (nextPageNumber <= 0) {
      window.location.replace("./index.html");
    } else {
      window.location.replace(`./slide${nextPageNumber}.html`);
    }
  });
})();
