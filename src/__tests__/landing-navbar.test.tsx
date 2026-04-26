import { render, screen } from "@testing-library/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { useProfileQuery } from "@/lib/query";

jest.mock("@/lib/query", () => ({
  useProfileQuery: jest.fn(),
}));

describe("LandingNavbar", () => {
  it("should show loading state", () => {
    (useProfileQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<LandingNavbar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("should show Go to Chat when authenticated", () => {
    (useProfileQuery as jest.Mock).mockReturnValue({
      data: { id: 1 },
      isLoading: false,
    });

    render(<LandingNavbar />);
    expect(screen.getByText("Go to Chat")).toBeInTheDocument();
  });

  it("should show Sign In when not authenticated", () => {
    (useProfileQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<LandingNavbar />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
