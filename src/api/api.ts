// src/api/api.ts
import axios from "axios";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

// ---------- API Base URLs ----------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const MOVIE_API_URL = `${API_BASE_URL}/movies`;
export const SHOW_API_URL = `${API_BASE_URL}/shows`;
export const THEATER_API_URL = `${API_BASE_URL}/theaters`;
export const BOOKING_API_URL = `${API_BASE_URL}/bookings`;
export const SEAT_API_URL = `${API_BASE_URL}/seats`;

// ---------- Axios Instance ----------
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ---------- Types ----------
export interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  description: string;
  director: string;
  language: string;
  releaseDate?: string;
  posterUrl?: string;
  cast?: string[];
}

export interface Show {
  id: number;
  movieId: number;
  theaterId: number;
  showDate: string;
  showTime: string;
  price: number;
  availableSeats: number;
  screenNumber: number;
}

export interface Theater {
  id: number;
  name: string;
  location: string;
  facilities?: string[];
  seatingLayout?: { rows: number; seatsPerRow: number; aisles?: number[] };
}

export interface Booking {
  userId: number;
  movieId: number;
  theaterId: number;
  showId: number;
  seatNumbers: string;
  totalAmount: number;
  paymentStatus: string;
  userEmail: string; // ✅ added for email sending
}


// ---------- Auth ----------
export const loginUser = async (payload: { email: string; password: string }) => {
  const res = await apiClient.post(`${AUTH_API_URL}/signin`, payload);
  const data = {
    token: res.data.accessToken,
    id: res.data.id,
    email: res.data.email,
    userName: res.data.username,
    role: res.data.roles?.includes("ROLE_ADMIN") ? "admin" : "user",
  };
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  return data;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const res = await apiClient.post(`${AUTH_API_URL}/signup`, {
    username: payload.name,
    email: payload.email,
    password: payload.password,
    role: ["user"],
  });
  return res.data;
};

// ---------- Movies ----------
export const getAllMovies = async (): Promise<Movie[]> => (await apiClient.get("/movies")).data;
export const getMovieById = async (id: number): Promise<Movie> =>
  (await apiClient.get(`/movies/${id}`)).data;

// ---------- Shows ----------
export const getAllShows = async (): Promise<Show[]> => (await apiClient.get("/shows")).data;
export const getShowsByMovie = async (movieId: number): Promise<Show[]> =>
  (await apiClient.get(`/shows/movie/${movieId}`)).data;
export const getShowById = async (id: number): Promise<Show> =>
  (await apiClient.get(`/shows/${id}`)).data;

// ---------- Theaters ----------
export const getAllTheaters = async (): Promise<Theater[]> =>
  (await apiClient.get("/theaters")).data;
export const getTheaterById = async (id: number): Promise<Theater> =>
  (await apiClient.get(`/theaters/${id}`)).data;

// ---------- Seats ----------
export const getSeatsByShow = async (showId: number) => {
  const res = await apiClient.get(`${SEAT_API_URL}/show/${showId}`);
  return res.data;
};

// ---------- Bookings ----------
export const createBooking = async (bookingData: any) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. Please log in again.");
  }

  const response = await axios.post(`${BOOKING_API_URL}`, bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};


export const getBookingsByUser = async (userId: number) =>
  (await apiClient.get(`${BOOKING_API_URL}/user/${userId}`)).data;

export const confirmBookingPayment = async (bookingId: number) =>
  (await apiClient.put(`${BOOKING_API_URL}/${bookingId}/confirm`)).data;

// ---------- WebSocket ----------
/**
 * Connect to WebSocket using STOMP over SockJS
 * @param showId ID of the show to subscribe to
 * @param onMessage Callback function for incoming messages
 * @returns STOMP Client instance
 */
export const connectSeatWebSocket = (
  showId: number,
  onMessage: (data: any) => void
): Client => {
  const socketUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "/ws") || "http://localhost:8080/ws"; // Must match backend endpoint
  const socket = new SockJS(socketUrl);

  const stompClient: Client = new Client({
    webSocketFactory: () => socket as WebSocket,
    reconnectDelay: 5000, // Try reconnecting after 5 seconds
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: () => {
      console.log("✅ Connected to STOMP WebSocket");

      // Subscribe to the backend's seat topic
      stompClient.subscribe(`/topic/seats/${showId}`, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          onMessage(payload);
        } catch (err) {
          console.error("⚠️ Error parsing WebSocket message:", err);
        }
      });
    },

    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame);
    },

    onWebSocketError: (err) => {
      console.error("🌐 WebSocket error:", err);
    },

    onDisconnect: () => {
      console.log("❌ STOMP disconnected");
    },
  });

  // Activate connection
  stompClient.activate();
  return stompClient;
};

export default apiClient;