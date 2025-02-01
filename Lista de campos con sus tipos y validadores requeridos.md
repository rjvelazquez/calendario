Lista de campos con sus tipos y validadores requeridos:

Número de Préstamo
Tipo: text
Requerido: Sí
Validador: Solo números y máximo de 20 caracteres.

Nombre del Cliente
Tipo: text
Requerido: Sí
Validador: Solo texto, longitud máxima de 100 caracteres.

Email del Cliente
Tipo: email
Requerido: Sí
Validador: Formato de email válido.

Fecha de Cierre
Tipo: date
Requerido: Sí
Validador: Fecha válida en formato YYYY-MM-DD.

Hora
Tipo: time
Requerido: Sí
Validador: Hora en formato de 24 horas.

Aportación
Tipo: number
Requerido: No
Validador: Solo números con hasta dos decimales.

Abogado de Hipoteca
Tipo: select
Requerido: Sí
Validador: Validar contra la lista de abogados en Firebase.

Email del Abogado de Hipoteca
Tipo: email
Requerido: No
Validador: Formato de email válido.

Abogado de Compraventa
Tipo: text
Requerido: No
Validador: Solo texto.

Email del Abogado de Compraventa
Tipo: email
Requerido: No
Validador: Formato de email válido.

Procesadora
Tipo: select
Requerido: No
Validador: Validar contra la lista de procesadoras en Firebase.

Email de la Procesadora
Tipo: email
Requerido: No
Validador: Formato de email válido.

Originador
Tipo: select
Requerido: No
Validador: Validar contra la lista de originadores en Firebase.

Email del Originador
Tipo: email
Requerido: No
Validador: Formato de email válido.

Closing Disclosure
Tipo: file
Requerido: No
Validador: Aceptar solo archivos PDF o documentos de cierre relevantes.
