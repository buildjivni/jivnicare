"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Operator {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export function OperatorManagement() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", role: "Receptionist" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/doctor/operators");
      const data = await res.json();
      if (data.success) {
        setOperators(data.operators);
      }
    } catch (e) {
      console.error("Failed to fetch operators", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOperator = async () => {
    setError(null);
    if (!formData.name.trim() || formData.name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Valid 10-digit phone number required.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/doctor/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Operator added successfully.");
        setFormData({ name: "", phone: "", role: "Receptionist" });
        fetchOperators();
      } else {
        setError(data.error || "Failed to add operator.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveOperator = async (id: string) => {
    if (!confirm("Are you sure you want to remove this operator?")) return;
    
    try {
      const res = await fetch(`/api/doctor/operators?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Operator removed.");
        setOperators(operators.filter(op => op.id !== id));
      } else {
        toast.error(data.error || "Failed to remove operator.");
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mt-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
        <div className="w-12 h-12 bg-blue-50 text-[#205E98] rounded-2xl flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Operator Management</h2>
          <p className="text-sm font-medium text-slate-500">Add receptionists or clinic staff to manage your queue.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* List of Operators */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Operators ({operators.length})</h3>
          
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : operators.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500 font-medium">No operators added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {operators.map(op => (
                <div key={op.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                      {op.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{op.name}</p>
                      <p className="text-xs font-medium text-slate-500">{op.phone} • {op.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveOperator(op.id)}
                    className="w-8 h-8 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                    title="Remove Operator"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Operator Form */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-fit">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Operator
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
              <Input 
                placeholder="e.g. Ramesh Kumar" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="bg-white"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobile Number</label>
              <Input 
                placeholder="10-digit mobile number" 
                maxLength={10}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                className="bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Receptionist">Receptionist</option>
                <option value="Clinic Manager">Clinic Manager</option>
              </select>
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            <Button 
              onClick={handleAddOperator}
              disabled={isAdding}
              className="w-full font-bold shadow-sm"
            >
              {isAdding ? "Adding..." : "Add Operator"}
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Operators can log in using their mobile number via OTP. They can manage the queue, add walk-ins, and call patients, but cannot change your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
