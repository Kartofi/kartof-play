function search() {
  if (document.getElementById("keyword").value.trim().length > 0) {
    window.location =
      "/search/" +
      document.getElementById("keyword").value +
      "/" +
      document.getElementById("select").value;
  } else {
    window.location = "/search/" + "Anime" + "/All";
  }
}
