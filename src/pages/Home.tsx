import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Zap, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import heroImage from "@/assets/hero-cinema.jpg";
import { useUser } from "@/context/UserContext";
import { getAllMovies } from "@/api/api";

const Home = () => {
  const { user } = useUser();
  const userRole = localStorage.getItem("userRole");

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_API_BASE_URL || "http://localhost:8080/uploads/movies/";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await getAllMovies();
        setMovies(response);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load featured movies.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const featuredMovies = movies.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />

      {/* Hero Section */}
      {userRole !== "admin" && (
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          <div className="container relative z-10 px-4">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Book Your
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Perfect Movie Experience
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Reserve your seats for the latest blockbusters. Hassle-free booking, premium experience.
              </p>
              <div className="flex gap-4">
                <Link to="/movies">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Browse Movies
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Movies */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Movies</h2>
            <Link to="/movies">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading featured movies...</div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMovies.map((movie) => (
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
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-4 text-center text-muted-foreground">
          <p>&copy; 2024 CinemaBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
