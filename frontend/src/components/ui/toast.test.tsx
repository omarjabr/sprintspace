import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toaster, toast } from "./toast";

describe("Toast", () => {
  it("displays success toast", async () => {
    render(<Toaster />);

    toast.success("Task created successfully");

    await waitFor(() => {
      expect(screen.getByText("Task created successfully")).toBeInTheDocument();
    });
  });

  it("displays error toast", async () => {
    render(<Toaster />);

    toast.error("Failed to create task");

    await waitFor(() => {
      expect(screen.getByText("Failed to create task")).toBeInTheDocument();
    });
  });

  it("displays loading toast", async () => {
    render(<Toaster />);

    toast.loading("Creating task...");

    await waitFor(() => {
      expect(screen.getByText("Creating task...")).toBeInTheDocument();
    });
  });
});
