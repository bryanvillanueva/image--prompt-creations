export default function RulesPage() {
  return (
    <article className="max-w-2xl prose-app space-y-6">
      <h1 className="text-h1">Reglas de comunidad</h1>
      <p className="text-body-lg text-[var(--color-fg-muted)]">
        Promptlib es una plataforma colaborativa. Para mantenerla útil y segura,
        todos los miembros aceptan estas reglas al participar.
      </p>

      <section className="space-y-3">
        <h2 className="text-h2">Contenido prohibido</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-body">
          <li>Prompts sexuales explícitos, sexting o desnudez explícita.</li>
          <li>Contenido sexualizado con menores, real o ficticio.</li>
          <li>Violencia extrema o gore.</li>
          <li>Discurso de odio, acoso o discriminación.</li>
          <li>Instrucciones para actividades ilegales.</li>
          <li>Spam o contenido auto-promocional sin valor.</li>
          <li>Trabajos robados o que violen derechos de autor.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">Buenas prácticas</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-body">
          <li>Sé claro y descriptivo en el título.</li>
          <li>Etiqueta correctamente con categoría y tags relevantes.</li>
          <li>Sube una imagen real generada con el prompt.</li>
          <li>Da crédito si te inspiraste en otro prompt.</li>
          <li>Reporta contenido que viole las reglas.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">Moderación</h2>
        <p className="text-body">
          Cada prompt pasa por un filtro automático y luego una revisión manual
          antes de ser publicado. Los administradores pueden rechazar, ocultar o
          bloquear contenido en cualquier momento.
        </p>
      </section>
    </article>
  );
}
