import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
} from "../features/address/addressSlice";
import Loader from "../components/Loader";
import type { Address } from "../types";

const emptyForm = { line1: "", city: "", state: "", pincode: "" };

export default function Addresses() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.address);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, setState happens after await, not synchronously
    dispatch(fetchAddresses());
  }, [dispatch]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dispatch(updateAddress({ id: editingId, data: form })).unwrap();
        toast.success("Address updated");
      } else {
        await dispatch(createAddress(form)).unwrap();
        toast.success("Address added");
      }
      resetForm();
    } catch {
      toast.error("Could not save address");
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({ line1: addr.line1, city: addr.city, state: addr.state, pincode: addr.pincode });
    setEditingId(addr._id);
    setShowForm(true);
  };

  if (status === "loading" && items.length === 0) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-ink text-white rounded-full px-4 py-2 hover:bg-signal transition-colors"
          >
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-mist rounded-xl p-5 mb-6 grid gap-3">
          {(["line1", "city", "state", "pincode"] as const).map((field) => (
            <input
              key={field}
              required
              placeholder={field === "line1" ? "Address line" : field[0].toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          ))}
          <div className="flex gap-2 mt-1">
            <button type="submit" className="bg-ink text-white rounded-full px-5 py-2 text-sm hover:bg-signal transition-colors">
              {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="border border-mist rounded-full px-5 py-2 text-sm hover:border-slate">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-2">
        {items.map((addr) => (
          <div key={addr._id} className="border border-mist rounded-xl p-4">
            <p className="text-sm leading-relaxed">
              {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
              {addr.isDefault && <span className="ml-2 text-xs text-signal font-medium">Default</span>}
            </p>
            <div className="flex gap-4 mt-2 text-xs">
              <button onClick={() => handleEdit(addr)} className="text-slate hover:text-ink font-medium">Edit</button>
              <button onClick={() => dispatch(removeAddress(addr._id))} className="text-slate hover:text-danger font-medium">Delete</button>
              {!addr.isDefault && (
                <button onClick={() => dispatch(setDefaultAddress(addr._id))} className="text-slate hover:text-ink font-medium">
                  Set as default
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && !showForm && (
          <p className="text-slate text-sm">No addresses saved yet.</p>
        )}
      </div>
    </div>
  );
}