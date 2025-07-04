import React from "react";

/**
 * Spinner component
 *
 * Displays a loading indicator at the bottom of the list for infinite scrolling.
 * This is typically shown while additional data is being fetched.
 *
 * Styling (CSS) for `.spinner` should provide a visual spinner (e.g. animated circle).
 */
const Spinner: React.FC = () => {
  return (
    <div className="spinnerContainer">
      <div className="spinner" />
    </div>
  );
};

export default Spinner;
