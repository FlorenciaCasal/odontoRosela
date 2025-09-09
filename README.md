# Manual de uso y traspaso

Este documento resume **cómo usar**, **cómo mantener** y **cómo traspasar** la aplicación de historia clínica con integración a Google Calendar. Está pensado para la odontóloga y para cualquier persona que la ayude a futuro.

---

## 0) Resumen rápido (5 minutos)

1. **Abrí el enlace del evento** en tu celular/computadora: te lleva a la ficha del paciente.
2. **Editar datos / subir archivos / eliminar paciente**: desde la ficha del paciente.
3. **(Una sola vez por dispositivo)**: si te pide enrolamiento, usá el link con `?k=…` (ya viene en la descripción del evento). Eso deja el dispositivo listo por **180 días**.
4. **Importar pacientes** (opcional): desde `/patients/import` subí un CSV con cabeceras: `fullName,docNumber,phone,email,insuranceName,insuranceNumber,notes`.

---

## 1) Acceso y navegación

* **Listado**: `/patients` – buscador en vivo por **nombre o DNI**.
* **Ficha del paciente**: `/patients/{id}` – pestañas **Datos**, **Consultas** y **Archivos**.
* **Subida de archivos**: en la pestaña **Archivos** (acepta imágenes, PDF y videos; múltiples a la vez).

> **Privacidad**: las páginas son **públicas para lectura**. Las acciones de **escritura** (crear/editar/borrar/subir) requieren cookie de dispositivo (ver Sección 4).

---

## 2) Búsqueda en vivo

En `/patients`, el campo de búsqueda filtra automáticamente mientras escribís (no hace falta apretar “Buscar”).

---

## 3) Evitar duplicados (mismo nombre)

Al crear un paciente, el sistema bloquea nombres **idénticos** (sin diferenciar mayúsculas/minúsculas y normalizando espacios).

* Si ya existen duplicados de antes, **eliminar** uno desde la ficha o la lista.
* **Sugerencia**: cuando haya DNI, cargarlo para mejorar los cruces con Calendar.

---

## 4) Enrolamiento de dispositivos (sin contraseñas)

La app usa una **cookie de dispositivo** para habilitar acciones de **escritura** por **180 días**.

* El enlace de los eventos de Google Calendar incluye `?k=ACCESS_KEY2` (link **auto‑enrolador**).
* **Qué pasa al tocarlo**:

  * Si no hay cookie → la setea y redirige a la ficha del paciente.
  * Si ya hay cookie → simplemente abre la ficha normalmente.
* Si abrís desde otro navegador/app (p. ej. el visor interno de Calendar), **tocar el link** también deja ese navegador listo.

> Si se cambia el valor de `ACCESS_KEY2`, todos los dispositivos deberán entrar una vez con el nuevo `?k=`.

---

## 5) Integración con Google Calendar (Apps Script)

**Objetivo**: cada evento del calendario tenga en su descripción el enlace a la historia clínica.

1. Entrar a **Google Apps Script** (con la cuenta de la odontóloga) y abrir el proyecto del integrador.
2. En **Project Settings → Script Properties**, configurar:

   * `BASE_URL` → `https://odontologiapuelo.vercel.app`
   * `ACCESS_KEY` → **el mismo valor** de `ACCESS_KEY2` en Vercel
   * *(Opcional)* `CALENDAR_ID` → `primary` (o el ID del calendario si usa otro)
3. Crear un **trigger de tiempo** (cada 5 minutos) que ejecute la función principal (ver punto 5.1).

### 5.1. Bloque de descripción (link auto‑enrolador)

Este bloque asegura que el link del evento **siempre** setee la cookie si hace falta:

```javascript
const MARK = "\n\n— Historia clínica —\n";

function buildDescBlock_(base, patientId) {
  const fichaAuto = base + "/patients/" + patientId + "?k=" + encodeURIComponent(ACCESS_KEY);
  return MARK + "Historia clínica: " + fichaAuto;
}
```

> Si preferís **no mostrar** `?k=` en el link principal, podés agregar un segundo renglón “Enrolar este dispositivo: …?k=…”, y dejar el link principal limpio.

---

## 6) Importar pacientes por CSV

Ruta: `/patients/import`.

**Cabeceras aceptadas**:

```
fullName,docNumber,phone,email,insuranceName,insuranceNumber,notes
```

* El sistema normaliza `fullName` y bloquea duplicados exactos por nombre.
* Podés exportar desde Excel/Sheets como **CSV** y subirlo.

