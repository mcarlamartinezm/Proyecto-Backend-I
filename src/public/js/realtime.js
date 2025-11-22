const socket = io();
const list = document.getElementById("rt-list");

function renderList(products) {
  list.innerHTML = "";

  if (!products || !products.length) {
    list.innerHTML = `<li id="empty" class="muted">No hay productos cargados</li>`;
    return;
  }

  products.forEach((p) => {
    const li = document.createElement("li");
    li.className = "card";
    // usar _id (ObjectId) que envía el backend
    const pid = p._id ?? p.id ?? p.product ?? '';
    li.setAttribute("data-id", pid);

    li.innerHTML = `
      <div class="card-id">ID: ${pid}</div>
      <div class="card-media">
        <img src="${p.thumbnail ? p.thumbnail : "https://via.placeholder.com/400x400?text=Sin+imagen"}" alt="${p.title || "Producto"}">
      </div>
      <div class="card-body">
        <div class="title">${p.title ?? ""}</div>
        <div class="price">$ ${p.price ?? 0}</div>
        <div class="meta">
          ${(p.category ?? "")} · stock: ${(p.stock ?? 0)} · code: ${(p.code ?? "")} · status: ${(p.status ?? "")}
        </div>
        <p class="muted">${p.description ?? ""}</p>
      </div>
    `;
    list.appendChild(li);
  });
}

// unico handler para updates desde el servidor
socket.on("productsUpdated", (products) => {
  // si el servidor manda { payload: [...] } soportamos esa forma
  const arr = Array.isArray(products) ? products : (products.payload ?? products.docs ?? []);
  renderList(arr);
});


// ================= Form: Agregar producto (POST /api/products) ===============
const addForm = document.getElementById("add-form");
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = addForm.title.value.trim();
    const description = addForm.description.value.trim();
    const price = Number(addForm.price.value);
    const category = addForm.category.value.trim();
    const stock = Number(addForm.stock.value);

    const thumbnail = addForm.thumbnail.value.trim();
    const code = addForm.code.value.trim();
    const status = addForm.status.value === "true";

    if (!title || !description || isNaN(price) || !category || isNaN(stock)) {
      alert("Completa los campos obligatorios");
      return;
    }

    const body = { title, description, price, category, stock };
    if (thumbnail) body.thumbnail = thumbnail;
    if (code) body.code = code;
    body.status = status;

    try {
      const resp = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert(`Error al crear: ${err.error || resp.statusText}`);
        return;
      }

      addForm.reset();
    } catch (err) {
      alert("Error de red al crear producto");
    }
  });
}


// ============ Form: Eliminar producto (DELETE /api/products/:id) ============
const delForm = document.getElementById("del-form");
if (delForm) {
  delForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // ID como string (ObjectId), no Number
    const id = delForm.id.value.trim();
    if (!id) return;

    try {
      const resp = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert(`Error al eliminar: ${err.error || resp.statusText}`);
        return;
      }
      delForm.reset();
    } catch (err) {
      alert("Error de red al eliminar producto");
    }
  });
}


// ================== Form: Editar precio (PUT /api/products/:id) ==============
const editForm = document.getElementById("edit-price-form");
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editForm.id.value.trim();
    const price = Number(editForm.price.value);

    if (!id || isNaN(price)) return;

    try {
      const resp = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert(`Error al actualizar: ${err.error || resp.statusText}`);
        return;
      }
      editForm.reset();
    } catch (err) {
      alert("Error de red al actualizar precio");
    }
  });
}
