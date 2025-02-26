`use strict`

import Enterprise from "./enterprise.model.js";
import { enterpriseExists } from "../helpers/db-validators.js";

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