**Ejemplo mínimo**:

```
fullName,docNumber,phone,email,insuranceName,insuranceNumber,notes
Florencia Casal,32123456,299-555-0000,flor@example.com,OSDE,12345,Paciente con sensibilidad
Lucas Pérez,30111222,,lucas@example.com,,,—
```

---

## 7) Archivos (imágenes, PDF, videos)

En la ficha → pestaña **Archivos**:

* Subida múltiple.
* Previsualización de imágenes y PDF (videos se reproducen en el navegador).
* Los archivos se guardan en **Vercel Blob** (enlaces públicos).

> Tamaños muy grandes pueden fallar en plan gratuito. Recomendación: mantener archivos < **50 MB** cada uno.

---

## 8) Variables y rotaciones (para traspaso/seguridad)

**Dónde**: Vercel → Project Settings → Environment Variables.

Variables claves:

* `ACCESS_KEY2` → usada por el **magic link** y Apps Script.
* `NEON_DATABASE_URL` → conexión a la base (Neon).
* `BLOB_READ_WRITE_TOKEN` → token de escritura de Vercel Blob.

**Buenas prácticas**:

* Si se sospecha acceso indebido, **rotar `ACCESS_KEY2`** en Vercel y **actualizar `ACCESS_KEY`** en Apps Script con el **mismo valor**.
* Tras rotar, los dispositivos deben tocar nuevamente un link con `?k=…` (o abrir cualquier ficha con `?k=`) para quedar enrolados.

---

## 9) Handover / Traspaso a la odontóloga

Checklist:

1. **Transferir** el proyecto de Vercel (o crear uno nuevo en su cuenta y hacer deploy desde su repo) y **cargar variables**.
2. **Neon**: crear el proyecto en su cuenta o transferirlo (copiar `NEON_DATABASE_URL`).
3. **Apps Script**: el proyecto debe quedar en **su Google** con el trigger creado.
4. **Probar** desde su celular y su PC: abrir un evento → link a la ficha → editar/registrar/subir.
5. Entregar este **manual** (PDF o link) + un **CSV de respaldo** inicial (opcional).

---

## 10) Copias de seguridad

* **Pacientes**: se puede exportar un **CSV** (feature opcional; si lo necesitás a futuro, se agrega en `/export`).
* **Archivos**: están en Vercel Blob; se pueden descargar puntualmente desde cada ficha.

---

## 11) Límites y costos (modo gratuito)

* **Vercel (Hobby)** y **Vercel Blob**: gratis con límites razonables para este uso. Si se exceden, el servicio se **pausa** hasta el siguiente ciclo (no cobra exceso) o se pasa a plan pago.
* **Neon (Postgres)**: plan Free suficiente para un consultorio.
* **Google Apps Script**: sin costo con cuotas de tiempo por ejecución (sobra para este caso).

> En la práctica, el uso típico de un consultorio entra en el plan **\$0**.

---

## 12) Solución de problemas

* **El evento no tiene link**: el trigger puede haber fallado. Entrar a Apps Script → Ejecutiones → ver logs. O esperar 5 min a la próxima corrida.
* **Me pide login**: abriste desde un navegador/app sin cookie. Tocá un link que tenga `?k=…` para quedar enrolado.
* **No puedo guardar**: si tocaste el link sin `?k=…` y no tenías cookie, abrí la ficha con `?k=…` desde el mismo navegador y reintentá.
* **Duplicados por nombre**: borrar el duplicado desde la ficha o la lista.

---

## 13) Alcance y garantía (entrega cerrada)

* Se entrega lo probado: pacientes, ficha (datos/archivos), buscador en vivo, bloqueo de duplicados, integración con Calendar (Apps Script), y deploy.
* **Garantía de 30 días** para correcciones de fallas.
* Nuevas funciones o cambios posteriores se cotizan aparte.

---

### Anexo A — Cómo identificar el ID de un calendario (opcional)

Si la odontóloga usa un calendario secundario:

1. En Google Calendar (web) → ícono ⚙️ → **Configuración**.
2. En la barra izquierda, seleccionar el calendario → copiar el **ID de calendario**.
3. Pegar ese ID en `CALENDAR_ID` (Script Properties) y usar `CalendarApp.getCalendarById(CALENDAR_ID)` en el script.

---

> **Listo.** Con este manual, la odontóloga puede usar la app sin depender de soporte continuo, y vos podés cerrar la entrega con claridad. Si querés, agregamos capturas y lo exportamos a PDF para enviarle por WhatsApp/mail.
