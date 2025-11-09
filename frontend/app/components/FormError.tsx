// components/FormError.tsx
import { useEffect, useState } from "react";

interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300); // fade out
      return () => clearTimeout(timeout);
    }
  }, [message]);

  if (!message && !show) return null;

  return (
    <p
      className={`mt-1 text-sm text-red-600 font-medium transition-opacity duration-300 ${
        message ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </p>
  );
};

export default FormError;
