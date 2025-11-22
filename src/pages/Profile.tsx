import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Ticket } from "lucide-react";
import axios from "axios";

// ✅ API Base URL
const PROFILE_API_URL = import.meta.env.VITE_API_BASE_URL + "/profile"|| "http://localhost:8080/api/profile";

// ----------------------
// TypeScript Interfaces
// ----------------------
interface BookingInfo {
  bookingId: string;
  movieTitle: string;
  theaterName: string;
  showTime: string;
  seatNumbers: string;
  totalAmount: number;
  paymentStatus: string;
  bookingDate: string;
}

interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  phone?: string;
  memberSince?: string;
  bookings: BookingInfo[];
}

// ----------------------
// React Component
// ----------------------
const Profile = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");

        if (!email || !token) {
          console.error("No email or token found in localStorage");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${PROFILE_API_URL}/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false); // ✅ ensures loading stops even on error
      }
    };

    fetchProfile();
  }, []);

  // ----------------------
  // UI Rendering States
  // ----------------------

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center text-muted-foreground">
        No profile found.
      </div>
    );
  }

  // ----------------------
  // Main Profile Layout
  // ----------------------
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ---------------- PROFILE CARD ---------------- */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
                <p className="text-muted-foreground mb-4">Member</p>

                <Separator className="my-4" />

                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Member since{" "}
                      {profile.memberSince
                        ? new Date(profile.memberSince).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Total Bookings
                    </span>
                    <span className="font-bold">
                      {profile.bookings?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ---------------- BOOKING HISTORY ---------------- */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Tabs defaultValue="history">
                <TabsList>
                  <TabsTrigger value="history">
                    <Ticket className="w-4 h-4 mr-2" />
                    Booking History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-4 mt-6">
                  {profile.bookings && profile.bookings.length > 0 ? (
                    profile.bookings.map((booking) => (
                      <Card
                        key={booking.bookingId}
                        className="p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {booking.movieTitle}
                            </h3>
                            <p className="text-muted-foreground">
                              {booking.theaterName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.paymentStatus === "PAID"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {booking.paymentStatus || "UNPAID"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Show Time
                            </p>
                            <p className="font-semibold">{booking.showTime}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Seats
                            </p>
                            <p className="font-semibold">
                              {booking.seatNumbers}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Amount
                            </p>
                            <p className="font-semibold">
                              ₹{booking.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Booking Date
                            </p>
                            <p className="font-semibold">
                              {booking.bookingDate}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Booking ID: {booking.bookingId}
                          </span>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
                      <p className="text-muted-foreground">
                        Start booking your favorite movies!
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
