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
