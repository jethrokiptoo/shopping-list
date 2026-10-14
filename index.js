
document.addEventListener("DOMContentLoaded", () => {
  // 1. Create the shopping list array
  let items = [];

  // 2. Load saved items
  try {
    items = JSON.parse(
      localStorage.getItem("bloomBasketItems") || "[]"
    );

    if (
      !Array.isArray(items) ||
      !items.every(
        item =>
          item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.price === "number" &&
          Number.isFinite(item.price) &&
          item.price >= 0 &&
          typeof item.purchased === "boolean"
      )
    ) {
      items = [];
    }
  } catch {
    items = [];
  }

  // 3. Create the webpage interface
 

  // 4. Get the elements we need
  const form = document.querySelector("#shopping-form");
  const nameInput = document.querySelector("#item-name");
  const priceInput = document.querySelector("#item-price");
  const searchInput = document.querySelector("#search");
  const list = document.querySelector("#shopping-list");
  const emptyMessage = document.querySelector("#empty");
  const status = document.querySelector("#status");

  const money = amount =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES"
    }).format(amount);

  // 5. Save the shopping list
  function saveItems() {
    try {
      localStorage.setItem(
        "bloomBasketItems",
        JSON.stringify(items)
      );
      status.textContent = "✓ Shopping list saved!";
    } catch {
      status.textContent = "Could not save. Check browser storage.";
    }
  }

  // 6. Display items and update the dashboard
  function renderItems() {
    list.replaceChildren();

    const search = searchInput.value.trim().toLowerCase();

    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(search)
    );

    emptyMessage.hidden = filteredItems.length > 0;

    if (items.length === 0) {
      emptyMessage.textContent =
        "Your basket is empty. Add your first item!";
    } else {
      emptyMessage.textContent = "No matching items found.";
    }

    filteredItems.forEach(item => {
      const li = document.createElement("li");
      li.className = "shopping-item";

      if (item.purchased) {
        li.classList.add("purchased");
      }

      const details = document.createElement("div");
      details.className = "details";

      const name = document.createElement("strong");
      name.textContent = item.name;

      const price = document.createElement("span");
      price.textContent = money(item.price);

      details.append(name, price);

      const actions = document.createElement("div");
      actions.className = "actions";

      const buyButton = document.createElement("button");
      buyButton.textContent = item.purchased
        ? "Undo"
        : "Purchased";

      buyButton.addEventListener("click", () => {
        item.purchased = !item.purchased;
        saveItems();
        renderItems();
      });

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        const newName = prompt("New item name:", item.name);

        if (newName === null) return;

        if (!newName.trim()) {
          alert("Please enter an item name.");
          return;
        }

        const newPriceText = prompt(
          "New price in KSh:",
          String(item.price)
        );

        if (newPriceText === null) return;

        const newPrice = Number(newPriceText.trim());

        if (
          !newPriceText.trim() ||
          !Number.isFinite(newPrice) ||
          newPrice < 0
        ) {
          alert("Enter a valid price of zero or more.");
          return;
        }

        item.name = newName.trim();
        item.price = newPrice;

        saveItems();
        renderItems();
      });

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";

      removeButton.addEventListener("click", () => {
        items = items.filter(current => current.id !== item.id);
        saveItems();
        renderItems();
      });

      actions.append(buyButton, editButton, removeButton);
      li.append(details, actions);
      list.appendChild(li);
    });

    // Calculate shopping statistics
    const purchased = items.filter(item => item.purchased);
    const remaining = items.length - purchased.length;

    const spent = purchased.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const percentage = items.length
      ? Math.round((purchased.length / items.length) * 100)
      : 0;

    document.querySelector("#total").textContent = money(spent);
    document.querySelector("#count").textContent = items.length;
    document.querySelector("#bought").textContent = purchased.length;
    document.querySelector("#remaining").textContent = remaining;
    document.querySelector("#progress").style.width =
      `${percentage}%`;
    document.querySelector("#progress-text").textContent =
      `${percentage}% completed`;
  }

  // 7. Add a new item
  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const priceText = priceInput.value.trim();
    const price = Number(priceText);

    if (!name) {
      alert("Please enter an item name.");
      return;
    }

    if (
      !priceText ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert("Please enter a valid price of zero or more.");
      return;
    }

    items.push({
      id: `${Date.now()}-${Math.random()}`,
      name,
      price,
      purchased: false
    });

    saveItems();
    form.reset();
    renderItems();
    nameInput.focus();
  });

  // 8. Search items
  searchInput.addEventListener("input", renderItems);

  // 9. Clear the list
  document.querySelector("#clear").addEventListener("click", () => {
    if (items.length === 0) {
      alert("Your list is already empty.");
      return;
    }

    if (confirm("Clear your entire shopping list?")) {
      items = [];
      saveItems();
      renderItems();
    }
  });

  // 10. Add the design
  const style = document.createElement("style");


  document.head.appendChild(style);

  // 11. Show saved items on startup
  renderItems();
});
