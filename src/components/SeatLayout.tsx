import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SeatLayoutProps {
  rows: number;
  seatsPerRow: number;
  aisles?: number[];
  onSeatSelect: (seats: string[]) => void;
  bookedSeats?: string[];
}

const SeatLayout = ({ rows, seatsPerRow, aisles = [], onSeatSelect, bookedSeats = [] }: SeatLayoutProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const getSeatId = (row: number, seat: number) => {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
    return `${rowLetter}${seat + 1}`;
  };

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;

    const newSelected = selectedSeats.includes(seatId)
      ? selectedSeats.filter(s => s !== seatId)
      : [...selectedSeats, seatId];

    setSelectedSeats(newSelected);
    onSeatSelect(newSelected);
  };

  const getSeatStatus = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="w-full">
        <div className="bg-gradient-primary h-2 rounded-t-3xl mx-auto w-3/4 shadow-glow"></div>
        <p className="text-center text-sm text-muted-foreground mt-2">Screen</p>
      </div>

      {/* Seats */}
      <div className="flex flex-col items-center gap-2 py-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-2">
            <span className="w-6 text-center text-sm text-muted-foreground font-mono">
              {String.fromCharCode(65 + rowIndex)}
            </span>
            <div className="flex gap-2">
              {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                const seatId = getSeatId(rowIndex, seatIndex);
                const status = getSeatStatus(seatId);
                const isAisle = aisles.includes(seatIndex);

                return (
                  <div key={seatIndex} className="flex gap-2">
                    {isAisle && <div className="w-4" />}
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "w-8 h-8 p-0 transition-all",
                        status === "available" && "hover:bg-primary hover:border-primary",
                        status === "selected" && "bg-primary border-primary text-primary-foreground hover:bg-primary/90",
                        status === "booked" && "bg-muted border-muted cursor-not-allowed opacity-50"
                      )}
                      onClick={() => toggleSeat(seatId)}
                      disabled={status === "booked"}
                    >
                      <span className="text-xs">{seatIndex + 1}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-border rounded"></div>
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary border-2 border-primary rounded"></div>
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted border-2 border-muted rounded opacity-50"></div>
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
