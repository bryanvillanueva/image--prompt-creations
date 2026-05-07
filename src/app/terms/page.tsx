export default function TermsPage() {
  return (
    <article className="max-w-2xl space-y-6">
      <h1 className="text-h1">Términos de uso</h1>
      <p className="text-body-lg text-[var(--color-fg-muted)]">
        Al usar Promptlib aceptas estos términos. Léelos con atención.
      </p>

      <section className="space-y-3">
        <h2 className="text-h2">1. Cuenta</h2>
        <p className="text-body">
          Para subir prompts necesitas una cuenta. Eres responsable de mantener
          tus credenciales seguras y de la actividad realizada bajo tu cuenta.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">2. Contenido del usuario</h2>
        <p className="text-body">
          Mantienes los derechos sobre el contenido que subes. Al publicarlo,
          otorgas a Promptlib una licencia no exclusiva para mostrarlo y
          distribuirlo dentro de la plataforma. No subas contenido del cual no
          tengas derechos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">3. Privacidad</h2>
        <p className="text-body">
          Recolectamos los datos mínimos necesarios para operar la plataforma:
          email, usuario, contraseña encriptada y los prompts/imágenes que subas.
          No vendemos datos a terceros.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">4. Suspensión</h2>
        <p className="text-body">
          Podemos suspender o eliminar cuentas que violen las reglas de comunidad
          o estos términos.
        </p>
      </section>
    </article>
  );
}
