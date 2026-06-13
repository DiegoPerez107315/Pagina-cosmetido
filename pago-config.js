/* ============ Configuración de pagos — NicValia Make up ============

   ePayco es la pasarela de pago. Para activarla:

   1) Crea tu cuenta gratis en  https://epayco.com
   2) Entra al panel → Integraciones → Llaves (API Keys).
   3) Copia tu "PUBLIC_KEY" y pégala abajo, entre las comillas,
      reemplazando todo el texto PEGA_AQUI_TU_LLAVE_PUBLICA_EPAYCO.
   4) Deja  test: true  para probar sin cobrar de verdad.
      Cuando ya funcione y quieras recibir pagos reales, cámbialo a
      test: false.

   No pongas aquí la llave PRIVATE_KEY ni el P_KEY: solo la PUBLIC_KEY.
   La llave pública es segura de tener en el sitio (es de uso público).
*/
window.NV_PAGO = {
  epaycoKey: "PEGA_AQUI_TU_LLAVE_PUBLICA_EPAYCO",
  test: true
};
