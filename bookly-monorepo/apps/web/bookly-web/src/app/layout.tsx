import './global.css';
import { AuthProvider } from './hooks/useAuth';

export const metadata = {
  title: 'Bookly - Sistema de Reservas Institucionales',
  description: 'Plataforma para la gestiu00f3n de reservas de espacios y recursos institucionales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
