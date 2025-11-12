/**
 * Sistema de internacionalización (i18n)
 * Carga y gestiona las traducciones desde archivos JSON
 */

class I18n {
    constructor() {
        this.translations = {};
        this.currentLang = localStorage.getItem('language') || 'es';
        this.loaded = false;
    }

    /**
     * Carga las traducciones desde un archivo JSON
     * @param {string} lang - Código del idioma (es, en, etc.)
     * @returns {Promise<Object>} - Objeto con las traducciones
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`/i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`No se pudo cargar las traducciones para ${lang}`);
            }
            const translations = await response.json();
            this.translations[lang] = translations;
            return translations;
        } catch (error) {
            console.error(`Error cargando traducciones para ${lang}:`, error);
            // Fallback: intentar cargar español si falla otro idioma
            if (lang !== 'es') {
                return this.loadTranslations('es');
            }
            throw error;
        }
    }

    /**
     * Inicializa el sistema i18n cargando las traducciones
     * @param {string} lang - Idioma inicial
     */
    async init(lang = null) {
        const targetLang = lang || this.currentLang;
        
        if (!this.translations[targetLang]) {
            await this.loadTranslations(targetLang);
        }
        
        this.loaded = true;
    }

    /**
     * Obtiene una traducción por su clave
     * @param {string} key - Clave de traducción (puede usar notación de punto para objetos anidados)
     * @param {string} lang - Idioma (opcional, usa el idioma actual por defecto)
     * @returns {string} - Texto traducido
     */
    t(key, lang = null) {
        const targetLang = lang || this.currentLang;
        const translations = this.translations[targetLang];
        
        if (!translations) {
            console.warn(`Traducciones no cargadas para ${targetLang}`);
            return key;
        }

        // Soporte para claves anidadas (ej: "snake.title")
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Clave de traducción no encontrada: ${key} en ${targetLang}`);
                return key;
            }
        }
        
        return typeof value === 'string' ? value : key;
    }

    /**
     * Cambia el idioma actual
     * @param {string} lang - Nuevo idioma
     */
    async setLanguage(lang) {
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }
        this.currentLang = lang;
        localStorage.setItem('language', lang);
    }

    /**
     * Obtiene el idioma actual
     * @returns {string} - Código del idioma actual
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Verifica si las traducciones están cargadas
     * @returns {boolean}
     */
    isLoaded() {
        return this.loaded;
    }
}

// Crear instancia global
const i18n = new I18n();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

