`use strict`

import { hash, verify } from "argon2"
import Admin from "../admin/admin.model.js"
import { generateJWT } from "../helpers/generate-jwt.js"

export const register = async (req, res) => {
    try {
        const data = req.body;
        const encryptedPassword = await hash(data.password)
        data.password = encryptedPassword

        const admin = await Admin.create(data)

        return res.status(201).json({
            message: "Se ha registrado el administradorn exitosamente",
            name: admin.name,
            email: admin.email
        })
    } catch (err) {
        return res.status(500).json({
            message: "Error en el registro del administrador",
            error: err.message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try{
        const admin = await Admin.findOne({
            $or:[{email: email}]
        })

        if(!admin){
            return res.status(400).json({
                message: "Crendenciales inválidas",
                error:"No existe el usuario o correo ingresado"
            })
        }

        const validPassword = await verify(admin.password, password)

        if(!validPassword){
            return res.status(400).json({
                message: "Crendenciales inválidas",
                error: "Contraseña incorrecta"
            })
        }

        const token = await generateJWT(admin.id)

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            userDetails: {
                token: token,
            }
        })
    }catch(err){
        return res.status(500).json({
            message: "Error de inicio de sesión, error del servidor",
            error: err.message
        })
    }
}