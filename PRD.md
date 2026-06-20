# PawPets — E-commerce de Productos para Mascotas

> **Documento de Requisitos del Producto (PRD)**
> Versión 1.0 — Proyecto de práctica/formación

---

## 1. Resumen Ejecutivo

PawPets es una tienda e-commerce web responsive donde los dueños de mascotas pueden encontrar todo lo que sus animales necesitan: alimentos, accesorios, juguetes, medicamentos, ropa, camas, transportadores, higiene, productos para aves y peces, y más. Cuenta con un **panel de administración** para que el dueño de la tienda pueda gestionar productos, stock, pedidos, precios y ofertas sin necesidad de tocar código. El proyecto es con fines de formación y portfolio, con pasarela de pago simulada.

---

## 2. Oportunidad y Propósito

### Problema
Los dueños de mascotas necesitan un lugar centralizado donde conseguir productos variados para sus animales sin tener que ir a múltiples tiendas o sitios.

### Solución
Un e-commerce con categorías bien definidas que permita navegar, seleccionar y comprar productos de forma intuitiva desde cualquier dispositivo (PC, laptop, celular).

### Objetivo del proyecto
Construir un e-commerce funcional completo como proyecto de aprendizaje y portfolio, cubriendo frontend, backend, base de datos, autenticación de clientes y administradores, carrito de compras, flujo de compra simulado, sistema de filtros, y panel de administración para gestionar productos, pedidos, stock y ofertas.

---

## 3. Audiencia Objetivo

| Perfil | Descripción |
|--------|-------------|
| Dueños de mascotas | Personas que tienen perros, gatos, aves, peces u otras mascotas y compran productos regularmente |
| Usuarios particulares | Compradores individuales que buscan precios, variedad y comodidad |
| Dispositivos | PC, laptop, tablets y smartphones (responsive obligatorio) |

---

## 3.1 Roles del Sistema

| Rol | Descripción | Funcionalidades clave |
|-----|-------------|----------------------|
| **Cliente** | Usuario registrado que compra productos | Navegar catálogo, filtrar, carrito, checkout, historial de pedidos |
| **Administrador** | Dueño de la tienda que gestiona el negocio | CRUD productos, stock, pedidos, precios, ofertas, estadísticas, banners |

> El sistema se inicializa con un **usuario administrador por defecto** (seed en la base de datos). El admin puede cargar productos progresivamente sin necesidad de tener el catálogo completo desde el día uno.

---

## 4. Identidad Visual

> **Nota:** La paleta se extrajo del logotipo oficial de PawPets.

### Descripción del logotipo
Huella de mascota estilizada en azul, donde la almohadilla principal integra las siluetas minimalistas de un **perro y un gato entrelazados** mediante espacio negativo. Debajo, el nombre **PAW PETS** en mayúsculas con esquinas redondeadas: "PAW" en azul celeste y "PETS" en naranja cálido. Fondo blanco limpio y moderno.

### Personalidad de marca
- **Alegre, cálida, hogareña** — refleja la energía positiva que las mascotas traen.
- Colores vibrantes pero equilibrados, con un estilo moderno y limpio.

### Paleta de colores definitiva
| Elemento | Color | Código | Uso principal |
|----------|-------|--------|---------------|
| **Azul Principal** | ████████ | `#1573B6` | Huella, botones principales, headers, enlaces |
| **Azul Celeste** | ████████ | `#57C2D1` | Texto "PAW", acentos suaves, fondos de sección |
| **Naranja** | ████████ | `#E28A37` | Texto "PETS", CTAs, badges de ofertas, hover states |
| **Fondo** | ████████ | `#FFFFFF` | Fondo general, tarjetas de producto |
| **Texto** | ████████ | `#1F2937` | Cuerpo de texto, títulos |

### Aplicación de color por contexto
| Contexto | Color |
|----------|-------|
| Navbar / Header | Fondo blanco, logo con colores originales |
| Botón "Comprar" / CTA principal | Naranja `#E28A37` |
| Botón "Agregar al carrito" | Azul Principal `#1573B6` |
| Enlaces y hover | Azul Principal `#1573B6` |
| Badges (descuentos, ofertas) | Naranja `#E28A37` |
| Fondos alternos de secciones | Azul Celeste `#57C2D1` al 10-15% de opacidad |
| Footer | Azul Principal `#1573B6` con texto blanco |
| Errores / validaciones | Rojo estándar (a definir) |
| Éxito / confirmaciones | Verde (a definir) |

### Tipografía

| Elemento | Fuente | Variante | Uso |
|----------|--------|----------|-----|
| **Títulos** | Nunito | Bold / ExtraBold | Títulos de sección, nombre de producto |
| **Cuerpo** | Nunito | Regular / Medium | Descripciones, precios, texto general |
| **Botones** | Nunito | Semibold | CTAs, enlaces, badges |

> **Nunito** es una fuente sans-serif con curvas suaves y redondeadas, ideal para transmitir calidez y cercanía sin perder legibilidad profesional. Se carga desde Google Fonts via `next/font`.

