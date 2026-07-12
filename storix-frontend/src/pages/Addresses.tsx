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

  const handleDelete = async (id: string) => {
    try {
      await dispatch(removeAddress(id)).unwrap();
      toast.success("Address removed");
    } catch {
      toast.error("Could not remove address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();
      toast.success("Default address updated");
    } catch {
      toast.error("Could not set default");
    }
  };

  if (status === "loading" && items.length === 0) return <Loader />;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Addresses</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-black text-white px-3 py-1.5 rounded text-sm">
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded p-4 mb-4 flex flex-col gap-2">
          <input
            required
            placeholder="Address line"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            required
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            required
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {items.map((addr) => (
          <div key={addr._id} className="border rounded p-3">
            <p className="text-sm">
              {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
              {addr.isDefault && <span className="ml-2 text-xs text-green-600">(default)</span>}
            </p>
            <div className="flex gap-3 mt-2 text-sm">
              <button onClick={() => handleEdit(addr)} className="underline">Edit</button>
              <button onClick={() => handleDelete(addr._id)} className="text-red-600 underline">Delete</button>
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr._id)} className="underline">
                  Set as default
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && !showForm && (
          <p className="text-gray-500 text-sm">No addresses yet.</p>
        )}
      </div>
    </div>
  );
}