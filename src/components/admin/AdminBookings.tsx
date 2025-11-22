import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { BOOKING_API_URL } from "@/api/api";
import { toast } from "sonner";

type Booking = {
  id?: number | string;
  bookingId?: string;
  userId?: number | string;
  movieId?: number | string;
  theaterId?: number | string;
  showId?: number | string;
  seatNumbers?: string;
  totalAmount?: number;
  bookingTime?: string;
  paymentStatus?: string;
};

const getAuthHeader = () => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BOOKING_API_URL, { headers: getAuthHeader() });
      const data = res.data || [];

      // ✅ Sort bookings by bookingTime (most recent first)
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.bookingTime || "").getTime();
        const dateB = new Date(b.bookingTime || "").getTime();
        return dateB - dateA;
      });

      setBookings(sorted);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (id: number | string) => {
    try {
      const res = await axios.put(
        `${BOOKING_API_URL}/${id}/confirm`,
        {},
        { headers: getAuthHeader() }
      );
      setBookings((prev) =>
        prev.map((b) => (String(b.id) === String(id) ? res.data : b))
      );
      toast.success("Payment confirmed");
    } catch (err) {
      console.error("Confirm payment error:", err);
      toast.error("Failed to confirm payment");
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Booking Management</h2>
        <p className="text-muted-foreground">
          View and manage all ticket bookings
        </p>
      </div>

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-secondary/50">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </Card>
        <Card className="p-4 bg-secondary/50">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-500">
            {
              bookings.filter(
                (b) =>
                  b.paymentStatus === "PAID" || b.paymentStatus === "COMPLETED"
              ).length
            }
          </p>
        </Card>
        <Card className="p-4 bg-secondary/50">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">
            ₹
            {bookings
              .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
              .toFixed(2)}
          </p>
        </Card>
        <Card className="p-4 bg-secondary/50">
          <p className="text-sm text-muted-foreground">Total Seats</p>
          <p className="text-2xl font-bold">
            {bookings.reduce(
              (sum, b) =>
                sum + (b.seatNumbers ? b.seatNumbers.split(",").length : 0),
              0
            )}
          </p>
        </Card>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Movie ID</TableHead>
              <TableHead>Theater ID</TableHead>
              <TableHead>Show ID</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No bookings available
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={String(b.id)}>
                  <TableCell className="font-mono font-medium">
                    {b.bookingId}
                  </TableCell>
                  <TableCell>{b.userId}</TableCell>
                  <TableCell>{b.movieId}</TableCell>
                  <TableCell>{b.theaterId}</TableCell>
                  <TableCell>{b.showId}</TableCell>
                  <TableCell>{b.seatNumbers}</TableCell>
                  <TableCell>₹{b.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        b.paymentStatus === "PAID" ? "default" : "secondary"
                      }
                    >
                      {b.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {b.paymentStatus !== "PAID" && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmPayment(b.id!)}
                      >
                        Confirm Payment
                      </Button>
                    )}
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

export default AdminBookings;