---

## 5. Stack Tecnológico

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Framework | **Next.js 14+** (App Router) | SSR para SEO, routing nativo, API routes, ideal para e-commerce |
| Lenguaje | **TypeScript** | Tipado estático, menos bugs en producción |
| Estilos | **Tailwind CSS** | Utility-first, responsive nativo, rapidez de desarrollo |
| Base de datos | **PostgreSQL** via **Prisma** ORM | Relacional, migraciones tipadas, consultas seguras |
| Autenticación | **NextAuth.js** (Auth.js) | Integración nativa con Next.js, soporta múltiples providers |
| Pasarela de pago | **Simulada** (modo desarrollo/transparente) | Sin integración real, flujo de compra ficticio |
| Estado global | **Zustand** o React Context | Ligero, suficiente para el alcance |
| Hosting | **Vercel** (ideal para Next.js) | Despliegue simple, CI/CD automático |

---

## 6. Arquitectura de Información — Categorías

El catálogo se organiza en una **taxonomía de 2 niveles**: categorías principales → subcategorías.

| Categoría | Subcategorías (ejemplos) |
|-----------|-------------------------|
| **Perros** | Alimentos, Juguetes, Camas, Ropa, Accesorios de paseo, Trastes e Higiene |
| **Gatos** | Alimentos, Juguetes, Camas, Ropa, Trastes, Higiene, Transportadores |
| **Aves** | Jaulas, Alimentos, Accesorios, Salud |
| **Peces** | Alimentos, Acuarios, Filtros, Salud, Decoración |
| **Roedores** | Alimentos, Jaulas, Accesorios, Juguetes |
| **Salud General** | Medicamentos, Vitaminas, Cuidado bucal, Antipulgas (para todas las mascotas) |
| **Accesorios Generales** | Transportadores, Comederos/Bebederos, Juguetes multi-especie |

> 💡 **Decisión:** La navegación principal muestra las categorías por **tipo de mascota** (Perros, Gatos, Aves, Peces, Roedores) y dentro de cada una se filtran por tipo de producto. Además, una sección "Salud" transversal.

---

## 7. Requisitos Funcionales

### 7.1 Catálogo y Productos
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| F1 | Listar productos por categoría y subcategoría | Alta |
| F2 | Página de detalle de producto (imagen, descripción, precio, stock) | Alta |
| F3 | Búsqueda de productos por nombre | Alta |
| F4 | **Sistema de filtros combinables**: | **Alta** |
|    | F4a — Por **peso de la mascota** (ej: <5kg, 5-15kg, 15-30kg, >30kg) | |
|    | F4b — Por **edad/etapa de vida** (cachorro, adulto, senior) | |
|    | F4c — Por **tamaño** (pequeño, mediano, grande) | |
|    | F4d — Por **marca** | |
|    | F4e — Por **rango de precio** | |
| F5 | Imágenes de productos (galería simple) | Alta |

### 7.2 Carrito de Compras
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| F6 | Agregar/quitar productos del carrito | Alta |
| F7 | Modificar cantidades desde el carrito | Alta |
| F8 | Persistencia del carrito por sesión | Alta |
| F9 | Resumen del carrito con subtotal, envío y total | Alta |

### 7.3 Autenticación y Usuarios
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| F10 | Registro de usuario (nombre, email, contraseña) | Alta |
| F11 | Inicio de sesión (login) | Alta |
| F12 | Cierre de sesión | Alta |
| F13 | Perfil de usuario con datos personales | Media |

### 7.4 Checkout y Pagos
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| F14 | Flujo de checkout: datos de envío → resumen → pago | Alta |
| F15 | Pasarela de pago **simulada** (confirmación inmediata sin dinero real) | Alta |
| F16 | Confirmación de pedido post-compra | Alta |

### 7.5 Historial de Pedidos
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| F17 | Lista de pedidos realizados por el usuario | Alta |
| F18 | Detalle de cada pedido (productos, estado, total) | Alta |

### 7.6 Responsive
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| F19 | Diseño adaptativo: PC, laptop, tablet, celular | Alta |
| F20 | Navegación mobile-friendly (menú hamburguesa, etc.) | Alta |

### 7.7 Panel de Administración (Dashboard)
| # | Funcionalidad | Prioridad | Fase |
|---|--------------|-----------|------|
| F21 | **CRUD de productos** — crear, editar, eliminar productos desde el panel | Alta | MVP |
| F22 | **Gestión de stock** — ver y modificar cantidades disponibles | Alta | MVP |
| F23 | **Gestión de pedidos** — listar pedidos, cambiar estado entre: *pendiente*, *completado*, *cancelado* | Alta | MVP |
| F24 | **Modificar precios** desde el panel sin tocar base de datos directa | Alta | MVP |
| F25 | **Catálogo inicial vacío** — el admin carga productos progresivamente | Alta | MVP |
| F26 | **Ofertas y descuentos** — crear promociones con porcentaje o monto fijo | Media | Fase 2 |
| F27 | **Banner de captura de email** (lead magnet) — popup/banner en home y categorías: "Suscríbete para recibir ofertas" o "Ingresa tu email y obtén un cupón de descuento" | Media | Fase 2 |
| F28 | **Panel de estadísticas** — gráficos de ventas, productos más vendidos, ingresos por período | Media | Fase 2 |
| F29 | **Generar factura en PDF** por cada pedido completado | Baja | Fase 2 |

