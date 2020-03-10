const sendgrid = require('@sendgrid/mail')

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeEmail = (email, name) => {
    sendgrid.send({
        to: email,
        from: 'diovane.rossato@acad.pucrs.br',
        subject: 'Thanks for joinig in!',
        text: `Welcome to Instagram Clone, ${name}. Let me know how you get along with the app.`
    })
}

const cancelationEmail = (email, name) => {
    sendgrid.send({
        to: email,
        from: 'diovane.rossato@acad.pucrs.br',
        subject: `Good Bye, ${name}`,
        text: 'Is there anything we could have done to let you stay on board?'
    })
}

module.exports = { cancelationEmail, welcomeEmail }