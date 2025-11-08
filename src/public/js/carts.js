// ============ Cliente Carts: buscar y renderizar carrito por ID
const form = document.getElementById("cart-form");
const list = document.getElementById("cart-list");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ============ Leer ID
  const id = document.getElementById("cartId").value.trim();
  if (!id) return;

  // ============ Limpiar lista
  list.innerHTML = "";

  try {
    // ============ Llamar a la API
    const resp = await fetch(`/api/carts/${id}`);
    if (!resp.ok) {
      list.innerHTML = `<li>Carrito no encontrado</li>`;
      return;
    }

    const products = await resp.json();

    // ============ Render vacío
    if (!products.length) {
      list.innerHTML = `<li>El carrito está vacío</li>`;
      return;
    }

    // ============ Render productos
    products.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `PID: ${p.product} — Cantidad: ${p.quantity}`;
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>Error al cargar el carrito</li>`;
  }
});
