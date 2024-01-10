const express = require('express')
const bodyParser = require('body-parser')
const { Address } = require("@runonbitcoin/nimble")
const handle = require('express-async-handler')
const { buildErrorHandler } = require("./error-handler")
const { GnError } = require("../model/gn-error")

function buildRoutes (tokenManager, logger) {
    const app = express()
    app.use(bodyParser.json())

    app.post('/balance', handle(async (req, res) => {
        const body = req.body
        const ownerAddress = body.ownerAddress

        if (!ownerAddress) {
            throw new GnError('missing address', 400)
        }

        const address = Address.fromString(ownerAddress)
        res.json(await tokenManager.balance(address))
    }))

    app.post('/send', async (req, res) => {
        const {

        } = req.body

        throw new Error('not implemented yer')
    })

    app.use(buildErrorHandler(logger))

    return app
}

module.exports = { buildRoutes }