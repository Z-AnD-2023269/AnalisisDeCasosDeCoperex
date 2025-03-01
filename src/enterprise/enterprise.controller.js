`use strict`

import Enterprise from "./enterprise.model.js";
import { enterpriseExists } from "../helpers/db-validators.js";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerEnterprise = async (req, res) => {
    try {
        const data = req.body;

        await enterpriseExists(data.email)

        const currentYear = new Date().getFullYear()
        if (data.foundingYear > currentYear) {
            return res.status(400).json({ msg: "El año de fundación no puede ser mayor al año actual." })
        }

        data.yearsOfExperience = currentYear - data.foundingYear;

        const newEnterprise = await Enterprise.create(data)
        
        res.status(201).json({
            msg: "Empresa registrada exitosamente.",
            enterprise: {
                name: newEnterprise.name,
                email: newEnterprise.email,
                address: newEnterprise.address,
                website: newEnterprise.website,
                impactLevel: newEnterprise.impactLevel,
                foundingYear: newEnterprise.foundingYear,
                yearsOfExperience: newEnterprise.yearsOfExperience,
                category: newEnterprise.category,
                description: newEnterprise.description
            }
        })
    } catch (error) {
        res.status(500).json({ msg: "Error interno del servidor." })
    }
}

/**
 * @description Obtiene la lista de empresas con filtros opcionales y ordenamiento.
 * @route GET /CoperexCaseAnalysis/v1/enterprise/list
 * @queryParam {string} [category] - Filtra por categoría de empresa.
 * @queryParam {string} [impactLevel] - Filtra por nivel de impacto (Alto, Medio, Bajo).
 * @queryParam {number} [yearsOfExperience] - Filtra empresas con al menos X años de experiencia.
 * @queryParam {string} [sort] - Ordena los resultados (name{A-Z}, name{Z-A}, experience).
 * @queryParam {number} [limite=10] - Número máximo de empresas a devolver.
 * @queryParam {number} [desde=0] - Índice desde donde empezar la paginación.
 * @returns {Object[]} enterprises - Lista de empresas filtradas y ordenadas.
 */
export const getEnterprises = async (req, res) => {
    try {
        const { category, impactLevel, yearsOfExperience, sort, limite = 15, desde = 0 } = req.query;
        let query = {}

        if (category) query.category = category
        if (impactLevel) query.impactLevel = impactLevel
        // $gte: Es un operador de MongoDB que significa "mayor o igual que".
        if (yearsOfExperience) query.yearsOfExperience = { $gte: Number(yearsOfExperience) }

        /*
        sort: Es un parámetro de la consulta que determina cómo ordenar los resultados. Dependiendo de su valor, se asigna una opción de ordenación:
        Si sort === "nameAZ", las empresas se ordenan alfabéticamente de A a Z por su nombre (sortOptions.name = 1).
        Si sort === "nameZA", las empresas se ordenan de Z a A por su nombre (sortOptions.name = -1).
        Si sort === "experience", las empresas se ordenan por su año de fundación de menor a mayor (sortOptions.foundingYear = 1).
        sortOptions: Es un objeto que contiene las opciones de ordenamiento para la consulta de MongoDB. Dependiendo del valor del parámetro sort, 
        se ajusta el objeto sortOptions con las claves adecuadas y los valores correspondientes (1 para ascendente, -1 para descendente).
        */
        let sortOptions = {};
        if (sort === "nameAZ") sortOptions.name = 1;
        if (sort === "nameZA") sortOptions.name = -1;
        if (sort === "experience") sortOptions.foundingYear = 1;

        let enterprises = await Enterprise.find(query)
            .sort(sortOptions)
            .skip(Number(desde))
            .limit(Number(limite));

        //.map: Es un método de JavaScript que se usa para crear un nuevo array con los resultados de aplicar una función a cada elemento de un array.
        enterprises = enterprises.map((enterprise) => {
            const currentYear = new Date().getFullYear()
            const yearsOfExperience = currentYear - enterprise.foundingYear;
            return {
                name: enterprise.name,
                email: enterprise.email,
                address: enterprise.address,
                website: enterprise.website,
                impactLevel: enterprise.impactLevel,
                foundingYear: enterprise.foundingYear,
                yearsOfExperience,
                category: enterprise.category,
                description: enterprise.description
            }
        })

        res.status(200).json({ enterprises })
    } catch (error) {
        res.status(500).json({ msg: "Error interno del servidor." })
    }
}

