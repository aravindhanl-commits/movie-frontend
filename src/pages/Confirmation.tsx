// src/pages/Confirmation.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const Confirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const booking = state?.booking;
  const show = state?.show;
  const movie = state?.movie;
  const theater = state?.theater;
  const selectedSeats = state?.selectedSeats || [];
  const totalAmount = state?.totalAmount || 0;

  useEffect(() => {
    if (!booking) navigate("/movies");
  }, [booking, navigate]);

  if (!booking) return null;

  // ✅ Fix showTime parsing issue properly
  const formattedShowTime =
  show?.showDate && show?.showTime
    ? `${show.showDate} ${show.showTime}`
    : "N/A";

  // ✅ Generate PDF (simple + professional)
  const handleDownloadTicket = async () => {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("CineVerse Movie Ticket", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Booking ID: ${booking.id}`, 105, 28, { align: "center" });

    // --- QR Code ---
    const qrData = JSON.stringify({
      bookingId: booking.id,
      movie: movie?.title,
      theater: theater?.name,
      showTime: formattedShowTime,
      seats: selectedSeats,
      totalAmount,
    });
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    doc.addImage(qrCodeDataURL, "PNG", 160, 20, 35, 35);

    // --- Ticket Info Table ---
    const tableData = [
      ["Movie", movie?.title || "-"],
      ["Theater", theater?.name || "-"],
      ["Show Time", formattedShowTime],
      ["Seats", selectedSeats.join(", ") || "-"],
      ["Amount", `₹${totalAmount.toFixed(2)}`],
      ["Payment", booking.paymentStatus || "PAID"],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Details", "Information"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 12, halign: "left", cellPadding: 4 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    // --- Footer ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(
      "Please present this ticket at the theater entrance.",
      105,
      finalY,
      { align: "center" }
    );
    doc.text("Thank you for booking with CineVerse!", 105, finalY + 6, {
      align: "center",
    });

    doc.save(`CineVerse_Ticket_${booking.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-10 max-w-2xl mx-auto">
        <Card className="p-8 shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="text-green-500 w-16 h-16" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-muted-foreground mb-8">
            Your payment was successful, and your tickets are confirmed.
          </p>

          <div className="text-left space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="font-semibold">{booking.id}</p>
            </div>

            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Movie</p>
              <p className="font-semibold">{movie?.title}</p>
            </div>

            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Theater</p>
              <p className="font-semibold">{theater?.name}</p>
            </div>

            <Separator />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Show Time</p>
              <p className="font-semibold">{formattedShowTime}</p>
            </div>

            <Separator />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Seats</p>
              <p className="font-semibold">{selectedSeats.join(", ")}</p>
            </div>

            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-primary">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            <Separator />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className="font-semibold text-green-600">
                {booking.paymentStatus || "PAID"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleDownloadTicket}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Ticket
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => navigate("/movies")}
            >
              Back to Movies
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;