export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-600 text-center">
          &copy; {currentYear} Todo App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
