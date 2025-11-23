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

    const data = await resp.json();
    const products = Array.isArray(data) ? data : (data.payload ?? []);

    // ============ Render vacío
    if (!products.length) {
      list.innerHTML = `<li>El carrito está vacío</li>`;
      return;
    }

    // ============ Render productos
    products.forEach((p) => {
      const li = document.createElement("li");
      const pid = p.product && p.product._id ? p.product._id : p.product;
      li.textContent = `PID: ${pid} — Cantidad: ${p.quantity}`;
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>Error al cargar el carrito</li>`;
  }
});
