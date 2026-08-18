const productTabs = document.getElementById("productTabs");
const productGrid = document.getElementById("productGrid");

if (productTabs && productGrid) {
  const tabs = productTabs.querySelectorAll("button");

  const products = productGrid.querySelectorAll(".product-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;

      tabs.forEach((item) => {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      products.forEach((product) => {
        const category = product.dataset.category;

        if (filter === "all" || category === filter) {
          product.style.display = "";
        } else {
          product.style.display = "none";
        }
      });
    });
  });
}
