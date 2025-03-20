// Importa las funciones que necesitas de los SDK que necesitas
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword, 
  signOut 
} from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getFirestore, 
  updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDk8tT0LuETuAyxWKaMkpoKBAz9gmw6q5c",
  authDomain: "koki-shop-f251b.firebaseapp.com",
  projectId: "koki-shop-f251b",
  storageBucket: "koki-shop-f251b.appspot.com",
  messagingSenderId: "440785549096",
  appId: "1:440785549096:web:f4f8a882dde5aaed60c21d",
  measurementId: "G-WZFRE87BK7"
};  

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Caché para datos de usuario
const userCache = {
  data: {},
  timestamp: {}
};

// Función para crear un usuario y enviar el correo de verificación
export async function createUserAndSendVerificationEmail(correo, contra, nombrec, apellidos, fechaNacimiento, usuario) {
  try {
    // Crea el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, correo, contra);
    const user = userCredential.user;

    // Envía el correo de verificación
    await sendEmailVerification(user);

    // Guarda la información del usuario en Firestore
    await setDoc(doc(firestore, 'usuario', user.uid), {
      activo: true,
      correo: correo,
      nombre: nombrec,
      apellidos: apellidos,
      nacimiento: fechaNacimiento,
      usuario: usuario,
    });
    
    // Guarda en caché los datos del usuario
    userCache.data[user.uid] = {
      activo: true,
      correo: correo,
      nombre: nombrec,
      apellidos: apellidos,
      nacimiento: fechaNacimiento,
      usuario: usuario,
    };
    userCache.timestamp[user.uid] = Date.now();
    
    // Alerta de éxito usando SweetAlert2
    Swal.fire({
      title: 'Usuario registrado exitosamente',
      text: 'Se ha enviado un correo de verificación a tu dirección de correo electrónico.',
      icon: 'success',
      iconColor: '#9F79FF',
      showConfirmButton: false,
      timer: 2000
    });
    
    return user;
  } catch (error) {
    // Si hay un error, muestra una alerta con el mensaje de error
    Swal.fire({
      title: 'Error al registrar el usuario',
      text: error.message,
      icon: 'error',
      showConfirmButton: false,
      timer: 2000
    });
    
    return null;
  }
}

// Obtener datos de usuario con caché
async function obtenerUsuario(idUsuario){
  try {
    // Verificar si los datos están en caché y son recientes (menos de 5 minutos)
    const cacheDuration = 5 * 60 * 1000; // 5 minutos en milisegundos
    if (userCache.data[idUsuario] && 
        (Date.now() - userCache.timestamp[idUsuario]) < cacheDuration) {
      return userCache.data[idUsuario];
    }
    
    const usuario = await getDoc(doc(firestore, 'usuario', idUsuario));

    if (usuario.exists()) {
      const userData = usuario.data();
      
      // Actualizar caché
      userCache.data[idUsuario] = userData;
      userCache.timestamp[idUsuario] = Date.now();
      
      return userData;
    } else {
      console.log("El usuario no existe");
      return null;
    }
  } catch (error) {
    console.error('Error al obtener al Usuario:', error.message);
    return null;
  }
}

// Función para validar las credenciales del usuario al iniciar sesión
export async function validateUser(correo, pass) {
  try {
    // Intenta iniciar sesión con el correo electrónico y la contraseña proporcionados
    const userCredential = await signInWithEmailAndPassword(auth, correo, pass);
    const user = userCredential.user;

    const userin = await obtenerUsuario(user.uid);
    
    if (!userin) {
      throw new Error('No se pudieron obtener los datos del usuario');
    }

    // Verifica si el correo electrónico del usuario ha sido verificado
    if (!user.emailVerified && userin.activo == false) {
      Swal.fire({
        title: 'Correo no verificado',
        text: 'Por favor verifica tu correo electrónico antes de iniciar sesión',
        icon: 'info',
        showConfirmButton: false,
        timer: 2000
      });
      
      throw new Error('El correo electrónico no ha sido verificado');
    } else if(user.emailVerified && userin.activo == true){
      return user; // Devuelve el usuario autenticado
    } else {
      Swal.fire({
        title: 'Cuenta suspendida',
        text: 'Al parecer fuiste baneado temporalmente',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2000
      });
      
      await cerrarSesion();
      return null;
    }
  } catch (error) {
    Swal.fire({
      title: 'Error al iniciar sesión',
      text: 'Datos incorrectos o campos vacíos',
      icon: 'error',
      showConfirmButton: false,
      timer: 2000
    });
    
    console.error('Error al iniciar sesión:', error.message);
    return null;
  }
}

// Actualizar datos del usuario
export async function actualizarUsuario(nuevoNombre, nuevoApellido, nuevoNombreUsuario) {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No hay usuario autenticado.');
    }
    
    if (!nuevoNombre || !nuevoApellido || !nuevoNombreUsuario) {
      throw new Error('Por favor, completa todos los campos.');
    }
    
    // Actualiza los datos del usuario en Firestore
    await updateDoc(doc(firestore, 'usuario', user.uid), {
      nombre: nuevoNombre,
      apellidos: nuevoApellido,
      usuario: nuevoNombreUsuario
    });
    
    // Actualizar caché
    if (userCache.data[user.uid]) {
      userCache.data[user.uid].nombre = nuevoNombre;
      userCache.data[user.uid].apellidos = nuevoApellido;
      userCache.data[user.uid].usuario = nuevoNombreUsuario;
      userCache.timestamp[user.uid] = Date.now();
    }
    
    Swal.fire({
      title: 'Datos Actualizados',
      text: 'Tus datos han sido actualizados correctamente',
      icon: 'success',
      iconColor: '#9F79FF',
      showConfirmButton: false,
      timer: 2000
    });
    
    return true;
  } catch (error) {
    Swal.fire({
      title: 'Error al actualizar',
      text: error.message,
      icon: 'error',
      showConfirmButton: false,
      timer: 2000
    });
    
    console.error('Error al actualizar usuario:', error.message);
    return false;
  }
}

// Función para cerrar sesión
export async function cerrarSesion() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
}

// Función para obtener datos del usuario actual
export function obtenerDatosUsuario() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Detiene la escucha después de la primera llamada
      if (user) {
        resolve(user);
      } else {
        reject(new Error('No hay un usuario autenticado'));
      }
    });
  });
}