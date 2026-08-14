export default function Toast({ message, type }) {
  const isError = type === 'error';
  return (
    <div className={`toast ${isError ? 'toast-error' : ''}`} role="status" aria-live="polite">
      <i className={`ti ${isError ? 'ti-alert-circle' : 'ti-circle-check'}`} aria-hidden="true" />
      {message}
    </div>
  );
}
