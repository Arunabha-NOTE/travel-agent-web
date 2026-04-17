import { act } from "react";
import { createRoot } from "react-dom/client";
import { ItineraryCard } from "../components/chat/itinerary-card";
import frankfurtFixture from "./fixtures/frankfurt-itinerary.json";

jest.mock("next/dynamic", () => () => {
  const MockMap = () => <div data-testid="itinerary-map" />;
  return MockMap;
});

jest.mock("../lib/query/chat.query", () => ({
  useItineraryQuery: jest.fn(),
}));

const { useItineraryQuery } = jest.requireMock("../lib/query/chat.query") as {
  useItineraryQuery: jest.Mock;
};

describe("ItineraryCard flights", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    useItineraryQuery.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders no itinerary state when query returns null", () => {
    useItineraryQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });

    act(() => {
      createRoot(container).render(
        <ItineraryCard chatId="22a6ac3e-f60f-43e7-bfe2-5d1a52bd17ba" />,
      );
    });

    expect(container.textContent).toContain("No itinerary yet");
  });

  it("renders outbound and return flight cards when both are present", () => {
    const fixtureWithReturn = {
      ...frankfurtFixture,
      itinerary_data: {
        ...frankfurtFixture.itinerary_data,
        flights: {
          ...frankfurtFixture.itinerary_data.flights,
          return: {
            currency: "INR",
            cabin_class: "economy",
            price_per_person: 42000,
            total_duration_mins: 610,
            segments: [
              {
                airline: "Lufthansa",
                flight_number: null,
                from_airport: "FRA",
                from_terminal: "T1",
                to_airport: "DEL",
                to_terminal: "T3",
                departure: "14:30",
                arrival: "01:10",
                duration_mins: 490,
                layover_transit_mins: 50,
              },
            ],
          },
        },
      },
    };

    useItineraryQuery.mockReturnValue({
      data: fixtureWithReturn,
      isLoading: false,
      isError: false,
    });

    act(() => {
      createRoot(container).render(
        <ItineraryCard chatId="22a6ac3e-f60f-43e7-bfe2-5d1a52bd17ba" />,
      );
    });

    expect(container.textContent).toContain("Outbound Flight");
    expect(container.textContent).toContain("Return Flight");
    expect(container.textContent).toContain("Lufthansa");
    expect(container.textContent).toContain("FRA");
    expect(container.textContent).toContain("DEL");
  });

  it("renders a return-only flight card when outbound is missing", () => {
    const fixtureWithOnlyReturn = {
      ...frankfurtFixture,
      itinerary_data: {
        ...frankfurtFixture.itinerary_data,
        flights: {
          outbound: null,
          return: {
            currency: "INR",
            cabin_class: "economy",
            price_per_person: 42000,
            total_duration_mins: 610,
            segments: [
              {
                airline: "Lufthansa",
                flight_number: null,
                from_airport: "FRA",
                from_terminal: "T1",
                to_airport: "DEL",
                to_terminal: "T3",
                departure: "14:30",
                arrival: "01:10",
                duration_mins: 490,
                layover_transit_mins: 50,
              },
            ],
          },
        },
      },
    };

    useItineraryQuery.mockReturnValue({
      data: fixtureWithOnlyReturn,
      isLoading: false,
      isError: false,
    });

    act(() => {
      createRoot(container).render(
        <ItineraryCard chatId="22a6ac3e-f60f-43e7-bfe2-5d1a52bd17ba" />,
      );
    });

    expect(container.textContent).not.toContain("Outbound Flight");
    expect(container.textContent).toContain("Return Flight");
    expect(container.textContent).toContain("Lufthansa");
  });
});