export const updateEnterprise = async (req,res) =>{
    try {
        const {uid} = req.params
        const data = req.body

        const updatedEnterprise= await Enterprise.findByIdAndUpdate(uid, data, { new: true })

        res.status(200).json({
            success: true,
            msg: 'Empresa actualizada',
            enterprise: updatedEnterprise,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Error al intentar actualizar Enterprise',
            error: err.message
        })
    }
}

/**
 * @description Genera un reporte en formato Excel con las empresas registradas, permitiendo aplicar filtros y ordenamiento.
 * @route GET /CoperexCaseAnalysis/v1/enterprise/generateReport
 * @queryParam {string} [category] - Filtra por categoría de empresa.
 * @queryParam {string} [impactLevel] - Filtra por nivel de impacto (Alto, Medio, Bajo).
 * @queryParam {number} [yearsOfExperience] - Filtra empresas con al menos X años de experiencia.
 * @queryParam {string} [sort] - Ordena los resultados (name{A-Z}, name{Z-A}, experience).
 * @returns {string} downloadUrl - URL de descarga del archivo generado.
 */
export const generateEnterpriseReport = async (req, res) => {
    try {
        const { category, impactLevel, yearsOfExperience, sort } = req.query;

        let query = {};
        if (category) query.category = category;
        if (impactLevel) query.impactLevel = impactLevel;
        if (yearsOfExperience) query.yearsOfExperience = { $gte: Number(yearsOfExperience) };

        let sortOptions = {};
        if (sort === "nameAZ") sortOptions.name = 1;
        if (sort === "nameZA") sortOptions.name = -1;
        if (sort === "experience") sortOptions.foundingYear = 1;

        let enterprises = await Enterprise.find(query).sort(sortOptions)

        /**
         * @description Define la ruta donde se almacenarán los reportes generados en Excel.
         * @constant {string} reportDir - Ruta absoluta de la carpeta de reportes.
         * @example
         * // Si el proyecto está en "C:.../AnalisisDeCasosDeCoperex/"
         * console.log(reportDir);
         * // Output: "C:.../AnalisisDeCasosDeCoperex/src/reportGeneration"
         */
        const reportDir = path.join(__dirname, "../reportGeneration")

        /**
         * @description Comprueba si la carpeta `reportGeneration` existe y, si no, la crea.
         * @function fs.existsSync
         * @param {string} reportDir - Ruta del directorio a verificar.
         * @returns {boolean} - `true` si la carpeta existe, `false` si no.
         *
         * @function fs.mkdirSync
         * @param {string} reportDir - Ruta del directorio a crear.
         * @param {object} options - `{ recursive: true }` permite crear directorios anidados si no existen.
         *
         * @example
         * if (!fs.existsSync(reportDir)) {
         *     fs.mkdirSync(reportDir, { recursive: true });
         * }
         */
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        let fileName = "enterprises";
        if (sort === "nameAZ") fileName += "_AZ";
        if (sort === "nameZA") fileName += "_ZA";
        if (sort === "experience") fileName += "_Experience";
        if (category) fileName += `_Category_${category}`;
        if (impactLevel) fileName += `_Impact_${impactLevel}`;
        fileName += ".xlsx";

        /**
         * @description Combina el directorio del informe (`reportDir`) con el nombre del archivo (`fileName`) 
         * para obtener la ruta completa del archivo a procesar.
         * @function path.join
         * @param {string} reportDir - Ruta del directorio donde se encuentra el archivo.
         * @param {string} fileName - Nombre del archivo a incluir en la ruta.
         * @returns {string} - La ruta completa del archivo generado combinando el directorio y el nombre del archivo.
         *
         * @example
         * const filePath = path.join(reportDir, fileName);
         * // Devuelve la ruta completa como una cadena, por ejemplo: '/path/to/report/file.txt'
         */
        const filePath = path.join(reportDir, fileName)

        /**
         * @description Verifica si el archivo especificado por `filePath` existe y, si es así, lo elimina.
         * @function fs.existsSync
         * @param {string} filePath - Ruta del archivo a verificar.
         * @returns {boolean} - `true` si el archivo existe, `false` si no.
         *
         * @function fs.unlinkSync
         * @param {string} filePath - Ruta del archivo a eliminar.
         * @throws {Error} - Lanza un error si no se puede eliminar el archivo.
         *
         * @example
         * if (fs.existsSync(filePath)) {
         *     fs.unlinkSync(filePath);
         *     // Si el archivo existe, se elimina.
         * }
         */
        if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        }

        /**
         * @description Crea un nuevo libro de trabajo de Excel y agrega una hoja con el nombre "Empresas".
         * @constructor ExcelJS.Workbook
         * @returns {ExcelJS.Workbook} - Una nueva instancia de un libro de trabajo de Excel.
         *
         * @function workbook.addWorksheet
         * @param {string} sheetName - Nombre de la hoja que se añadirá al libro de trabajo.
         * @returns {ExcelJS.Worksheet} - La hoja añadida al libro de trabajo.
         *
         * @example
         * const workbook = new ExcelJS.Workbook();
         * const worksheet = workbook.addWorksheet("Empresas");
         * // Crea un libro de trabajo y una hoja con el nombre "Empresas".
         */
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Empresas")

        worksheet.columns = [
            { header: "Nombre", key: "name", width: 30 },
            { header: "Email", key: "email", width: 30 },
            { header: "Dirección", key: "address", width: 40 },
            { header: "Sitio Web", key: "website", width: 30 },
            { header: "Nivel de Impacto", key: "impactLevel", width: 15 },
            { header: "Año de Fundación", key: "foundingYear", width: 15 },
            { header: "Años de Experiencia", key: "yearsOfExperience", width: 20 },
            { header: "Categoría", key: "category", width: 20 },
            { header: "Descripción", key: "description", width: 50 }
        ]

        enterprises.forEach((enterprise) => {
            worksheet.addRow({
                name: enterprise.name,
                email: enterprise.email,
                address: enterprise.address,
                website: enterprise.website,
                impactLevel: enterprise.impactLevel,
                foundingYear: enterprise.foundingYear,
                yearsOfExperience: new Date().getFullYear() - enterprise.foundingYear,
                category: enterprise.category,
                description: enterprise.description
            })
        })

        /**
         * @description Guarda el libro de trabajo (`workbook`) como un archivo Excel en la ruta especificada por `filePath`.
         * @function workbook.xlsx.writeFile
         * @param {string} filePath - Ruta completa donde se guardará el archivo Excel.
         * @returns {Promise} - Una promesa que se resuelve cuando el archivo se ha guardado correctamente.
         *
         * @example
         * await workbook.xlsx.writeFile(filePath);
         * // Guarda el libro de trabajo en la ruta `filePath` como un archivo Excel (.xlsx).
         */
        await workbook.xlsx.writeFile(filePath)

        res.status(200).json({
            msg: "Reporte generado exitosamente.",
            downloadUrl: `http://127.0.0.1:3000/CoperexCaseAnalysis/v1/enterprise/reports/${fileName}`
        })
    } catch (error) {
        res.status(500).json({ msg: "Error interno del servidor." })
    }
}

