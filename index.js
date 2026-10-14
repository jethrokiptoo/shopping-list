document.addEventListener("DOMContentLoaded", () => {
  let items = JSON.parse(localStorage.getItem("bloomBasketItems") || "[]");

  const form = document.querySelector("#shopping-form");
  const nameInput = document.querySelector("#item-name");
  const priceInput = document.querySelector("#item-price");
  const search = document.querySelector("#search");
  const list = document.querySelector("#shopping-list");

  function render() {
    list.replaceChildren();
    const filtered = items.filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()));
    filtered.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - KSh ${item.price} `;
      if (item.purchased) li.style.textDecoration = "line-through";
      const buy = document.createElement("button");
      buy.textContent = item.purchased ? "Undo" : "Purchased";
      buy.onclick = () => { item.purchased = !item.purchased; save(); render(); };
      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.onclick = () => { items = items.filter(i => i.id !== item.id); save(); render(); };
      li.append(buy, remove);
      list.appendChild(li);
    });
    const spent = items.filter(i => i.purchased).reduce((sum, i) => sum + i.price, 0);
    document.querySelector("#total").textContent = `KSh ${spent}`;
    document.querySelector("#count").textContent = items.length;
    document.querySelector("#bought").textContent = items.filter(i => i.purchased).length;
    document.querySelector("#remaining").textContent = items.filter(i => !i.purchased).length;
  }

  function save() {
    localStorage.setItem("bloomBasketItems", JSON.stringify(items));
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    if (!name || priceInput.value.trim() === "" || !Number.isFinite(price) || price < 0) return alert("Enter a valid item and price.");
    items.push({ id: String(Date.now()) + Math.random(), name, price, purchased: false });
    save();
    form.reset();
    render();
  });

  search.addEventListener("input", render);
  document.querySelector("#clear").addEventListener("click", () => {
    if (confirm("Clear your shopping list?")) { items = []; save(); render(); }
  });
  render();
});
