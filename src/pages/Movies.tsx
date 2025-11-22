import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllMovies } from "@/api/api";

const Movies = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_API_BASE_URL || "http://localhost:8080/uploads/movies/";

  // Fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await getAllMovies();
        setMovies(response);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const genres = ["all", ...Array.from(new Set(movies.map((m) => m.genre)))];

  const filteredMovies = movies
    .filter((movie) => selectedGenre === "all" || movie.genre === selectedGenre)
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Now Showing</h1>
          <p className="text-muted-foreground">Discover the latest movies in theaters</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-lg">
            Loading movies...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-lg">{error}</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre === "all" ? "All Genres" : genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  genre={movie.genre}
                  duration={movie.duration}
                  rating={movie.rating}
                  posterUrl={`${IMAGE_BASE_URL}${movie.posterUrl}`}
                />
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No movies found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedGenre("all");
                    setSortBy("title");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Movies;