---

## 8. Requisitos No Funcionales

| # | Requisito | Descripción |
|---|-----------|-------------|
| NF1 | Rendimiento | Tiempo de carga inicial < 3s en 3G (gracias a SSR/SSG de Next.js) |
| NF2 | SEO | URLs amigables, meta tags, Open Graph, sitemap |
| NF3 | Accesibilidad | Navegación por teclado, contraste suficiente, alt text en imágenes |
| NF4 | Código limpio | ESLint, Prettier, estructura de carpetas clara |
| NF5 | Base de datos | Migraciones con Prisma, modelo de datos normalizado |

---

## 9. Flujo de Usuario

### 9.1 Happy Path — Cliente

```
Home → Navegar categoría → Ver producto → Agregar al carrito
  → Ver carrito → Checkout → Login/Registro (si no está logueado)
    → Datos de envío → Resumen → Pago simulado → Confirmación
```

### 9.2 Happy Path — Administrador

```
Login como admin → Dashboard → Gestión de productos (CRUD)
  → Cargar/editar productos con imágenes, precios, stock, categorías, filtros
  → Revisar pedidos entrantes → Cambiar estado (pendiente → completado / cancelado)
  → Opcional: crear ofertas, ver estadísticas, configurar banner de email
```

---

## 10. Estructura de Navegación Propuesta

### 10.1 Vista Cliente

```
[Logo] PAW PETS                    [Buscar...]  [🛒 Carrito]  [👤 Login]

Categorías:
  🐕 Perros    🐈 Gatos    🐦 Aves    🐟 Peces    🐹 Roedores    💊 Salud

Footer: Información | Ayuda | Redes sociales
```

### 10.2 Vista Administrador

```
[Logo] PAW PETS                                           [👑 Admin]

Panel de Administración:
  📦 Productos    📋 Pedidos    📊 Estadísticas    🏷️ Ofertas    ⚙️ Configuración

Acciones rápidas:
  ➕ Nuevo producto    📝 Pedidos pendientes    📈 Reportes
```

---

## 11. Roadmap por Fases

### Fase 1 — MVP (Mínimo Producto Viable)
> Funcionalidades esenciales para que la tienda funcione de punta a punta.

| # | Tarea | Estado |
|---|-------|--------|
| 1 | PRD aprobado | ✅ |
| 2 | Diseño visual — paleta de colores desde el logotipo | ✅ |
| 3 | Definir tipografía — **Nunito** seleccionada | ✅ |
| 4 | Crear prototipos / wireframes (páginas principales) | ⬜ |
| 5 | Configurar proyecto Next.js + Tailwind + Prisma | ⬜ |
| 6 | Modelar base de datos (Productos, Categorías, Usuarios, Pedidos) | ⬜ |
| 7 | **Panel admin**: seed de usuario administrador + CRUD de productos | ⬜ |
| 8 | Implementar catálogo + filtros + búsqueda | ⬜ |
| 9 | Implementar autenticación (cliente + admin) | ⬜ |
| 10 | Implementar carrito de compras | ⬜ |
| 11 | Implementar checkout + pago simulado | ⬜ |
| 12 | Implementar historial de pedidos (cliente) | ⬜ |
| 13 | **Panel admin**: gestión de pedidos (cambiar estado) + stock | ⬜ |
| 14 | Responsive y ajustes finales | ⬜ |

### Fase 2 — Post-MVP
> Funcionalidades que agregan valor pero no bloquean el lanzamiento.

| # | Tarea | Estado |
|---|-------|--------|
| 15 | Ofertas y descuentos desde el panel admin | ⬜ |
| 16 | Panel de estadísticas (ventas, productos top, ingresos) | ⬜ |
| 17 | Banner de captura de email / cupón de descuento | ⬜ |
| 18 | Generación de facturas en PDF por pedido | ⬜ |
| 19 | Mejoras UI/UX y refinamientos | ⬜ |

---

## 12. Glosario

| Término | Definición |
|---------|-----------|
| PRD | Product Requirements Document |
| SSR | Server-Side Rendering |
| SEO | Search Engine Optimization |
| ORM | Object-Relational Mapping |
| SKU | Stock Keeping Unit (identificador único de producto) |
| CRUD | Create, Read, Update, Delete — operaciones básicas de gestión de datos |
| MVP | Minimum Viable Product — versión con funcionalidades mínimas esenciales |

---

> **Documento creado:** 18 de junio de 2026
> **Próxima revisión:** post-aprobación del diseño visual
