import { useState } from "react";
import { motion } from "framer-motion";

const products = [
  {
    id: 1,
    name: "Dell Inspiron Laptop",
    price: 999,
    oldPrice: 1199,
    rating: 4.4,
    buyers: "2k+ bought recently",
    image: "https://m.media-amazon.com/images/I/61Qe0euJJZL._SL1000_.jpg",
    category: "Electronics"
  },
  {
    id: 2,
    name: "Sony Wireless Headphones",
    price: 149,
    oldPrice: 199,
    rating: 4.6,
    buyers: "5k+ bought recently",
    image: "https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg",
    category: "Audio"
  },
  {
    id: 3,
    name: "iPhone Protective Case",
    price: 29,
    oldPrice: 49,
    rating: 4.1,
    buyers: "8k+ bought recently",
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=300&q=80",
    category: "Accessories"
  },
  {
    id: 4,
    name: "LG Full HD Monitor",
    price: 449,
    oldPrice: 599,
    rating: 4.5,
    buyers: "1k+ bought recently",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80",
    category: "Electronics"
  },
  {
    id: 5,
    name: "Logitech Wireless Mouse",
    price: 39,
    oldPrice: 59,
    rating: 4.3,
    buyers: "10k+ bought recently",
    image: "https://m.media-amazon.com/images/I/61LtuGzXeaL._SL1500_.jpg",
    category: "Accessories"
  },
  {
    id: 6,
    name: "Kindle Reader",
    price: 44,
    oldPrice: 59,
    rating: 4.3,
    buyers: "5k+ bought recently",
    image: "https://m.media-amazon.com/images/I/61Iz2yy2CKL._SL1000_.jpg",
    category: "Books"
  },
  {
    id: 7,
    name: "JBL Bluetooth Speaker",
    price: 69,
    oldPrice: 99,
    rating: 4.5,
    buyers: "6k+ bought recently",
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=300&q=80",
    category: "Audio"
  },
  {
  id: 8,
  name: "Canon DSLR Camera",
  price: 499,
  oldPrice: 649,
  rating: 4.7,
  buyers: "4k+ bought recently",
  image: "https://m.media-amazon.com/images/I/914hFeTU2-L._SL1500_.jpg",
  category: "Electronics"
},
  {
    id: 9,
    name: "USB-C Fast Charger",
    price: 25,
    oldPrice: 39,
    rating: 4.2,
    buyers: "4k+ bought recently",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80",
    category: "Accessories"
  },
  {
    id: 10,
    name: "External SSD",
    price: 99,
    oldPrice: 129,
    rating: 4.6,
    buyers: "1k+ bought recently",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=300&q=80",
    category: "Storage"
  },
  {
    id: 11,
    name: "Laptop Stand",
    price: 35,
    oldPrice: 49,
    rating: 4.0,
    buyers: "7k+ bought recently",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80",
    category: "Accessories"
  },
  {
    id: 12,
    name: "RGB Desk Lamp",
    price: 44,
    oldPrice: 59,
    rating: 4.3,
    buyers: "5k+ bought recently",
    image: "https://m.media-amazon.com/images/I/61Iz2yy2CKL._SL1000_.jpg",
    category: "Home"
  },
  {
    id: 13,
    name: "Portable HDD",
    price: 85,
    oldPrice: 110,
    rating: 4.4,
    buyers: "3k+ bought recently",
    image: "https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg",
    category: "Storage"
  }
];

