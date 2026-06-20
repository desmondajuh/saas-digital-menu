"use client";

import { useEffect, useState } from "react";
import { getPublicMenu } from "@/app/actions/menus";
import { createOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PublicMenuView({ slug }: { slug: string }) {
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMenu();
  }, [slug]);

  async function loadMenu() {
    try {
      const data = await getPublicMenu(slug);
      setMenu(data);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCart((prev) =>
        prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!checkoutData.name || !checkoutData.email) {
        alert("Name and email are required");
        return;
      }

      if (cart.length === 0) {
        alert("Please add items to your order");
        return;
      }

      const orderId = await createOrder({
        establishmentId: menu.establishment.id,
        customerName: checkoutData.name,
        customerEmail: checkoutData.email,
        customerPhone: checkoutData.phone,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        notes: checkoutData.notes,
      });

      alert("Order placed successfully! Order ID: " + orderId);
      setCart([]);
      setCheckoutData({ name: "", email: "", phone: "", notes: "" });
      setShowCheckout(false);
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="text-center py-12 bg-background">
        <p className="text-muted-foreground">Menu not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {menu.establishment.name}
          </h1>
          {menu.establishment.description && (
            <p className="text-lg text-muted-foreground">
              {menu.establishment.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-8">
            {menu.menus.map((m: any) => (
              <div key={m.id}>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {m.name}
                </h2>
                {m.description && (
                  <p className="text-muted-foreground mb-4">{m.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {m.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-card border rounded-lg p-4 hover:shadow-lg transition"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <span className="text-lg font-bold text-primary">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.category && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.category}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                      )}
                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full"
                        disabled={!item.isAvailable}
                      >
                        {item.isAvailable ? "Add to Order" : "Not Available"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Order Summary
              </h3>

              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Your order is empty
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex justify-between items-start pb-3 border-b"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItemId, item.quantity - 1)
                            }
                            className="bg-accent text-foreground px-2 py-1 rounded text-sm"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItemId, item.quantity + 1)
                            }
                            className="bg-accent text-foreground px-2 py-1 rounded text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-foreground">Items:</span>
                      <span className="font-semibold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowCheckout(!showCheckout)}
                    className="w-full"
                  >
                    {showCheckout ? "Hide Checkout" : "Checkout"}
                  </Button>
                </>
              )}

              {showCheckout && cart.length > 0 && (
                <form onSubmit={handleCheckout} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={checkoutData.name}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 border border-input rounded text-sm bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={checkoutData.email}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 border border-input rounded text-sm bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={checkoutData.phone}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 border border-input rounded text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Special Requests
                    </label>
                    <textarea
                      value={checkoutData.notes}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          notes: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-2 py-1 border border-input rounded text-sm bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
