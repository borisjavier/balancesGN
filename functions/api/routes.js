const express = require('express')
const bodyParser = require('body-parser')

function buildRoutes (tokenManager, logger) {
    const app = express()
    app.use(bodyParser.json())

    app.post('/balance', async (req, res) => {
        const body = req.body
        const ownerAddress = body.ownerAddress
        res.json(await tokenManager.balance(ownerAddress))
    })

    app.post('/send', async (req, res) => {
        throw new Error('not implemented yer')
    })

    return app
}

module.exports = { buildRoutes }