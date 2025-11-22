// AdminTheaters.tsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import axios, { THEATER_API_URL } from "@/api/api";

type Theater = {
  id: number | string;
  name: string;
  location: string;
  address?: string;
  screens?: number;
  seatingLayout?: { rows: number; seatsPerRow: number } | null;
  facilities?: string[];
};

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminTheaters: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Theater | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [screens, setScreens] = useState<number | "">("");
  const [rows, setRows] = useState<number | "">("");
  const [seatsPerRow, setSeatsPerRow] = useState<number | "">("");

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(THEATER_API_URL, { headers: getAuthHeader() });
      setTheaters(res.data || []);
    } catch (err) {
      console.error("Fetch theaters error:", err);
      toast.error("Failed to load theaters");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setAddress("");
    setScreens("");
    setRows("");
    setSeatsPerRow("");
    setEditing(null);
  };

  const handleAddTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        location,
        address,
        screens: Number(screens),
        seatingLayout: {
          rows: Number(rows) || 0,
          seatsPerRow: Number(seatsPerRow) || 0,
        },
      };
      const res = await axios.post(`${THEATER_API_URL}/admin`, payload, { headers: getAuthHeader() });
      setTheaters(prev => [res.data, ...prev]);
      toast.success("Theater added");
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      console.error("Add theater error:", err);
      toast.error("Failed to add theater");
    }
  };

  const handleEditClick = (t: Theater) => {
    setEditing(t);
    setName(t.name || "");
    setLocation(t.location || "");
    setAddress(t.address || "");
    setScreens(t.screens || "");
    setRows(t.seatingLayout?.rows || "");
    setSeatsPerRow(t.seatingLayout?.seatsPerRow || "");
    setIsEditOpen(true);
  };

  const handleUpdateTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        name,
        location,
        address,
        screens: Number(screens),
        seatingLayout: {
          rows: Number(rows) || 0,
          seatsPerRow: Number(seatsPerRow) || 0,
        },
      };
      const res = await axios.put(`${THEATER_API_URL}/admin/${editing.id}`, payload, { headers: getAuthHeader() });
      setTheaters(prev => prev.map(p => (String(p.id) === String(editing.id) ? res.data : p)));
      toast.success("Theater updated");
      setIsEditOpen(false);
      resetForm();
    } catch (err) {
      console.error("Update theater error:", err);
      toast.error("Failed to update theater");
    }
  };

  const handleDeleteTheater = async (id: number | string) => {
    if (!confirm("Delete this theater?")) return;
    try {
      await axios.delete(`${THEATER_API_URL}/${id}`, { headers: getAuthHeader() });
      setTheaters(prev => prev.filter(t => String(t.id) !== String(id)));
      toast.success("Theater deleted");
    } catch (err) {
      console.error("Delete theater error:", err);
      toast.error("Failed to delete theater");
    }
  };

  return (
    <Card className="p-6">
      {/* Title + Right-aligned Add button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Theater Management</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Theater
            </Button>
          </DialogTrigger>

          {/* Add Theater Dialog */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Theater</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddTheater} className="space-y-4">
              <div>
                <Label htmlFor="name">Theater Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="screens">Number of Screens</Label>
                  <Input id="screens" type="number" value={String(screens)} onChange={e => setScreens(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="rows">Rows</Label>
                  <Input id="rows" type="number" value={String(rows)} onChange={e => setRows(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <Label htmlFor="seatsPerRow">Seats Per Row</Label>
                <Input id="seatsPerRow" type="number" value={String(seatsPerRow)} onChange={e => setSeatsPerRow(Number(e.target.value))} />
              </div>

              <Button type="submit" className="w-full">Add Theater</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Theater Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Theater</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateTheater} className="space-y-4">
            <div>
              <Label htmlFor="name_edit">Theater Name</Label>
              <Input id="name_edit" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="location_edit">Location</Label>
              <Input id="location_edit" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="address_edit">Address</Label>
              <Input id="address_edit" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="screens_edit">Number of Screens</Label>
                <Input id="screens_edit" type="number" value={String(screens)} onChange={e => setScreens(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="rows_edit">Rows</Label>
                <Input id="rows_edit" type="number" value={String(rows)} onChange={e => setRows(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label htmlFor="seatsPerRow_edit">Seats Per Row</Label>
              <Input id="seatsPerRow_edit" type="number" value={String(seatsPerRow)} onChange={e => setSeatsPerRow(Number(e.target.value))} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save</Button>
              <Button type="button" variant="ghost" onClick={() => { setIsEditOpen(false); resetForm(); }}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Screens</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
            ) : theaters.length === 0 ? (
              <TableRow><TableCell colSpan={5}>No theaters found</TableCell></TableRow>
            ) : (
              theaters.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {t.location}
                    </div>
                  </TableCell>
                  <TableCell>{t.screens ?? "-"}</TableCell>
                  <TableCell>{(t.seatingLayout?.rows ?? 0) * (t.seatingLayout?.seatsPerRow ?? 0)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(t)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTheater(t.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default AdminTheaters;
