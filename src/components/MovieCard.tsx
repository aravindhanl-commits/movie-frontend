import { Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface MovieCardProps {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  posterUrl: string;
}

const MovieCard = ({ id, title, genre, duration, rating, posterUrl }: MovieCardProps) => {
  return (
    <Link to={`/movie/${id}`}>
      <Card className="group overflow-hidden bg-card border-border hover:shadow-glow transition-all duration-300 hover:scale-105">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img 
            src={posterUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-bold text-sm">{rating}</span>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{genre}</Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>{duration} min</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MovieCard;
