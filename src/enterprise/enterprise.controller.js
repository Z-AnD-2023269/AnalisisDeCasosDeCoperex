import Enterprise from "./enterprise.model.js";
import { enterpriseExists } from "../helpers/db-validators.js";

export const registerEnterprise = async (req, res) => {
    try {
        const { name, email, phone, address, website, impactLevel, foundingYear, category, description, socialMedia } = req.body;

        await enterpriseExists(email);

        const currentYear = new Date().getFullYear();
        if (foundingYear > currentYear) {
            return res.status(400).json({ msg: "El año de fundación no puede ser mayor al año actual." })
        }

        const yearsOfExperience = currentYear - foundingYear

        const newEnterprise = new Enterprise({
            name,
            email,
            phone,
            address,
            website,
            impactLevel,
            foundingYear,
            yearsOfExperience,
            category,
            description,
            socialMedia
        })

            await newEnterprise.save();
            res.status(201).json({ msg: "Empresa registrada exitosamente." })
    } catch (error) {
        res.status(500).json({ msg: "Error interno del servidor." })
    }
}
