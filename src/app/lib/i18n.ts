import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const i18n = i18next;

const resources = {
    es: {
        translation: {
            app: {
                title: "Catalog Front",
                description: "Next.js + Ant Design + Redux Toolkit (Prueba técnica)",
            },

            nav: {
                docsFront: "Docs Front",
                docsBack: "Docs Back",
                deploy: "Deploy",
                search: "Buscar",
                language: "Idioma",
                theme: "Tema",
                light: "Claro",
                dark: "Oscuro",
                login: "Login",
                logout: "Logout",
                products: "Productos",
                categories: "Categorías",
                goProducts: "Ir a productos",
            },

            docs: {
                frontTitle: "Documentación Front (MD)",
                backTitle: "Documentación Back (MD)",
                deployTitle: "Instrucciones de despliegue (MD)",
            },

            auth: {
                loginTitle: "Iniciar sesión",
                registerTitle: "Crear cuenta",
                email: "Correo",
                password: "Contraseña",
                fullName: "Nombre completo",
                emailRequired: "El correo es requerido",
                emailInvalid: "Correo inválido",
                passwordRequired: "La contraseña es requerida",
                minChars: "Mínimo {n} caracteres",
                fullNameRequired: "El nombre es requerido",

                cancel: "Cancelar",
                login: "Entrar",
                register: "Registrarme",

                successLogin: "Sesión iniciada",
                successRegister: "Cuenta creada",
                errorTitle: "Error de autenticación",
                needTokenTitle: "Debes iniciar sesión para consumir el catálogo.",
            },
            common: {
                actions: "Acciones",
                id: "ID",
                name: "Nombre",
                description: "Descripción",
                active: "Activo",
                yes: "Sí",
                no: "No",
                all: "Todos",
                refresh: "Refrescar",
                new: "Nuevo",
                edit: "Editar",
                delete: "Eliminar",
                save: "Guardar",
                cancel: "Cancelar",
                searchPlaceholder: "Buscar…",
                optional: "Opcional",
                open: "Abrir",
            },

            categories: {
                title: "Categorías",
                newTitle: "Nueva categoría",
                editTitle: "Editar categoría",
                deletedOk: "Categoría eliminada",
                updatedOk: "Categoría actualizada",
                createdOk: "Categoría creada",
                deleteConfirmTitle: "Eliminar categoría",
                deleteConfirmText: "¿Seguro que deseas eliminar la categoría #{id}? (soft delete)",
            },

            products: {
                title: "Productos",
                sku: "SKU",
                price: "Precio",
                stock: "Stock",
                category: "Categoría",
                import: "Importar (CSV/XLSX)",
                importTitle: "Carga masiva (CSV/XLSX)",
                importHelp: "Endpoint: {path} (multipart/form-data, campo {field})",
                selectFile: "Seleccionar archivo",
                uploadAndImport: "Subir e importar",
                importOk: "Importación OK • Insertados/actualizados: {n}",
                importErrorTitle: "Error importando",

                newTitle: "Nuevo producto",
                editTitle: "Editar producto",
                createdOk: "Producto creado",
                updatedOk: "Producto actualizado",
                deletedOk: "Producto eliminado",

                filters: {
                    allCategories: "Todas",
                    priceMin: "Precio mín",
                    priceMax: "Precio máx",
                    statusAll: "Todos",
                    statusActive: "Activos",
                    statusInactive: "Inactivos",
                    sortBy: "Ordenar por",
                    sortDir: "Dirección",
                    sortDate: "Fecha creación",
                    sortName: "Nombre",
                    sortPrice: "Precio",
                    asc: "Asc",
                    desc: "Desc",
                },

                deleteConfirmTitle: "Eliminar producto",
                deleteConfirmText: "¿Seguro que deseas eliminar el producto #{id}? (soft delete)",

                megaMenuTitle: "MegaMenu • Buscar productos y categorías",
                tabCategories: "Categorías",
                tabSearch: "Buscar",
                emptyNoMatches: "Sin coincidencias",
                typeToSearch: "Escribe para buscar",
                noProductsFor: "No hay productos para “{term}”",
                viewProducts: "Ver productos",
            },

            errors: {
                genericTitle: "Error",
                unknown: "Error desconocido",
            },
        },
    },

    en: {
        translation: {
            app: {
                title: "Catalog Front",
                description: "Next.js + Ant Design + Redux Toolkit (Technical test)",
            },

            nav: {
                docsFront: "Front Docs",
                docsBack: "Back Docs",
                deploy: "Deploy",
                search: "Search",
                language: "Language",
                theme: "Theme",
                light: "Light",
                dark: "Dark",
                login: "Login",
                logout: "Logout",
                products: "Products",
                categories: "Categories",
                goProducts: "Go to products",
            },

            docs: {
                frontTitle: "Front documentation (MD)",
                backTitle: "Back documentation (MD)",
                deployTitle: "Deployment instructions (MD)",
            },

            auth: {
                loginTitle: "Sign in",
                registerTitle: "Create account",
                email: "Email",
                password: "Password",
                fullName: "Full name",
                emailRequired: "Email is required",
                emailInvalid: "Invalid email",
                passwordRequired: "Password is required",
                minChars: "Minimum {n} characters",
                fullNameRequired: "Full name is required",

                cancel: "Cancel",
                login: "Sign in",
                register: "Sign up",

                successLogin: "Signed in",
                successRegister: "Account created",
                errorTitle: "Auth error",
                needTokenTitle: "You must sign in to consume the catalog.",
            },
            common: {
                actions: "Actions",
                id: "ID",
                name: "Name",
                description: "Description",
                active: "Active",
                yes: "Yes",
                no: "No",
                all: "All",
                refresh: "Refresh",
                new: "New",
                edit: "Edit",
                delete: "Delete",
                save: "Save",
                cancel: "Cancel",
                searchPlaceholder: "Search…",
                optional: "Optional",
                open: "Open",
            },

            categories: {
                title: "Categories",
                newTitle: "New category",
                editTitle: "Edit category",
                deletedOk: "Category deleted",
                updatedOk: "Category updated",
                createdOk: "Category created",
                deleteConfirmTitle: "Delete category",
                deleteConfirmText: "Are you sure you want to delete category #{id}? (soft delete)",
            },

            products: {
                title: "Products",
                sku: "SKU",
                price: "Price",
                stock: "Stock",
                category: "Category",
                import: "Import (CSV/XLSX)",
                importTitle: "Bulk import (CSV/XLSX)",
                importHelp: "Endpoint: {path} (multipart/form-data, field {field})",
                selectFile: "Select file",
                uploadAndImport: "Upload & import",
                importOk: "Import OK • Upserted: {n}",
                importErrorTitle: "Import error",

                newTitle: "New product",
                editTitle: "Edit product",
                createdOk: "Product created",
                updatedOk: "Product updated",
                deletedOk: "Product deleted",

                filters: {
                    allCategories: "All",
                    priceMin: "Min price",
                    priceMax: "Max price",
                    statusAll: "All",
                    statusActive: "Active",
                    statusInactive: "Inactive",
                    sortBy: "Sort by",
                    sortDir: "Direction",
                    sortDate: "Created date",
                    sortName: "Name",
                    sortPrice: "Price",
                    asc: "Asc",
                    desc: "Desc",
                },

                deleteConfirmTitle: "Delete product",
                deleteConfirmText: "Are you sure you want to delete product #{id}? (soft delete)",

                megaMenuTitle: "MegaMenu • Search products and categories",
                tabCategories: "Categories",
                tabSearch: "Search",
                emptyNoMatches: "No matches",
                typeToSearch: "Type to search",
                noProductsFor: "No products for “{term}”",
                viewProducts: "View products",
            },

            errors: {
                genericTitle: "Error",
                unknown: "Unknown error",
            },
        },
    },
};

export function initI18n() {
    if (i18n.isInitialized) return;

    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: "es",
            interpolation: { escapeValue: false },
            detection: {
                order: ["localStorage", "navigator"],
                caches: ["localStorage"],
            },
        });
}
