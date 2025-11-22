import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SeatLayout from "@/components/SeatLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import {
  getShowById,
  getMovieById,
  getTheaterById,
  getSeatsByShow,
  createBooking,
  connectSeatWebSocket,
} from "@/api/api";

const Booking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stompClient: any;

    const fetchShowData = async () => {
      try {
        setLoading(true);

        const showData = await getShowById(Number(showId));
        setShow(showData);

        const [movieData, theaterData, seatsData] = await Promise.all([
          getMovieById(showData.movieId),
          getTheaterById(showData.theaterId),
          getSeatsByShow(Number(showId)),
        ]);

        setMovie(movieData);
        setTheater(theaterData);
        setBookedSeats(
  seatsData
    .filter((s: any) => s.status === "BOOKED" || s.status === "LOCKED")
    .map((s: any) => s.seatNumber)
);
console.log("Seats received:", seatsData);
console.log("Filtered booked seats:", seatsData.filter((s: any) => s.status !== "AVAILABLE"));


        // ✅ WebSocket setup using STOMP client
        stompClient = connectSeatWebSocket(Number(showId), (update) => {
          if (update.type === "SEAT_BOOKED") {
            setBookedSeats((prev) => [...new Set([...prev, ...update.seats])]);
          }
        });
      } catch (error) {
        console.error("❌ Error loading show details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showId) fetchShowData();

    // ✅ Cleanup function on component unmount
    return () => {
      if (stompClient && typeof stompClient.deactivate === "function") {
        stompClient.deactivate();
        console.log("🧹 WebSocket connection closed");
      }
    };
  }, [showId]);

  const totalAmount = selectedSeats.length * (show?.price || 0);

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
      alert("Please log in first.");
      navigate("/login");
      return;
    }

    const bookingData = {
      userId: user.id,
      showId: show.id,
      movieId: show.movieId,
      theaterId: show.theaterId,
      seatNumbers: selectedSeats.join(","),
      totalAmount,
      paymentStatus: "PENDING",
      userEmail: user.email,
    };

    try {
      const savedBooking = await createBooking(bookingData);
      navigate("/payment", {
        state: { show, movie, theater, selectedSeats, totalAmount, booking: savedBooking },
      });
    } catch (err) {
      console.error("❌ Booking failed:", err);
      alert("Booking failed. Please log in or try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading booking details...</p>
      </div>
    );

  if (!show || !movie || !theater)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Show not found</h1>
          <Button onClick={() => navigate("/movies")}>Back to Movies</Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(`/movie/${movie.id}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>
              <SeatLayout
                rows={theater.seatingLayout?.rows || 10}
                seatsPerRow={theater.seatingLayout?.seatsPerRow || 12}
                aisles={theater.seatingLayout?.aisles || [6]}
                onSeatSelect={setSelectedSeats}
                bookedSeats={bookedSeats}
              />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Movie</p>
                  <p className="font-semibold">{movie.title}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Theater</p>
                  <p className="font-semibold">{theater.name}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{show.showDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{show.showTime}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Selected Seats</p>
                  <p className="font-semibold">
                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "No seats selected"}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedSeats.length === 0}
                  onClick={handleContinue}
                >
                  Continue to Payment
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;