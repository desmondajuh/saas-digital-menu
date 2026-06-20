"use client";

import { useEffect, useState } from "react";
import { getMenuById, getMenuItems, createMenuItem } from "@/app/actions/menus";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  id: string;
  menuId: string;
};

export default function MenuView({ id, menuId }: Props) {
  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    loadData();
  }, [menuId]);

  async function loadData() {
    try {
      const [menuData, itemsData] = await Promise.all([
        getMenuById(menuId),
        getMenuItems(menuId),
      ]);
      setMenu(menuData);
      setItems(itemsData);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.price) {
        alert("Name and price are required");
        return;
      }

      await createMenuItem({
        menuId: menuId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
      });

      setFormData({ name: "", description: "", price: "", category: "" });
      setShowAddItem(false);
      loadData();
    } catch (error) {
      console.error("Failed to create menu item:", error);
      alert("Failed to create menu item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );
  }

  if (!menu) {
    return <div className="text-center py-12">Menu not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/establishments/${id}`}>
          <Button variant="outline" size="sm">
            ← Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-4 mb-2">
          {menu.name}
        </h1>
        {menu.description && (
          <p className="text-muted-foreground">{menu.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Items</h2>
        <Button onClick={() => setShowAddItem(!showAddItem)}>
          {showAddItem ? "Cancel" : "Add Item"}
        </Button>
      </div>

      {showAddItem && (
        <div className="bg-card border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Caesar Salad"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="9.99"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Appetizers"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the item..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <Button type="submit" className="w-full">
              Add Item
            </Button>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">No items yet</p>
          <Button onClick={() => setShowAddItem(true)}>Add First Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
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
              <Button variant="outline" size="sm" className="w-full">
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
