const nodemailer = require('nodemailer')
const logger = require('./logger')

const emailSenderModule = (typeOfUser, email, rawPIN) => {
    logger.info(`this is the info from bank: ${email}`)
    const interestedUsersMessage = `Hola ${email}. Gracias por estar interesado en sh3ck`
    const usersMessage = `Hola ${email}. Gracias por registrarte en sh3ck. 
    Hemos generado el #PIN: ${rawPIN} para que ppuedas entrar. 
    `
    const checkersMessage = `Hola ${email}. Gracias por registrarte como chequeador en Sh3ck. 
    Hemos generado el #PIN: ${rawPIN} para que puedas entrar para ver tus chequeos asignados. 
    `
    const newPINMessage = `Hola ${email}. Hemos generado este nuevo #PIN: ${rawPIN} para que puédas entrar y
    disfrutar de nuesto servicio de chequeos, vé e inicia sesión. 
    `
    const usersBankMessage = `Hola ${email.fullName}. Hemos recibido tu pago:
    Los datos son los suigientes:
    Código cuenta cliente debitada Nro: ${email.account_number}
    Monto transferido: ${email.amount}$
    REF: ${email.reference_number}
    fecha: ${email.date}
    `
    const sh3ckBankMessage = 
    `BANESCO REGISTRO: Pago 
    recibido a través de pago 
    Móvil de ${email.fullName} por
    Bs. ${email.amount} 
    fecha: ${email.date}
    REF: ${email.reference_number}. Para más inf.
    llama al +582123451111 
    `

   
        
    const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: 'alvarez.arnoldo@gmail.com',
                pass: '26171241111'
            }
        })
    
    

        if (typeOfUser === 'users'){
            const mailOptions = {
            from: 'alvarez.arnoldo@gmail.com',
            to: `${email}`,
            subject: 'Bienvenido nuevo usuario',
            text: usersMessage
            }
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    logger.error(error)
                }else{
                    logger.info(`Email was sent with this response: [${info.response}]`)
                }
            })
            return 
        }
        if (typeOfUser === 'user_new_PIN'){
            const mailOptions = {
            from: 'alvarez.arnoldo@gmail.com',
            to: `${email}`,
            subject: 'Bienvenido nuevo usuario',
            text: newPINMessage
            }
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    logger.error(error)
                }else{
                    logger.info(`Email was sent with this response: [${info.response}]`)
                }
            })
            return 
        }
        
        if (typeOfUser === 'checkers'){
            const mailOptions = {
            from: 'alvarez.arnoldo@gmail.com',
            to: `${email}`,
            subject: 'Bienvenido nuevo chequeador',
            text: checkersMessage
            }
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    logger.error(error)
                }else{
                    logger.info(`Email was sent with this response: [${info.response}]`)
                }
            })
            return 
        }
        if (typeOfUser === 'interestedUsers'){
            const mailOptions = {
            from: 'alvarez.arnoldo@gmail.com',
            to: `${email}`,
            subject: 'Que bueno que estás interesado...',
            text: interestedUsersMessage
            }
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    logger.error(error)
                }else{
                    logger.info(`Email was sent with this response: [${info.response}]`)
                }
            })
            return 
        }

        if (typeOfUser === 'userFromBank'){
            const mailOptions = {
            from: 'alvarez.arnoldo@gmail.com',
            to: `${email.email}`,
            subject: 'Confirmación Banesco',
            text: usersBankMessage
            }
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    logger.error(error)
                }else{
                    logger.info(`Email was sent with this response: [${info.response}]`)
                }
            })
            return 
        }
        if (typeOfUser === 'sh3ckFromBank'){
            const mailOptions = {
            from: 'alvarez.arnoldo@gmail.com',
            to: `${email.sh3ck_email}`,
            subject: 'Banesco Registro',
            text: sh3ckBankMessage
            }
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    logger.error(error)
                }else{
                    logger.info(`Email was sent with this response: [${info.response}]`)
                }
            })
            return 
        }
        
        // const mailOptions = {
        //     from: 'alvarez.arnoldo@gmail.com',
        //     to: `${email}`,
        //     subject: 'Testing emails from BackEnd',
        //     text: `${source === 'interestedUsers' ? interestedUserMessage : userMessage}`
        // }
    
//         transporter.sendMail(mailOptions, function(error, info) {
//             if(error) {
//                 logger.error(error)
//             }else{
//                 logger.info(`Email was sent with this response: [${info.response}]`)
//             }
//         })
// }
}
module.exports = {
    emailSenderModule
}

