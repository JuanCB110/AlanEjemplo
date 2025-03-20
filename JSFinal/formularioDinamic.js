import { createUserAndSendVerificationEmail } from "../BDFinal/conexion.js";

document.addEventListener("DOMContentLoaded", function() {
    const primerFormulario = document.getElementById('primerFormulario');
    const segundoFormulario = document.getElementById('segundoFormulario');
    const siguienteBtn = document.getElementById('siguienteBtn');
    const retrocederBtn = document.getElementById('retrocederBtn');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const finalizarBtn = document.getElementById('finalizarBtn');

    // Mostrar el segundo formulario y ocultar el primero
    siguienteBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Detener el envío del formulario
        primerFormulario.style.display = 'none';
        segundoFormulario.style.display = 'block';
    });

    // Retroceder al primer formulario
    retrocederBtn.addEventListener('click', function() {
        primerFormulario.style.display = 'block';
        segundoFormulario.style.display = 'none';
    });

    // Cancelar y regresar al menú principal
    cancelarBtn.addEventListener('click', function() {
        window.location.href = 'Menuprincip.html';
    });

    // Handle registration form submission
    segundoFormulario.addEventListener('submit', async (e) => {

        const usuario = document.getElementById("nombreUsuarioR");
        const correo = document.getElementById("correoR");
        const contra = document.getElementById("contraR");
        const contrac = document.getElementById("confirmContraR");
        const nombrec = document.getElementById("nombreR");
        const apellidos = document.getElementById("apellidosR");
        const fechaNacimiento = document.getElementById("fechaNacR");

        await createUserAndSendVerificationEmail(correo, contra, nombrec, apellidos, fechaNacimiento, usuario);
            window.location.reload();
            window.location.href = 'Menuprincip.html';


    })           
})
