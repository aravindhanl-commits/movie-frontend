import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Wallet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { confirmBookingPayment } from "@/api/api";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const booking = state?.booking;
  const show = state?.show;
  const movie = state?.movie;
  const theater = state?.theater;
  const selectedSeats = state?.selectedSeats || [];
  const totalAmount = state?.totalAmount || 0;

  useEffect(() => {
    if (!booking) {
      navigate("/movies");
    }
  }, [booking, navigate]);

  const handlePayment = async () => {
    if (!booking) return;

    setLoading(true);
    toast.info("Processing your payment...");

    setTimeout(async () => {
      try {
        // Confirm booking in backend
        const updatedBooking = await confirmBookingPayment(booking.id);
        toast.success("Payment successful!");

        navigate("/confirmation", {
          state: {
            booking: updatedBooking,
            show,
            movie,
            theater,
            selectedSeats,
            totalAmount,
          },
        });
      } catch (error) {
        console.error("Error confirming payment:", error);
        toast.error("Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
          Complete Your Payment
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>

              <div className="flex flex-col space-y-4">
                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={16}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          maxLength={5}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handlePayment}
              disabled={loading || !cardNumber || !expiry || !cvv}
            >
              {loading ? "Processing..." : "Pay Now"}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-24 shadow-md">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span className="font-semibold text-right">
                    {movie?.title}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span className="font-semibold">{theater?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Show Time</span>
                  <span className="font-semibold">{show?.showTime}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-semibold">
                    {selectedSeats.join(", ")}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tickets ({selectedSeats.length})
                  </span>
                  <span className="font-semibold">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Fee</span>
                  <span className="font-semibold">₹20.00</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">
                    ₹{(totalAmount + 20).toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your payment is secured with 256-bit encryption
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