export default function CartPanel({ session, updateSession }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Electronics", "Audio", "Accessories", "Storage", "Home"];

  const filteredProducts = products.filter((p) => {
    const bySearch = p.name.toLowerCase().includes(search.toLowerCase());
    const byCategory = filter === "All" || p.category === filter;
    return bySearch && byCategory;
  });

  const addToCart = (product) => {
    const existing = session.cart.find((i) => i.id === product.id);

    let newCart;
    if (existing) {
      newCart = session.cart.map((i) =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      );
    } else {
      newCart = [...session.cart, { ...product, qty: 1 }];
    }

    updateSession({ ...session, cart: newCart });
  };

  const changeQty = (id, type) => {
    let newCart = session.cart.map((item) => {
      if (item.id === id) {
        if (type === "plus") return { ...item, qty: item.qty + 1 };
        if (type === "minus") return { ...item, qty: Math.max(item.qty - 1, 1) };
      }
      return item;
    });

    updateSession({ ...session, cart: newCart });
  };

  const removeItem = (id) => {
    updateSession({
      ...session,
      cart: session.cart.filter((i) => i.id !== id),
      removedAfterCoupon: session.coupons.length > 0
    });
  };

  const applyCoupon = (code) => {
  // Allow stacking same coupon multiple times to show fraud
  updateSession({ ...session, coupons: [...session.coupons, code] });
};

  const rawSubtotal = session.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  let discountPercent = 0;
session.coupons.forEach(code => {
  if (code === "SAVE10") discountPercent += 10;
  if (code === "VIP50") discountPercent += 50;
  if (code === "SUMMER20") discountPercent += 20;
});
if (discountPercent > 80) discountPercent = 80; // max cap

  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = Math.max(rawSubtotal - discountAmount, 0);

  return (
    <div className="h-screen overflow-y-auto bg-slate-100">
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-5 sticky top-0 z-50 shadow-xl">
        <h1 className="text-4xl font-bold text-white tracking-wide">CartIQ Commerce</h1>
        <p className="text-lg mt-1 text-slate-300">Session: {session.id} | Status: {session.status}</p>

        <input
          type="text"
          placeholder="Search products..."
          cclassName="mt-4 w-full p-4 rounded-xl bg-gray-100 text-black outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 mt-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
             className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
  filter === cat
    ? "bg-cyan-400 text-black"
    : "bg-slate-700 text-slate-200"
}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 text-cyan-300 p-4 text-lg border-b border-slate-700">
AI Secured Shopping • Smart Coupon Intelligence • Real-Time Fraud Detection Enabled
</div>

      <div className="p-3">
        {filteredProducts.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-xl shadow-md p-5 mb-4 flex items-center gap-8 min-h-[180px]"
          >
            <img
              src={p.image}
              className="w-36 h-36 object-contain rounded-lg bg-white"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=Product";
              }}
            />

            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-black">{p.name}</h2>

              <p className="text-gray-500 mt-1">
                ⭐ {p.rating} | {p.buyers}
              </p>

              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <p className="text-3xl font-bold text-black">${p.price}</p>
                <p className="line-through text-gray-400 text-xl">${p.oldPrice}</p>
                <span className="text-green-600 font-bold text-lg">
                  {Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% OFF
                </span>
              </div>

              {discountPercent > 0 && (
                <p className="text-green-600 font-bold mt-2">
                  Coupon Savings Active: {discountPercent}% OFF
                </p>
              )}
            </div>

            <button
              onClick={() => addToCart(p)}
              className="bg-yellow-400 hover:bg-yellow-300 px-8 py-3 rounded-lg text-2xl font-bold"
            >
              Add
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-4 border-t">
        <h2 className="text-3xl font-bold mb-3">🛒 Cart Summary</h2>

        {session.cart.length === 0 ? (
          <p className="text-gray-500">No items added</p>
        ) : (
          session.cart.map((item) => (
            <div key={item.id} className="border-b py-3 flex justify-between items-center">
              <div>
                <h3 className="text-xl">{item.name}</h3>
                <p className="text-gray-500">${item.price} × {item.qty}</p>
              </div>

              <div className="flex gap-2 items-center">
                <button onClick={() => changeQty(item.id, "minus")} className="bg-red-500 text-white px-3 py-1 rounded">-</button>
                <span>{item.qty}</span>
                <button onClick={() => changeQty(item.id, "plus")} className="bg-green-500 text-white px-3 py-1 rounded">+</button>
                <button onClick={() => removeItem(item.id)} className="bg-slate-600 text-white px-3 py-1 rounded">x</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-4 border-t">
        <h2 className="text-2xl font-bold mb-3">Available Coupons</h2>

        <div className="flex gap-3">
          <button onClick={() => applyCoupon("SAVE10")} className="bg-orange-500 text-white px-5 py-2 rounded-lg text-xl">SAVE10</button>
          <button onClick={() => applyCoupon("VIP50")} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-xl">VIP50</button>
          <button onClick={() => applyCoupon("SUMMER20")} className="bg-green-600 text-white px-5 py-2 rounded-lg text-xl">SUMMER20</button>
        </div>

        <p className="mt-3 text-lg">Applied: {session.coupons.join(", ") || "None"}</p>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
        <p className="text-md text-slate-500">Original Price: ${rawSubtotal}</p>
<p className="text-md text-green-600">Discount Applied: {discountPercent}%</p>
<p className="text-3xl font-bold text-slate-800">Final Price: ${subtotal}</p>

        <button className="w-full mt-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg text-xl">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
