const products = [
  { name: "Laptop", category: "electronics", price: 49999 },
  { name: "Shirt", category: "clothing", price: 799 },
  { name: "Headphones", category: "electronics", price: 1999 }
];

document.getElementById('filter').addEventListener('change', (e) => {
  const selected = e.target.value;
  const filtered = selected === 'all' ? products : products.filter(p => p.category === selected);
  renderProducts(filtered);
});

function renderProducts(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = products.map(p => `
    <div class="p-5 border rounded-xl shadow-md bg-white hover:shadow-lg hover:-translate-y-1 transition">
      <h3 class="text-lg font-bold text-gray-900">${p.name}</h3>
      <p class="text-sm text-gray-500 capitalize">${p.category}</p>
      <p class="text-indigo-600 font-semibold mt-2">₹${p.price.toLocaleString("en-IN")}</p>
    </div>
  `).join('');
}
renderProducts(products);