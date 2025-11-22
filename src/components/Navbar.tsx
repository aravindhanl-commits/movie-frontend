import { Link, useLocation } from "react-router-dom";
import { Film, Search, User, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useUser();

  useEffect(() => {
    setIsAdmin(localStorage.getItem("userRole") === "admin");
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Film className="w-8 h-8 text-primary" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              CinemaBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className={`transition-colors hover:text-primary ${
                    isActive("/") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/movies"
                  className={`transition-colors hover:text-primary ${
                    isActive("/movies") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Movies
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1 transition-colors hover:text-primary ${
                  isActive("/admin") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Search & User Actions */}
          <div className="flex items-center gap-4">
            {!isAdmin && (
              <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search movies..."
                  className="border-0 bg-transparent focus-visible:ring-0 w-48"
                />
              </div>
            )}
            {
              user && (
                <div className="flex items-center gap-2">
              {/* Profile Icon */}
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              {/* Username with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-medium">
                    {user?.name ?? "User"}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem asChild>
  <Link to="/profile" className="cursor-pointer">
    Account
  </Link>
</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
              )
            }
            

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {!isAdmin && (
                <>
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/movies"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/movies") ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Movies
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isActive("/admin") ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
