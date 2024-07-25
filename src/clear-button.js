export function ClearButton() {
  return (
    <button
      onClick={() => {
        localStorage.clear();
        window.location = window.location.pathname;
      }}
    >
      Clear cached data & refresh
    </button>
  );
}
