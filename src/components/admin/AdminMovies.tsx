// src/components/admin/AdminMovies.tsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { toast } from "sonner";
import apiClient, { MOVIE_API_URL } from "@/api/api";

type Movie = {
  id?: number | string;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  language: string;
  description?: string;
  director?: string;
  releaseDate?: string; // yyyy-MM-dd or ISO
  posterUrl?: string;
  cast?: string[];
};

const AdminMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Add modal state ---
  const [isAddOpen, setIsAddOpen] = useState(false);

  // --- Edit modal state ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // form fields (shared, reset when opening modals appropriately)
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [rating, setRating] = useState<number | "">("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [director, setDirector] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [castText, setCastText] = useState(""); // input where you type a cast name
  const [castList, setCastList] = useState<string[]>([]); // actual array sent to backend
  const [posterFile, setPosterFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  // Fetch movies from backend
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/movies"); // apiClient baseURL is /api
      setMovies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch movies", err);
      toast.error("Failed to load movies from server");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setGenre("");
    setDuration("");
    setRating("");
    setLanguage("");
    setDescription("");
    setDirector("");
    setReleaseDate("");
    setCastText("");
    setCastList([]);
    setPosterFile(null);
    setEditingMovie(null);
  };

  // Cast input helpers
  const addCastFromInput = () => {
    const name = castText.trim();
    if (!name) return;
    if (!castList.includes(name)) {
      setCastList(prev => [...prev, name]);
    }
    setCastText("");
  };

  const removeCast = (name: string) => {
    setCastList(prev => prev.filter(n => n !== name));
  };

  // --- Add Movie ---
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic front validation
    if (!title || !genre || !duration || !rating) {
      toast.error("Please provide title, genre, duration and rating.");
      return;
    }

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("genre", genre);
      form.append("duration", String(duration));
      form.append("rating", String(rating));
      form.append("description", description || "");
      form.append("director", director || "");
      form.append("language", language || "");
      if (releaseDate) form.append("releaseDate", releaseDate);

      // append cast entries as repeated "cast" fields (controller expects List<String>)
      if (castList.length === 0) {
        form.append("cast", ""); // ensure server receives the parameter (if it expects it)
      } else {
        castList.forEach(c => form.append("cast", c));
      }

      if (posterFile) {
        form.append("posterFile", posterFile);
      } else {
        // If backend requires posterFile always, you might need to send an empty file or adjust server.
        // But based on your MovieController, posterFile seems required — if so, ensure admin always selects a file.
      }

      // Use apiClient (interceptor adds Authorization token). Set multipart content-type.
      const res = await apiClient.post("/movies/admin", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMovies(prev => [res.data, ...prev]);
      toast.success("Movie added successfully");
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Add movie error", err);
      // Try to surface backend message if present
      const msg = err?.response?.data?.message || err?.response?.data || err.message || "Failed to add movie";
      toast.error(String(msg));
    }
  };

  // --- Open Edit Modal (populate fields) ---
  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title || "");
    setGenre(movie.genre || "");
    setDuration(movie.duration ?? "");
    setRating(movie.rating ?? "");
    setLanguage(movie.language || "");
    setDescription(movie.description || "");
    setDirector(movie.director || "");
    setReleaseDate(movie.releaseDate ? movie.releaseDate.substring(0, 10) : "");
    setCastList(movie.cast || []);
    setCastText("");
    setPosterFile(null); // poster replacement optional
    setIsEditOpen(true);
  };

  // --- Update Movie ---
  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie || !editingMovie.id) {
      toast.error("No movie selected for editing");
      return;
    }

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("genre", genre);
      form.append("duration", String(duration));
      form.append("rating", String(rating));
      form.append("description", description || "");
      form.append("director", director || "");
      form.append("language", language || "");
      if (releaseDate) form.append("releaseDate", releaseDate);

      if (castList.length === 0) {
        form.append("cast", "");
      } else {
        castList.forEach(c => form.append("cast", c));
      }

      if (posterFile) form.append("posterFile", posterFile);

      const res = await apiClient.put(`/movies/admin/${editingMovie.id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMovies(prev => prev.map(m => (String(m.id) === String(editingMovie.id) ? res.data : m)));
      toast.success("Movie updated");
      setIsEditOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Update movie error", err);
      const msg = err?.response?.data?.message || err?.response?.data || err.message || "Failed to update movie";
      toast.error(String(msg));
    }
  };

  // --- Delete Movie ---
  const handleDeleteMovie = async (id?: number | string) => {
    if (!id) return;
    const ok = window.confirm("Are you sure you want to delete this movie?");
    if (!ok) return;

    try {
      await apiClient.delete(`/movies/${id}`);
      setMovies(prev => prev.filter(m => String(m.id) !== String(id)));
      toast.success("Movie deleted");
    } catch (err: any) {
      console.error("Delete movie error", err);
      const msg = err?.response?.data?.message || err?.response?.data || err.message || "Failed to delete movie";
      toast.error(String(msg));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Movie Management</h2>

        {/* Add Movie Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Movie
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Movie</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddMovie} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add_title">Title</Label>
                  <Input id="add_title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="add_genre">Genre</Label>
                  <Input id="add_genre" value={genre} onChange={e => setGenre(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="add_duration">Duration (minutes)</Label>
                  <Input id="add_duration" type="number" value={String(duration)} onChange={e => setDuration(Number(e.target.value))} required />
                </div>

                <div>
                  <Label htmlFor="add_rating">Rating</Label>
                  <Input id="add_rating" type="number" step="0.1" max="10" value={String(rating)} onChange={e => setRating(Number(e.target.value))} required />
                </div>

                <div>
                  <Label htmlFor="add_language">Language</Label>
                  <Input id="add_language" value={language} onChange={e => setLanguage(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="add_director">Director</Label>
                  <Input id="add_director" value={director} onChange={e => setDirector(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="add_releaseDate">Release Date</Label>
                  <Input id="add_releaseDate" type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="add_poster">Poster File</Label>
                  <Input id="add_poster" type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div>
                <Label htmlFor="add_description">Description</Label>
                <Textarea id="add_description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
              </div>

              <div>
                <Label>Cast</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Type actor name and press Enter or Add"
                    value={castText}
                    onChange={e => setCastText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCastFromInput();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCastFromInput}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {castList.map((c) => (
                    <div key={c} className="flex items-center gap-2 bg-muted/20 px-2 py-1 rounded">
                      <span className="text-sm">{c}</span>
                      <button type="button" className="p-1" onClick={() => removeCast(c)} aria-label={`Remove ${c}`}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {castList.length === 0 && <p className="text-sm text-muted-foreground">No cast added</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Movie</Button>
                <Button type="button" variant="ghost" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Movie Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Movie</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateMovie} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_title">Title</Label>
                  <Input id="edit_title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="edit_genre">Genre</Label>
                  <Input id="edit_genre" value={genre} onChange={e => setGenre(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="edit_duration">Duration (minutes)</Label>
                  <Input id="edit_duration" type="number" value={String(duration)} onChange={e => setDuration(Number(e.target.value))} required />
                </div>

                <div>
                  <Label htmlFor="edit_rating">Rating</Label>
                  <Input id="edit_rating" type="number" step="0.1" max="10" value={String(rating)} onChange={e => setRating(Number(e.target.value))} required />
                </div>

                <div>
                  <Label htmlFor="edit_language">Language</Label>
                  <Input id="edit_language" value={language} onChange={e => setLanguage(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="edit_director">Director</Label>
                  <Input id="edit_director" value={director} onChange={e => setDirector(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="edit_releaseDate">Release Date</Label>
                  <Input id="edit_releaseDate" type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="edit_poster">Poster File (optional)</Label>
                  <Input id="edit_poster" type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Textarea id="edit_description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
              </div>

              <div>
                <Label>Cast</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Type actor name and press Enter or Add"
                    value={castText}
                    onChange={e => setCastText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCastFromInput();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCastFromInput}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {castList.map((c) => (
                    <div key={c} className="flex items-center gap-2 bg-muted/20 px-2 py-1 rounded">
                      <span className="text-sm">{c}</span>
                      <button type="button" className="p-1" onClick={() => removeCast(c)} aria-label={`Remove ${c}`}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {castList.length === 0 && <p className="text-sm text-muted-foreground">No cast added</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => { setIsEditOpen(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Movies table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
            ) : movies.length === 0 ? (
              <TableRow><TableCell colSpan={7}>No movies found</TableCell></TableRow>
            ) : (
              movies.map((movie) => (
                <TableRow key={String(movie.id)}>
                  <TableCell className="font-medium">{movie.title}</TableCell>
                  <TableCell>{movie.genre}</TableCell>
                  <TableCell>{movie.duration} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {movie.rating}
                    </div>
                  </TableCell>
                  <TableCell>{movie.language}</TableCell>
                  <TableCell>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(movie)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMovie(movie.id)}>
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

export default AdminMovies;
