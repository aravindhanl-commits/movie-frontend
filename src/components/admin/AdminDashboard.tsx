// AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios, { MOVIE_API_URL, THEATER_API_URL, SHOW_API_URL, BOOKING_API_URL } from "@/api/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminDashboard: React.FC = () => {
  const [totalMovies, setTotalMovies] = useState(0);
  const [totalTheaters, setTotalTheaters] = useState(0);
  const [totalShows, setTotalShows] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [mRes, tRes, sRes, bRes] = await Promise.all([
        axios.get(MOVIE_API_URL, { headers: getAuthHeader() }),
        axios.get(THEATER_API_URL, { headers: getAuthHeader() }),
        axios.get(SHOW_API_URL, { headers: getAuthHeader() }),
        axios.get(BOOKING_API_URL, { headers: getAuthHeader() }),
      ]);

      const movies = mRes.data || [];
      const theaters = tRes.data || [];
      const shows = sRes.data || [];
      const bookings = bRes.data || [];

      setTotalMovies(movies.length);
      setTotalTheaters(theaters.length);
      setTotalShows(shows.length);
      setTotalBookings(bookings.length);
      setRevenue(bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0));
    } catch (err) {
      console.error("Load dashboard stats error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Movies</p>
          <p className="text-3xl font-bold mt-2">{totalMovies}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Theaters</p>
          <p className="text-3xl font-bold mt-2">{totalTheaters}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Active Shows</p>
          <p className="text-3xl font-bold mt-2">{totalShows}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* lightweight — could be replaced with backend activity endpoint */}
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="font-medium">New booking</p>
                <p className="text-sm text-muted-foreground">Quantum Horizon - CineMax Grand</p>
              </div>
              <span className="text-xs text-muted-foreground">5 min ago</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="font-medium">Movie added</p>
                <p className="text-sm text-muted-foreground">The Last Symphony</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Summary</h3>
          <div className="space-y-2">
            <p>Total Bookings: <strong>{totalBookings}</strong></p>
            <p>Total Revenue: <strong>${revenue.toFixed(2)}</strong></p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
