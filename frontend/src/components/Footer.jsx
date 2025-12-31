import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-primary">
              ChileCupones
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              La plataforma líder en agregación de descuentos bancarios y comerciales en Chile. Ahorra inteligente.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Plataforma</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/" className="text-base text-gray-500 hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-base text-gray-500 hover:text-primary transition-colors">
                  Mapa de Ofertas
                </Link>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-primary transition-colors">
                  Validar Cupón
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-primary transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-primary transition-colors">
                  Términos de Uso
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Suscríbete</h3>
            <p className="mt-4 text-sm text-gray-500">
              Recibe las mejores ofertas de la semana.
            </p>
            <form className="mt-4 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary focus:placeholder-gray-400"
                placeholder="tu@email.com"
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full bg-primary flex items-center justify-center border border-transparent rounded-md py-2 px-4 text-base font-medium text-white hover:bg-primary-dark focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-base text-gray-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} ChileCupones. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 justify-center md:justify-end mt-4 md:mt-0">
            <span className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </span>
            <span className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06h.63zm2.595 17.668c.969-.044 1.5-.219 1.85-.354.466-.18.8-.393 1.15-.744.35-.35.564-.683.744-1.15.135-.35.31-.88.354-1.85.045-1.01.056-1.31.056-3.832 0-2.52-.011-2.822-.056-3.832-.044-.969-.219-1.5-.354-1.85-.18-.466-.393-.8-.744-1.15-.35-.35-.683-.564-1.15-.744-.35-.135-.88-.31-1.85-.354-1.01-.045-1.31-.056-3.832-.056-2.52 0-2.822.011-3.832.056-.969.044-1.5.219-1.85.354-.466.18-.8.393-1.15.744-.35.35-.564.683-.744 1.15-.135.35-.31.88-.354 1.85-.045 1.01-.056 1.31-.056 3.832 0 2.52.011 2.822.056 3.832.044.969.219 1.5.354 1.85.18.466.393.8.744 1.15.35.35.683.564 1.15.744.35.135.88.31 1.85.354 1.01.045 1.31.056 3.832.056 2.52 0 2.822-.011 3.832-.056zM12 7.418a4.582 4.582 0 100 9.164 4.582 4.582 0 000-9.164zm0 1.833a2.75 2.75 0 110 5.5 2.75 2.75 0 010-5.5zm5.33-5.032a1.083 1.083 0 100 2.166 1.083 1.083 0 000-2.166z" clipRule="evenodd" /></svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}