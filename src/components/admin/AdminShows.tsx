import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import axios, { SHOW_API_URL, MOVIE_API_URL, THEATER_API_URL } from "@/api/api";

type Show = {
  id: number | string;
  movieId: number | string;
  theaterId: number | string;
  screenNumber?: number | string;
  showDate: string;
  showTime: string;
  price: number;
  availableSeats?: number;
};

type Movie = { id: number | string; title: string };
type Theater = { id: number | string; name: string };

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminShows: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Show | null>(null);

  const [movieId, setMovieId] = useState<any>("");
  const [theaterId, setTheaterId] = useState<any>("");
  const [screenNumber, setScreenNumber] = useState<number | "">("");
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("");
  const [price, setPrice] = useState<number | "">("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, mRes, tRes] = await Promise.all([
        axios.get(SHOW_API_URL, { headers: getAuthHeader() }),
        axios.get(MOVIE_API_URL, { headers: getAuthHeader() }),
        axios.get(THEATER_API_URL, { headers: getAuthHeader() }),
      ]);
      setShows(sRes.data || []);
      setMovies(mRes.data || []);
      setTheaters(tRes.data || []);
    } catch (err) {
      console.error("Fetch shows error:", err);
      toast.error("Failed to load shows/movies/theaters");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMovieId("");
    setTheaterId("");
    setScreenNumber("");
    setShowDate("");
    setShowTime("");
    setPrice("");
    setEditing(null);
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        movieId,
        theaterId,
        screenNumber,
        showDate,
        showTime,
        price: Number(price),
      };
      const res = await axios.post(`${SHOW_API_URL}/admin`, payload, { headers: getAuthHeader() });
      setShows(prev => [res.data, ...prev]);
      toast.success("Show scheduled!");
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      console.error("Add show error:", err);
      toast.error("Failed to schedule show");
    }
  };

  const handleEditClick = (s: Show) => {
    setEditing(s);
    setMovieId(s.movieId);
    setTheaterId(s.theaterId);
    setScreenNumber(
  s.screenNumber !== undefined && s.screenNumber !== null
    ? Number(s.screenNumber)
    : ""
);

    setShowDate(s.showDate ? s.showDate.substring(0, 10) : "");
    setShowTime(s.showTime || "");
    setPrice(s.price ?? "");
    setIsEditOpen(true);
  };

  const handleUpdateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        movieId,
        theaterId,
        screenNumber,
        showDate,
        showTime,
        price: Number(price),
        availableSeats: editing.availableSeats ?? null,
      };
      const res = await axios.put(`${SHOW_API_URL}/admin/${editing.id}`, payload, { headers: getAuthHeader() });
      setShows(prev => prev.map(s => (String(s.id) === String(editing.id) ? res.data : s)));
      toast.success("Show updated");
      setIsEditOpen(false);
      resetForm();
    } catch (err) {
      console.error("Update show error:", err);
      toast.error("Failed to update show");
    }
  };

  const handleDeleteShow = async (id: number | string) => {
    if (!confirm("Delete this show?")) return;
    try {
      await axios.delete(`${SHOW_API_URL}/${id}`, { headers: getAuthHeader() });
      setShows(prev => prev.filter(s => String(s.id) !== String(id)));
      toast.success("Show deleted");
    } catch (err) {
      console.error("Delete show error:", err);
      toast.error("Failed to delete show");
    }
  };

  const getMovieTitle = (mId: any) => movies.find(m => String(m.id) === String(mId))?.title || "Unknown";
  const getTheaterName = (tId: any) => theaters.find(t => String(t.id) === String(tId))?.name || "Unknown";

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Show Management</h2>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Show
        </Button>
      </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Show</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddShow} className="space-y-4">
              {/* Movie Dropdown */}
              <div>
                <Label htmlFor="movie">Movie</Label>
                <select
                  id="movie"
                  className="w-full border rounded p-2 bg-white text-black"
                  value={movieId}
                  onChange={e => setMovieId(e.target.value)}
                  required
                >
                  <option value="">Select movie</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theater Dropdown */}
              <div>
                <Label htmlFor="theater">Theater</Label>
                <select
                  id="theater"
                  className="w-full border rounded p-2 bg-white text-black"
                  value={theaterId}
                  onChange={e => setTheaterId(e.target.value)}
                  required
                >
                  <option value="">Select theater</option>
                  {theaters.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Screen Input */}
              <div>
                <Label htmlFor="screen">Screen</Label>
                <Input
                  id="screen"
                  value={screenNumber === "" ? "" : String(screenNumber)}
                  onChange={e => {
                    const val = e.target.value;
                    setScreenNumber(val === "" ? "" : Number(val));
                  }}
                  placeholder="Screen 1"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={showDate}
                    onChange={e => setShowDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={showTime}
                    onChange={e => setShowTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">Ticket Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price === "" ? "" : String(price)}
                  onChange={e => {
                    const val = e.target.value;
                    setPrice(val === "" ? "" : Number(val));
                  }}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Schedule Show
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Show</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateShow} className="space-y-4">
              <div>
                <Label htmlFor="movie_edit">Movie</Label>
                <select
                  id="movie_edit"
                  className="w-full border rounded p-2 bg-white text-black"
                  value={movieId}
                  onChange={e => setMovieId(e.target.value)}
                  required
                >
                  <option value="">Select movie</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="theater_edit">Theater</Label>
                <select
                  id="theater_edit"
                  className="w-full border rounded p-2 bg-white text-black"
                  value={theaterId}
                  onChange={e => setTheaterId(e.target.value)}
                  required
                >
                  <option value="">Select theater</option>
                  {theaters.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="screen_edit">Screen</Label>
                <Input
                  id="screen_edit"
                  value={screenNumber === "" ? "" : String(screenNumber)}
                  onChange={e => {
                    const val = e.target.value;
                    setScreenNumber(val === "" ? "" : Number(val));
                  }}
                  placeholder="Screen 1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_edit">Date</Label>
                  <Input
                    id="date_edit"
                    type="date"
                    value={showDate}
                    onChange={e => setShowDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time_edit">Time</Label>
                  <Input
                    id="time_edit"
                    type="time"
                    value={showTime}
                    onChange={e => setShowTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price_edit">Ticket Price ($)</Label>
                <Input
                  id="price_edit"
                  type="number"
                  step="0.01"
                  value={price === "" ? "" : String(price)}
                  onChange={e => {
                    const val = e.target.value;
                    setPrice(val === "" ? "" : Number(val));
                  }}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shows Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie</TableHead>
              <TableHead>Theater</TableHead>
              <TableHead>Screen</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : shows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No shows found</TableCell>
              </TableRow>
            ) : (
              shows.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{getMovieTitle(s.movieId)}</TableCell>
                  <TableCell>{getTheaterName(s.theaterId)}</TableCell>
                  <TableCell>Screen {s.screenNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(s.showDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {s.showTime}
                    </div>
                  </TableCell>
                  <TableCell>${Number(s.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(s)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteShow(s.id)}>
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

export default AdminShows;
