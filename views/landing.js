const products = [
  {id:1,name:"جوراب ورزشی پاور",price:"129,000",category:"men",color:"مشکی",badge:"پرفروش"},
  {id:2,name:"جوراب مجی ساده",price:"139,000",category:"women",color:"سفید"},
  {id:3,name:"جوراب ساق سفید",price:"149,000",category:"men",color:"سفید"},
  {id:4,name:"جوراب نیم ساق",price:"149,000",category:"men",color:"طوسی",badge:"جدید"},
  {id:5,name:"جوراب کلاسیک",price:"149,000",category:"women",color:"سفید"},
  {id:6,name:"جوراب روزمره",price:"139,000",category:"men",color:"مشکی"},
  {id:7,name:"جوراب باکسی پاور",price:"399,000",category:"box",color:"ترکیبی",badge:"ویژه"},
  {id:8,name:"پک هدیه سه‌تایی",price:"349,000",category:"box",color:"مشکی"}
];

const grid = document.getElementById("productGrid");
const tabs = document.querySelectorAll("#productTabs button");

function renderProducts(filter="all"){
  const list = filter === "all" ? products : products.filter(p => p.category === filter);
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <button class="heart" aria-label="افزودن به علاقه‌مندی">♡</button>
      <div class="product-img">
        <div class="product-shape"></div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="price">${p.price} <span>تومان</span></div>
      </div>
    </article>
  `).join("");
}

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

renderProducts();

const menuBtn = document.getElementById("menuBtn");
const nav = document.querySelector(".main-nav");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

document.getElementById("newsletterForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = e.currentTarget.querySelector("input");
  alert(`ایمیل ${input.value} با موفقیت ثبت شد.`);
  input.value = "";
});
