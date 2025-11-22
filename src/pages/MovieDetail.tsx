import { useParams, useNavigate } from "react-router-dom";
import { Clock, Star, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  getMovieById,
  getShowsByMovie,
  getAllTheaters,
  Movie,
  Show,
  Theater,
} from "@/api/api";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_API_BASE_URL || "http://localhost:8080/uploads/movies/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieData, showData, theaterData] = await Promise.all([
          getMovieById(Number(id)),
          getShowsByMovie(Number(id)),
          getAllTheaters(),
        ]);
        setMovie(movieData);
        setShows(showData);
        setTheaters(theaterData);
      } catch (err) {
        console.error(err);
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-16">Loading movie...</div>;

  if (error || !movie)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Button onClick={() => navigate("/movies")}>Back to Movies</Button>
        </div>
      </div>
    );

  // Group shows by theater
  const groupedByTheater = shows.reduce((acc: Record<number, Show[]>, show) => {
    if (!acc[show.theaterId]) acc[show.theaterId] = [];
    acc[show.theaterId].push(show);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Movie Header */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{
            backgroundImage: `url(${IMAGE_BASE_URL}${movie.posterUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"></div>
        </div>

        <div className="container relative z-10 h-full flex items-end px-4 pb-8">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <img
              src={`${IMAGE_BASE_URL}${movie.posterUrl}`}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-lg shadow-cinema"
            />
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="secondary" className="text-base">
                    {movie.genre}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-bold">{movie.rating}/10</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{movie.duration} min</span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-muted-foreground max-w-3xl">
                {movie.description}
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <p className="text-sm text-muted-foreground">Director</p>
                  <p className="font-semibold">{movie.director}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-semibold">{movie.language}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Cast</p>
                  <p className="font-semibold">
                    {movie.cast?.join(", ") ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      <div className="container px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Book Your Show</h2>

        {Object.entries(groupedByTheater).map(([theaterId, theaterShows]) => {
          const theater = theaters.find((t) => t.id === Number(theaterId));
          if (!theater) return null;

          return (
            <Card key={theaterId} className="p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{theater.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{theater.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {theater.facilities?.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {theaterShows.map((show) => (
                  <Button
                    key={show.id}
                    variant="outline"
                    className="flex flex-col items-start h-auto py-3 px-4 hover:border-primary hover:bg-primary/10"
                    onClick={() => navigate(`/booking/${show.id}`)}
                  >
                    <span className="font-bold text-lg">{show.showTime}</span>
                    <span className="text-xs text-muted-foreground">
                      ₹{show.price} • {show.availableSeats} seats
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MovieDetail;
